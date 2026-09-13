import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { AppError } from './lib/errors.js';
import { prisma } from './lib/prisma.js';
import { requireAuth, type AuthedRequest } from './middleware/auth.js';
import { currenciesRouter } from './routes/currencies.js';
import { exchangesRouter } from './routes/exchanges.js';
import { loginRouter } from './routes/login.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/me', requireAuth, async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: (req as AuthedRequest).auth.userId } });
      if (!user) {
        throw new AppError(401, 'unauthorized', 'User was not found. Please sign in again.');
      }
      res.json({
        user: { id: user.id, name: user.name, spread: user.spread.toString() },
      });
    } catch (error) {
      next(error);
    }
  });

  app.use(loginRouter);
  app.use(currenciesRouter);
  app.use(exchangesRouter);

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof AppError) {
      res.status(error.status).json({ code: error.code, message: error.message });
      return;
    }

    console.error(error);
    res.status(500).json({
      code: 'unexpected_error',
      message: 'Something went wrong. Please try again in a moment.',
    });
  });

  return app;
}
