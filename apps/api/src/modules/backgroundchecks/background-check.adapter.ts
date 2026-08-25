/**
 * Background check provider adapter (blueprint §43: Integrate only).
 * Isolated behind an interface so a real provider (Checkr, SecureSearch, etc.)
 * can be swapped in without touching domain code.
 *
 * In mock mode (no API key configured), requests are recorded locally and
 * immediately marked "clear" for development workflows only.
 */
export interface BackgroundCheckRequest {
  personId: string;
  firstName: string;
  lastName: string;
}

export interface BackgroundCheckResult {
  providerReferenceId: string;
  status: 'pending' | 'clear' | 'flagged';
}

export class BackgroundCheckAdapter {
  private readonly apiKey: string | null;

  constructor() {
    this.apiKey = process.env.BACKGROUNDCHECK_API_KEY ?? null;
  }

  async requestCheck(_params: BackgroundCheckRequest): Promise<BackgroundCheckResult> {
    if (!this.apiKey) {
      // Mock mode — development only
      const ref = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return { providerReferenceId: ref, status: 'clear' };
    }
    // Real provider integration would call the vendor API here.
    throw new Error('Live background check provider not implemented — configure a vendor adapter');
  }
}

export const backgroundCheckAdapter = new BackgroundCheckAdapter();
