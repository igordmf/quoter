import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { AppError, QUOTE_TTL_MS } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

export const exchangesRouter = Router();

const confirmSchema = z.object({
  clientQuoteId: z.uuid(),
  destinationCurrencyCode: z.string().min(1),
  quantity: z.string().regex(/^\d+(\.\d+)?$/, 'Quantity must be a positive number.'),
  unitPriceBrl: z.string().regex(/^\d+(\.\d+)?$/),
  totalPriceBrl: z.string().regex(/^\d+(\.\d+)?$/),
  quotedAt: z.iso.datetime(),
});

exchangesRouter.get('/exchanges', requireAuth, async (req, res, next) => {
  try {
    const rows = await prisma.userExchange.findMany({
      where: { userId: (req as AuthedRequest).auth.userId },
      orderBy: { datetime: 'desc' },
      include: { currency: true },
    });

    res.json({
      exchanges: rows.map((row) => ({
        id: row.id,
        destinationCurrencyCode: row.destinationCurrencyCode,
        currencyName: row.currency.currencyName,
        quantity: row.quantity.toString(),
        unitPriceBrl: row.unitPriceBrl.toString(),
        totalPriceBrl: row.totalPriceBrl.toString(),
        datetime: row.datetime.toISOString(),
      })),
    });
  } catch (error) {
    next(error);
  }
});

exchangesRouter.post('/exchanges', requireAuth, async (req, res, next) => {
  try {
    const parsed = confirmSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        400,
        'invalid_quote',
        parsed.error.issues[0]?.message ?? 'The quote payload is invalid.',
      );
    }

    const data = parsed.data;
    const quantity = Number(data.quantity);
    if (!(quantity > 0)) {
      throw new AppError(400, 'invalid_quantity', 'Quantity must be greater than zero.');
    }
    const quotedAt = new Date(data.quotedAt);
    const ageMs = Date.now() - quotedAt.getTime();
    if (Number.isNaN(quotedAt.getTime()) || ageMs > QUOTE_TTL_MS || ageMs < -1000) {
      throw new AppError(
        409,
        'quote_expired',
        'This quote expired. Create a new quote to continue.',
      );
    }

    const currency = await prisma.currency.findUnique({
      where: { code: data.destinationCurrencyCode },
    });
    if (!currency) {
      throw new AppError(400, 'unknown_currency', 'That destination currency is not available.');
    }

    try {
      const created = await prisma.userExchange.create({
        data: {
          userId: (req as AuthedRequest).auth.userId,
          destinationCurrencyCode: currency.code,
          quantity: new Prisma.Decimal(data.quantity),
          unitPriceBrl: new Prisma.Decimal(data.unitPriceBrl),
          totalPriceBrl: new Prisma.Decimal(data.totalPriceBrl),
          clientQuoteId: data.clientQuoteId,
          datetime: new Date(),
        },
        include: { currency: true },
      });

      res.status(201).json({
        exchange: {
          id: created.id,
          destinationCurrencyCode: created.destinationCurrencyCode,
          currencyName: created.currency.currencyName,
          quantity: created.quantity.toString(),
          unitPriceBrl: created.unitPriceBrl.toString(),
          totalPriceBrl: created.totalPriceBrl.toString(),
          datetime: created.datetime.toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(
          409,
          'already_confirmed',
          'This quote was already confirmed. Check your history.',
        );
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
});
