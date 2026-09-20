import { PlatformCatalogItem, PlatformDistributor } from './types';

export type SkuRequest = { sku: string; quantity: number };

export type RoutedDistributor = PlatformDistributor & {
  score: number;
  canFulfillAll: boolean;
  missingSkus: string[];
  availableSkus: string[];
};

function availableQty(item: PlatformCatalogItem): number {
  return Math.max(0, item.quantityOnHand - item.reserved);
}

export function evaluateDistributorForOrder(
  distributor: PlatformDistributor,
  market: string,
  requested: SkuRequest[],
): RoutedDistributor {
  const servesMarket = distributor.servesMarkets.some(
    (m) => m.toLowerCase() === market.toLowerCase() || market.toLowerCase().includes(m.toLowerCase()),
  );

  const missingSkus: string[] = [];
  const availableSkus: string[] = [];
  let score = 0;

  if (!servesMarket) {
    return { ...distributor, score: -1, canFulfillAll: false, missingSkus: requested.map((r) => r.sku), availableSkus };
  }

  score += 50;

  for (const req of requested) {
    const item = distributor.catalog.find((c) => c.sku === req.sku);
    if (!item || availableQty(item) < req.quantity) {
      missingSkus.push(req.sku);
    } else {
      availableSkus.push(req.sku);
      score += 20;
    }
  }

  const canFulfillAll = missingSkus.length === 0 && requested.length > 0;
  if (canFulfillAll) score += 100;
  if (distributor.hasLogistics) score += 5;
  score -= distributor.minLeadTimeDays * 2;
  if (distributor.catalog.length > 0) score += 5;

  return { ...distributor, score, canFulfillAll, missingSkus, availableSkus };
}

export function rankDistributorsForMarket(
  distributors: PlatformDistributor[],
  market: string,
  requested: SkuRequest[] = [],
): RoutedDistributor[] {
  return distributors
    .map((d) => evaluateDistributorForOrder(d, market, requested))
    .filter((d) => d.score >= 0)
    .sort((a, b) => b.score - a.score);
}

export type RestockSuggestionReason = 'preferred_out_of_stock' | 'not_on_platform';

export type RestockSuggestion = {
  distributor: RoutedDistributor;
  reason: RestockSuggestionReason;
  preferredCanFulfill: boolean;
  missingFromPreferred: string[];
};

/** Suggest an alternate wholesaler when preferred cannot cover low-stock SKUs. */
export function suggestDistributorForRestock(
  distributors: PlatformDistributor[],
  market: string,
  preferredDistributorId: string,
  requested: SkuRequest[],
): RestockSuggestion | null {
  if (requested.length === 0 || distributors.length === 0) return null;

  const ranked = rankDistributorsForMarket(distributors, market, requested);
  if (ranked.length === 0) return null;

  const preferred = ranked.find((d) => d.distributorId === preferredDistributorId);
  const best = ranked.find((d) => d.canFulfillAll) ?? ranked[0];

  if (!best || best.distributorId === preferredDistributorId) return null;

  const preferredCanFulfill = preferred?.canFulfillAll ?? false;
  if (preferredCanFulfill) return null;

  return {
    distributor: best,
    reason: preferred ? 'preferred_out_of_stock' : 'not_on_platform',
    preferredCanFulfill,
    missingFromPreferred: preferred?.missingSkus ?? requested.map((r) => r.sku),
  };
}
