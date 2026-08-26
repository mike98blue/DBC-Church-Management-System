/**
 * SMS provider adapter — Phase 2, mock until a telecom vendor is contracted.
 * Isolated behind an interface so Twilio (or other) can be swapped in.
 * Respects opt-out and STOP handling at the service layer (blueprint §13).
 */

export interface SmsSendParams {
  to: string;
  body: string;
}

export class SmsAdapter {
  private readonly configured: boolean;

  constructor() {
    this.configured = Boolean(process.env.SMS_API_KEY && process.env.SMS_FROM_NUMBER);
  }

  async send(params: SmsSendParams): Promise<{ id: string }> {
    if (!this.configured) {
      const id = `sms_mock_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      // Never log the full body in production; mock only
      console.log(`[mock-sms] to=${params.to} id=${id}`);
      return { id };
    }
    throw new Error('Live SMS provider not implemented — configure SMS_API_KEY + SMS_FROM_NUMBER');
  }
}

export const smsAdapter = new SmsAdapter();
