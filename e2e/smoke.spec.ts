import { test, expect } from '@playwright/test';

test('protected people endpoint rejects anonymous requests', async ({ request }) => {
  const res = await request.get('/api/v1/people');
  expect(res.status()).toBe(403);
});

test('protected giving endpoint rejects anonymous requests', async ({ request }) => {
  const res = await request.get('/api/v1/giving/funds');
  expect(res.status()).toBe(403);
});

test('health endpoint remains reachable without authentication', async ({ request }) => {
  const res = await request.get('/healthz');
  expect(res.status()).toBe(200);
});
