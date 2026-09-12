import { Router } from 'express';
import { DEST_CURRENCY_ORDER } from '../lib/catalog.js';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const currenciesRouter = Router();

currenciesRouter.get('/currencies', requireAuth, async (_req, res, next) => {
  try {
    const currencies = await prisma.currency.findMany();
    currencies.sort((a, b) => DEST_CURRENCY_ORDER.indexOf(a.code) - DEST_CURRENCY_ORDER.indexOf(b.code));
    res.json({ currencies });
  } catch (error) {
    next(error);
  }
});
