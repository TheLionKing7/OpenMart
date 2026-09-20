import { PlatformOrder } from './types';

export const PAYMENT_CHANNELS = [
  { id: 'card', label: 'Debit / Credit Card', hint: 'Visa, Verve, Mastercard' },
  { id: 'bank', label: 'Pay with Bank', hint: 'Instant bank debit' },
  { id: 'bank_transfer', label: 'Bank Transfer', hint: 'Dedicated transfer account' },
  { id: 'ussd', label: 'USSD', hint: 'Dial code from any phone' },
  { id: 'qr', label: 'QR Code', hint: 'Scan to pay' },
] as const;

// The backend re-prices every line from the distributor VWL catalog and
// derives totals, so the payload carries no prices or money fields.
export type PaymentInitializePayload = {
  email: string;
  merchantId: string;
  merchantShop: string;
  merchantMarket: string;
  referrerCode?: string;
  distributorId: string;
  distributorName: string;
  lines: { sku: string; quantity: number }[];
  callbackUrl?: string;
  requestLogistics?: boolean;
};

export type PaymentSession = {
  reference: string;
  orderId: string;
  orderRef: string;
  authorizationUrl: string;
  accessCode: string;
  amountNgn: number;
  demoMode: boolean;
  channels: string[];
};

export type PaymentStatus = 'pending' | 'success' | 'failed';

export type PaymentVerifyResult = {
  status: PaymentStatus;
  reference: string;
  orderId: string;
  orderRef: string;
  paidAt?: string;
  order?: PlatformOrder;
  channel?: string;
};

export type PaymentConfig = {
  paystackEnabled: boolean;
  demoMode: boolean;
  publicKey: string;
  channels: typeof PAYMENT_CHANNELS;
};
