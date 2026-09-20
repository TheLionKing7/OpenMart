export const MERCHANT_ACTIVATION_BOUNTY_NGN = 3000;

export type AffiliateProfile = {
  affiliateId: string;
  referrerCode: string;
  name: string;
  phone: string;
  markets: string[];
  registeredAt: string;
};

export type ReferralStatus = 'signed_up' | 'activated';

export type ReferralRecord = {
  id: string;
  referrerCode: string;
  merchantId: string;
  merchantShop: string;
  merchantMarket: string;
  referredAt: string;
  status: ReferralStatus;
  activatedAt?: string;
  firstOrderRef?: string;
};

export type CommissionStatus = 'pending' | 'credited';

export type CommissionRecord = {
  id: string;
  referrerCode: string;
  referralId: string;
  merchantShop: string;
  amountNgn: number;
  status: CommissionStatus;
  reason: 'merchant_activation';
  createdAt: string;
  creditedAt?: string;
};

export type AffiliateDashboard = {
  affiliate: AffiliateProfile;
  stats: {
    signups: number;
    activations: number;
    earnedNgn: number;
    pendingNgn: number;
  };
  referrals: ReferralRecord[];
  commissions: CommissionRecord[];
};

export function generateReferrerCode(name: string): string {
  const part = name
    .trim()
    .split(/\s+/)[0]
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 5)
    .toUpperCase();
  const suffix = Date.now().toString(36).slice(-4).toUpperCase();
  return `${part || 'AFF'}-${suffix}`;
}
