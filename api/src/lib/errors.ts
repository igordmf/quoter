import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

const sharedDir = join(dirname(fileURLToPath(import.meta.url)), '../../../shared');
const quote = JSON.parse(readFileSync(join(sharedDir, 'quote.json'), 'utf8')) as { ttlMs: number };
export const QUOTE_TTL_MS = quote.ttlMs;
