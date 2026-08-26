/**
 * QuickBooks Online integration stub — Phase 2 (blueprint §43).
 * Isolated behind an adapter so the real API (OAuth2 + QBO SDK) can be
 * swapped in when finance approves the accounting system (open decision #7).
 *
 * ChurchOS is the operational source for gifts, but QuickBooks remains the
 * general ledger. This adapter will push approved contributions to QBO as
 * SalesReceipts / Journal Entries, never the reverse.
 */

export interface QboSyncResult {
  synced: boolean;
  provider: 'quickbooks';
  contributionId: string;
  qboId?: string;
}

export class QuickBooksAdapter {
  private readonly connected: boolean;

  constructor() {
    this.connected = Boolean(process.env.QBO_ACCESS_TOKEN && process.env.QBO_COMPANY_ID);
  }

  async syncContribution(contributionId: string): Promise<QboSyncResult> {
    if (!this.connected) {
      return { synced: false, provider: 'quickbooks', contributionId };
    }
    // Real implementation: qbo.createSalesReceipt({ ... })
    throw new Error(
      'QuickBooks live sync not implemented — configure QBO_ACCESS_TOKEN + QBO_COMPANY_ID',
    );
  }
}

export const quickBooksAdapter = new QuickBooksAdapter();
