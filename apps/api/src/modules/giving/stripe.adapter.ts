/**
 * Stripe adapter — isolated behind an interface so the provider can be swapped
 * (blueprint §6, §12). In production this calls Stripe's API; in dev/tests it
 * returns a mock Checkout Session without touching the network.
 *
 * PCI: ChurchOS never handles raw card data. We only create Checkout Sessions
 * and verify signed webhooks (blueprint §12, rules 1–4).
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
export interface CheckoutSessionParams {
  amountCents: number;
  currency: string;
  fundId: string;
  donorId?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
  amountCents: number;
  currency: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: { id: string; amount_total?: number; currency?: string; payment_status?: string };
  };
}

export class StripeAdapter {
  private readonly secretKey: string | null;
  private readonly webhookSecret: string | null;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY ?? null;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? null;
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession> {
    if (!this.secretKey) {
      const id = `cs_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return {
        id,
        url: `https://mock.stripe/checkout/${id}?fund=${params.fundId}`,
        amountCents: params.amountCents,
        currency: params.currency,
      };
    }
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(this.secretKey);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: params.currency,
      line_items: [
        {
          price_data: {
            currency: params.currency,
            product_data: { name: `Fund ${params.fundId}` },
            unit_amount: params.amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        fundId: params.fundId,
        ...(params.donorId ? { personId: params.donorId } : {}),
      },
    });
    if (!session.url) throw new Error('Stripe did not return a checkout URL');
    return {
      id: session.id,
      url: session.url,
      amountCents: params.amountCents,
      currency: params.currency,
    };
  }

  /**
   * Verify the Stripe webhook signature. In mock mode (no webhook secret),
   * we accept any payload with an `id` — but we still require an `id` for idempotency.
   * In production, this must call `stripe.webhooks.constructEvent`.
   */
  verifyWebhook(rawBody: string, signature: string | null): StripeWebhookEvent {
    if (!this.webhookSecret) {
      if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
        throw new Error('Stripe webhook secret is required outside development');
      }
      const parsed = JSON.parse(rawBody) as StripeWebhookEvent;
      if (!parsed.id || !parsed.type) throw new Error('Invalid webhook payload: missing id/type');
      void signature;
      return parsed;
    }
    if (!signature) throw new Error('Missing Stripe webhook signature');
    const parts = new Map(
      signature.split(',').map((part) => {
        const [key, value] = part.split('=', 2);
        return [key, value] as const;
      }),
    );
    const timestamp = Number(parts.get('t'));
    const supplied = parts.get('v1');
    if (!Number.isFinite(timestamp) || !supplied) throw new Error('Invalid Stripe signature');
    if (Math.abs(Date.now() / 1000 - timestamp) > 300) throw new Error('Expired Stripe signature');
    const expected = createHmac('sha256', this.webhookSecret)
      .update(`${timestamp}.${rawBody}`)
      .digest('hex');
    const expectedBytes = Buffer.from(expected, 'utf8');
    const suppliedBytes = Buffer.from(supplied, 'utf8');
    if (
      expectedBytes.length !== suppliedBytes.length ||
      !timingSafeEqual(expectedBytes, suppliedBytes)
    ) {
      throw new Error('Invalid Stripe signature');
    }
    const parsed = JSON.parse(rawBody) as StripeWebhookEvent;
    if (!parsed.id || !parsed.type) throw new Error('Invalid webhook payload: missing id/type');
    return parsed;
  }
}

export const stripeAdapter = new StripeAdapter();
