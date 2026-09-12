import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../middleware/auth.js';

export const loginRouter = Router();

const bodySchema = z.object({
  username: z.string().trim().min(1, 'Enter a username.'),
});

loginRouter.post('/login', async (req, res, next) => {
  try {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, 'invalid_username', parsed.error.issues[0]?.message ?? 'Enter a username.');
    }

    const user = await prisma.user.findUnique({
      where: { name: parsed.data.username.toLowerCase() },
    });

    if (!user) {
      throw new AppError(
        401,
        'unknown_user',
        'user does not exist',
      );
    }

    const token = signToken({ userId: user.id, name: user.name });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        spread: user.spread.toString(),
      },
    });
  } catch (error) {
    next(error);
  }
});
