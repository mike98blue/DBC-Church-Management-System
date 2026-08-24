/**
 * Stripe adapter — isolated behind an interface so the provider can be swapped
 * (blueprint §6, §12). In production this calls Stripe's API; in dev/tests it
 * returns a mock Checkout Session without touching the network.
 *
 * PCI: ChurchOS never handles raw card data. We only create Checkout Sessions
 * and verify signed webhooks (blueprint §12, rules 1–4).
 */
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
      // Mock for local dev / tests — no network call, no card data
      const id = `cs_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return {
        id,
        url: `https://mock.stripe/checkout/${id}?fund=${params.fundId}`,
        amountCents: params.amountCents,
        currency: params.currency,
      };
    }
    // Real implementation would call `stripe.checkout.sessions.create` here.
    // Intentionally not implemented until STRIPE_SECRET_KEY is provided.
    throw new Error(
      'Stripe live mode not implemented in this scaffold — provide a mock or set STRIPE_SECRET_KEY handling',
    );
  }

  /**
   * Verify the Stripe webhook signature. In mock mode (no webhook secret),
   * we accept any payload with an `id` — but we still require an `id` for idempotency.
   * In production, this must call `stripe.webhooks.constructEvent`.
   */
  verifyWebhook(rawBody: string, signature: string | null): StripeWebhookEvent {
    if (!this.webhookSecret) {
      const parsed = JSON.parse(rawBody) as StripeWebhookEvent;
      if (!parsed.id || !parsed.type) throw new Error('Invalid webhook payload: missing id/type');
      void signature;
      return parsed;
    }
    // Real verification would be: stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    throw new Error('Stripe webhook verification not implemented for live mode');
  }
}

export const stripeAdapter = new StripeAdapter();
