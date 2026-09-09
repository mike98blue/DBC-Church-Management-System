import { createHmac } from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { StripeAdapter } from './stripe.adapter.js';

describe('StripeAdapter webhook verification', () => {
  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    process.env.NODE_ENV = 'test';
  });

  it('accepts a valid recent signature', () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    const body = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' });
    const timestamp = Math.floor(Date.now() / 1000);
    const digest = createHmac('sha256', 'whsec_test').update(`${timestamp}.${body}`).digest('hex');

    expect(new StripeAdapter().verifyWebhook(body, `t=${timestamp},v1=${digest}`)).toMatchObject({
      id: 'evt_1',
    });
  });

  it('rejects an invalid signature', () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    const body = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' });
    const timestamp = Math.floor(Date.now() / 1000);

    expect(() => new StripeAdapter().verifyWebhook(body, `t=${timestamp},v1=invalid`)).toThrow(
      'Invalid Stripe signature',
    );
  });

  it('rejects unsigned webhooks outside local development', () => {
    process.env.NODE_ENV = 'production';
    const body = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' });

    expect(() => new StripeAdapter().verifyWebhook(body, null)).toThrow(
      'Stripe webhook secret is required outside development',
    );
  });
});
