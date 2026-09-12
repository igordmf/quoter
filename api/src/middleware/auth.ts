import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';

export type AuthPayload = { userId: string; name: string };

export type AuthedRequest = Request & { auth: AuthPayload };

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, 'config_error', 'Server is missing JWT configuration.');
  }
  return secret;
}

export function signToken(payload: AuthPayload) {
  return jwt.sign(payload, jwtSecret(), { expiresIn: '7d' });
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.header('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) {
      throw new AppError(401, 'unauthorized', 'Please sign in to continue.');
    }

    let payload: AuthPayload;
    try {
      payload = jwt.verify(token, jwtSecret()) as AuthPayload;
    } catch {
      throw new AppError(401, 'unauthorized', 'Your session expired. Please sign in again.');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new AppError(401, 'unauthorized', 'User was not found. Please sign in again.');
    }

    (req as AuthedRequest).auth = { userId: user.id, name: user.name };
    next();
  } catch (error) {
    next(error);
  }
}
