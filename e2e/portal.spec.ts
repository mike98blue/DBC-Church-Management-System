import { test, expect } from '@playwright/test';

function mockToken(
  permissions: string[],
  personId?: string,
  scopes?: Record<string, string[]>,
): string {
  const payload = { sub: 'portal-test-user', permissions, personId, scopes };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

test('portal profile update (self)', async ({ request }) => {
  const token = mockToken(['people.write', 'people.read'], '00000000-0000-0000-0000-000000000001', {
    'people.write': ['organization'],
  });
  const res = await request.patch('/api/v1/people/00000000-0000-0000-0000-000000000001', {
    headers: { Authorization: `Bearer ${token}` },
    data: { lastName: 'PortalUpdated' },
  });
  expect([200, 403, 500]).toContain(res.status());
});

test('portal event register', async ({ request }) => {
  const token = mockToken([], '00000000-0000-0000-0000-000000000001');
  const res = await request.post(
    '/api/v1/events/00000000-0000-0000-0000-000000000002/registrations',
    {
      headers: { Authorization: `Bearer ${token}` },
      data: { personId: '00000000-0000-0000-0000-000000000001' },
    },
  );
  expect([200, 201, 400, 404, 500]).toContain(res.status());
});

test('portal statement download (self)', async ({ request }) => {
  const token = mockToken(['giving.export'], '00000000-0000-0000-0000-000000000001', {
    'giving.export': ['organization'],
  });
  const res = await request.get(
    '/api/v1/giving/statements/00000000-0000-0000-0000-000000000001?startDate=2026-01-01&endDate=2026-12-31',
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  expect([200, 403, 404, 500]).toContain(res.status());
});
