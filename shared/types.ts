export type PlatformCatalogItem = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  priceNgn: number;
  quantityOnHand: number;
  reserved: number;
};

export type PlatformDistributor = {
  distributorId: string;
  distributorName: string;
  stallLabel: string;
  lga: string;
  operatorName: string;
  phone: string;
  servesMarkets: string[];
  hasLogistics: boolean;
  minLeadTimeDays: number;
  orderingConditions: string;
  catalog: PlatformCatalogItem[];
  registeredAt: string;
  updatedAt: string;
};

export type PlatformOrderLine = {
  sku: string;
  name: string;
  quantity: number;
  unitPriceNgn: number;
};

export type PlatformOrderStatus =
  | 'payment_verified'
  | 'allocated'
  | 'ready_to_pack'
  | 'out_for_delivery'
  | 'completed';

export type PlatformOrder = {
  id: string;
  orderRef: string;
  merchantShop: string;
  merchantMarket: string;
  distributorId: string;
  totalNgn: number;
  distributorPayoutNgn: number;
  platformFeeNgn: number;
  lines: PlatformOrderLine[];
  status: PlatformOrderStatus;
  createdAt: string;
  paidAt: string;
  completedAt?: string;
  requestLogistics?: boolean;
  logisticsJobId?: string;
};

import { AffiliateProfile, CommissionRecord, ReferralRecord } from './affiliate';
import type { LeadRecord } from './leads';
import type { LogisticsJob, LogisticsPartner } from './logistics';
import type { ManufacturerProfile, SubsidyCampaign } from './manufacturer';

export type PaymentRecord = {
  reference: string;
  orderId: string;
  orderRef: string;
  status: 'pending' | 'success' | 'failed';
  amountNgn: number;
  email: string;
  authorizationUrl?: string;
  accessCode?: string;
  demoMode: boolean;
  paidAt?: string;
  paystackChannel?: string;
  orderDraft: PlatformOrder & {
    itemCount?: number;
    linesSummary?: string[];
    orderLines?: unknown[];
    merchantId?: string;
    referrerCode?: string;
    requestLogistics?: boolean;
  };
  createdAt: string;
};

export type PlatformState = {
  distributors: PlatformDistributor[];
  orders: PlatformOrder[];
  affiliates: AffiliateProfile[];
  referrals: ReferralRecord[];
  commissions: CommissionRecord[];
  payments: PaymentRecord[];
  leads: LeadRecord[];
  manufacturers: ManufacturerProfile[];
  logisticsPartners: LogisticsPartner[];
  logisticsJobs: LogisticsJob[];
  campaigns: SubsidyCampaign[];
};
