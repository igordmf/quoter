import { execSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = mkdtempSync(join(tmpdir(), 'quoter-api-'));

process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = `file:${join(dir, 'test.db')}`;

const env = { ...process.env };
execSync('npx prisma migrate deploy', { cwd: apiRoot, env, stdio: 'inherit' });
execSync('npx prisma db seed', { cwd: apiRoot, env, stdio: 'inherit' });
