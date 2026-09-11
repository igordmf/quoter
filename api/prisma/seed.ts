import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = [
  { name: 'alice', spread: '0' },
  { name: 'bob', spread: '0.006' },
  { name: 'carol', spread: '0.01' },
];

const currencies = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../shared/currencies.json'), 'utf8'),
) as Array<{ code: string; currencyName: string }>;

async function main() {
  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: { currencyName: currency.currencyName },
      create: currency,
    });
  }

  for (const user of users) {
    await prisma.user.upsert({
      where: { name: user.name },
      update: { spread: user.spread },
      create: user,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
