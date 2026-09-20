import { AffiliateDashboard, AffiliateProfile } from './affiliate';
import type { LogisticsDashboard, LogisticsJob, LogisticsJobStatus, LogisticsPartner } from './logistics';
import type { ManufacturerDashboard, ManufacturerProfile, SubsidyCampaign } from './manufacturer';
import {
  PaymentConfig,
  PaymentInitializePayload,
  PaymentSession,
  PaymentVerifyResult,
} from './payments';
import {
  PlatformCatalogItem,
  PlatformDistributor,
  PlatformOrder,
  PlatformOrderStatus,
} from './types';

const DEFAULT_BASE_URL = 'http://localhost:3099';

function baseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_PLATFORM_URL) {
    return process.env.EXPO_PUBLIC_PLATFORM_URL;
  }
  return DEFAULT_BASE_URL;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Platform API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function checkPlatformHealth(): Promise<boolean> {
  try {
    await request<{ ok: boolean }>('/health');
    return true;
  } catch {
    return false;
  }
}

export async function listDistributorsForMarket(market: string): Promise<PlatformDistributor[]> {
  return request<PlatformDistributor[]>(`/distributors?market=${encodeURIComponent(market)}`);
}

export async function getDistributor(distributorId: string): Promise<PlatformDistributor | null> {
  try {
    return await request<PlatformDistributor>(`/distributors/${encodeURIComponent(distributorId)}`);
  } catch {
    return null;
  }
}

export async function registerDistributor(
  profile: Omit<PlatformDistributor, 'catalog' | 'registeredAt' | 'updatedAt'> & {
    catalog?: PlatformCatalogItem[];
  },
): Promise<PlatformDistributor> {
  return request<PlatformDistributor>('/distributors', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

export async function updateDistributorCatalog(
  distributorId: string,
  catalog: PlatformCatalogItem[],
): Promise<PlatformDistributor> {
  return request<PlatformDistributor>(`/distributors/${encodeURIComponent(distributorId)}/catalog`, {
    method: 'PUT',
    body: JSON.stringify({ catalog }),
  });
}

export async function submitOrder(order: PlatformOrder): Promise<PlatformOrder> {
  return request<PlatformOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
}

export async function listOrdersForDistributor(distributorId: string): Promise<PlatformOrder[]> {
  return request<PlatformOrder[]>(
    `/orders?distributorId=${encodeURIComponent(distributorId)}`,
  );
}

export async function updateOrderStatus(
  orderId: string,
  status: PlatformOrderStatus,
  completedAt?: string,
): Promise<PlatformOrder> {
  return request<PlatformOrder>(`/orders/${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, completedAt }),
  });
}

export async function registerAffiliate(profile: AffiliateProfile): Promise<AffiliateProfile> {
  return request<AffiliateProfile>('/affiliates', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

export async function getAffiliateDashboard(referrerCode: string): Promise<AffiliateDashboard> {
  return request<AffiliateDashboard>(`/affiliates/${encodeURIComponent(referrerCode)}/dashboard`);
}

export async function registerReferral(payload: {
  referrerCode: string;
  merchantId: string;
  merchantShop: string;
  merchantMarket: string;
}): Promise<void> {
  await request('/referrals', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getPaymentConfig(): Promise<PaymentConfig> {
  return request<PaymentConfig>('/payments/config');
}

export async function initializePayment(payload: PaymentInitializePayload): Promise<PaymentSession> {
  return request<PaymentSession>('/payments/initialize', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyPayment(reference: string): Promise<PaymentVerifyResult> {
  return request<PaymentVerifyResult>(`/payments/${encodeURIComponent(reference)}/verify`, {
    method: 'POST',
  });
}

export async function getPayment(reference: string): Promise<PaymentVerifyResult> {
  return request<PaymentVerifyResult>(`/payments/${encodeURIComponent(reference)}`);
}

export async function simulatePaymentSuccess(reference: string): Promise<PaymentVerifyResult> {
  return request<PaymentVerifyResult>(
    `/payments/${encodeURIComponent(reference)}/simulate-success`,
    { method: 'POST' },
  );
}

export async function registerLead(
  payload: Record<string, string | undefined>,
): Promise<{ ok: boolean; leadId: string; provisioned: unknown }> {
  return request('/register', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getOrder(orderId: string): Promise<PlatformOrder | null> {
  try {
    return await request<PlatformOrder>(`/orders/${encodeURIComponent(orderId)}`);
  } catch {
    return null;
  }
}

export async function registerManufacturer(
  profile: Omit<ManufacturerProfile, 'registeredAt'> & { registeredAt?: string },
): Promise<ManufacturerProfile> {
  return request<ManufacturerProfile>('/manufacturers', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

export async function getManufacturerDashboard(
  manufacturerId: string,
): Promise<ManufacturerDashboard> {
  return request<ManufacturerDashboard>(
    `/manufacturers/${encodeURIComponent(manufacturerId)}/dashboard`,
  );
}

export async function createSubsidyCampaign(
  campaign: Omit<SubsidyCampaign, 'id'>,
): Promise<SubsidyCampaign> {
  return request<SubsidyCampaign>('/campaigns', {
    method: 'POST',
    body: JSON.stringify(campaign),
  });
}

export async function getActiveCampaigns(
  market: string,
  category?: string,
): Promise<SubsidyCampaign[]> {
  const q = new URLSearchParams({ market });
  if (category) q.set('category', category);
  return request<SubsidyCampaign[]>(`/campaigns/active?${q}`);
}

export async function registerLogisticsPartner(
  partner: Omit<LogisticsPartner, 'registeredAt'> & { registeredAt?: string },
): Promise<LogisticsPartner> {
  return request<LogisticsPartner>('/logistics/partners', {
    method: 'POST',
    body: JSON.stringify(partner),
  });
}

export async function getLogisticsDashboard(partnerId: string): Promise<LogisticsDashboard> {
  return request<LogisticsDashboard>(
    `/logistics/partners/${encodeURIComponent(partnerId)}/dashboard`,
  );
}

export async function listLogisticsJobs(partnerId?: string): Promise<LogisticsJob[]> {
  const q = partnerId ? `?partnerId=${encodeURIComponent(partnerId)}` : '';
  return request<LogisticsJob[]>(`/logistics/jobs${q}`);
}

export async function updateLogisticsJob(
  jobId: string,
  patch: { status?: LogisticsJobStatus },
): Promise<LogisticsJob> {
  return request<LogisticsJob>(`/logistics/jobs/${encodeURIComponent(jobId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export function catalogToMerchantProducts(
  distributorId: string,
  catalog: PlatformCatalogItem[],
): {
  id: string;
  name: string;
  sku: string;
  unit: string;
  priceNgn: number;
  stock: number;
  distributorId: string;
}[] {
  return catalog.map((item) => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    unit: item.unit,
    priceNgn: item.priceNgn,
    stock: Math.max(0, item.quantityOnHand - item.reserved),
    distributorId,
  }));
}
