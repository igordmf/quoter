import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

const app = createApp();

afterAll(async () => {
  await prisma.$disconnect();
});

async function loginAs(username: string) {
  const res = await request(app).post('/login').send({ username });
  expect(res.status).toBe(200);
  return res.body.token as string;
}

function quoteBody(overrides: Record<string, unknown> = {}) {
  return {
    clientQuoteId: randomUUID(),
    destinationCurrencyCode: 'MXN',
    quantity: '100',
    unitPriceBrl: '0.31',
    totalPriceBrl: '31.44',
    quotedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('POST /login', () => {
  it('returns a token for alice', async () => {
    const res = await request(app).post('/login').send({ username: 'alice' });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ name: 'alice', spread: '0' });
  });

  it('rejects an unknown user', async () => {
    const res = await request(app).post('/login').send({ username: 'nobody' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ code: 'unknown_user', message: 'user does not exist' });
  });

  it('rejects an empty username', async () => {
    const res = await request(app).post('/login').send({ username: '' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('invalid_username');
  });
});

describe('GET /me', () => {
  it('requires a bearer token', async () => {
    const res = await request(app).get('/me');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('unauthorized');
  });

  it('returns the signed-in user', async () => {
    const token = await loginAs('alice');
    const res = await request(app).get('/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ name: 'alice', spread: '0' });
  });
});

describe('GET /currencies', () => {
  it('requires auth', async () => {
    const res = await request(app).get('/currencies');
    expect(res.status).toBe(401);
  });

  it('lists destination currencies', async () => {
    const token = await loginAs('alice');
    const res = await request(app).get('/currencies').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const codes = (res.body.currencies as Array<{ code: string }>).map((row) => row.code);
    expect(codes).toEqual(['EUR', 'ARS', 'COP', 'MXN', 'ZAR']);
  });
});

describe('exchanges', () => {
  it('starts empty, confirms once, and hides rows from other users', async () => {
    const alice = await loginAs('alice');
    const empty = await request(app).get('/exchanges').set('Authorization', `Bearer ${alice}`);
    expect(empty.status).toBe(200);
    expect(empty.body.exchanges).toEqual([]);

    const body = quoteBody();
    const created = await request(app)
      .post('/exchanges')
      .set('Authorization', `Bearer ${alice}`)
      .send(body);
    expect(created.status).toBe(201);
    expect(created.body.exchange).toMatchObject({
      destinationCurrencyCode: 'MXN',
      quantity: '100',
      totalPriceBrl: '31.44',
    });

    const listed = await request(app).get('/exchanges').set('Authorization', `Bearer ${alice}`);
    expect(listed.body.exchanges).toHaveLength(1);
    expect(listed.body.exchanges[0].id).toBe(created.body.exchange.id);

    const bob = await loginAs('bob');
    const bobs = await request(app).get('/exchanges').set('Authorization', `Bearer ${bob}`);
    expect(bobs.body.exchanges).toEqual([]);
  });

  it('rejects a second confirm with the same clientQuoteId', async () => {
    const token = await loginAs('alice');
    const body = quoteBody();
    const first = await request(app).post('/exchanges').set('Authorization', `Bearer ${token}`).send(body);
    expect(first.status).toBe(201);
    const second = await request(app).post('/exchanges').set('Authorization', `Bearer ${token}`).send(body);
    expect(second.status).toBe(409);
    expect(second.body.code).toBe('already_confirmed');
  });

  it('rejects an expired quote', async () => {
    const token = await loginAs('alice');
    const quotedAt = new Date(Date.now() - 15_000).toISOString();
    const res = await request(app)
      .post('/exchanges')
      .set('Authorization', `Bearer ${token}`)
      .send(quoteBody({ quotedAt }));
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('quote_expired');
  });

  it('rejects an unknown destination currency', async () => {
    const token = await loginAs('alice');
    const res = await request(app)
      .post('/exchanges')
      .set('Authorization', `Bearer ${token}`)
      .send(quoteBody({ destinationCurrencyCode: 'USD' }));
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('unknown_currency');
  });
});
