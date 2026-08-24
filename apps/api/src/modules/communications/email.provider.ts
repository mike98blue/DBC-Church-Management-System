export interface EmailProvider {
  send(params: { to: string; subject: string; body: string }): Promise<{ messageId: string }>;
}

/**
 * Mock provider for local dev and tests. Logs to console and pretends to send.
 * Replace with SES/Postmark/SendGrid adapter in production (blueprint §13).
 */
export class MockEmailProvider implements EmailProvider {
  async send(params: {
    to: string;
    subject: string;
    body: string;
  }): Promise<{ messageId: string }> {
    const id = `mock-${Date.now()}`;
    // Never log sensitive body in production; this is dev-only.
    console.log(`[mock-email] to=${params.to} subject="${params.subject}" id=${id}`);
    return { messageId: id };
  }
}

export const emailProvider: EmailProvider = new MockEmailProvider();
