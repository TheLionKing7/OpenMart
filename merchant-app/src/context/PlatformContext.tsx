import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { SubsidyCampaign } from '../../../shared/manufacturer';
import {
  catalogToMerchantProducts,
  checkPlatformHealth,
  getActiveCampaigns,
  getDistributor,
  listDistributorsForMarket,
  submitOrder,
} from '../../../shared/platformClient';
import { RestockSuggestion, rankDistributorsForMarket, suggestDistributorForRestock } from '../../../shared/routing';
import { PlatformDistributor, PlatformOrder } from '../../../shared/types';
import { Product } from '../data/products';

type PlatformContextValue = {
  connected: boolean;
  loading: boolean;
  distributors: PlatformDistributor[];
  rankedDistributors: PlatformDistributor[];
  refreshForMarket: (market: string) => Promise<void>;
  getDistributorProfile: (id: string) => PlatformDistributor | undefined;
  getCatalog: (distributorId: string) => Product[];
  getRestockSuggestion: (
    market: string,
    preferredDistributorId: string,
    skus: { sku: string; quantity: number }[],
  ) => RestockSuggestion | null;
  activeCampaigns: SubsidyCampaign[];
  pushOrder: (order: PlatformOrder) => Promise<void>;
};

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [distributors, setDistributors] = useState<PlatformDistributor[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<SubsidyCampaign[]>([]);
  const [currentMarket, setCurrentMarket] = useState('');

  useEffect(() => {
    checkPlatformHealth()
      .then(setConnected)
      .finally(() => setLoading(false));
  }, []);

  const refreshForMarket = useCallback(async (market: string) => {
    setCurrentMarket(market);
    const ok = await checkPlatformHealth();
    setConnected(ok);
    if (!ok) {
      setDistributors([]);
      setActiveCampaigns([]);
      return;
    }
    const [list, campaigns] = await Promise.all([
      listDistributorsForMarket(market),
      getActiveCampaigns(market).catch(() => [] as SubsidyCampaign[]),
    ]);
    setDistributors(list);
    setActiveCampaigns(campaigns);
  }, []);

  const rankedDistributors = useMemo(
    () => rankDistributorsForMarket(distributors, currentMarket).map((r) => r),
    [distributors, currentMarket],
  );

  const getDistributorProfile = useCallback(
    (id: string) => distributors.find((d) => d.distributorId === id),
    [distributors],
  );

  const getCatalog = useCallback(
    (distributorId: string): Product[] => {
      const local = distributors.find((d) => d.distributorId === distributorId);
      if (local) return catalogToMerchantProducts(distributorId, local.catalog);
      return [];
    },
    [distributors],
  );

  const pushOrder = useCallback(async (order: PlatformOrder) => {
    const ok = await checkPlatformHealth();
    if (!ok) return;
    await submitOrder(order);
  }, []);

  const getRestockSuggestion = useCallback(
    (market: string, preferredDistributorId: string, skus: { sku: string; quantity: number }[]) =>
      suggestDistributorForRestock(distributors, market, preferredDistributorId, skus),
    [distributors],
  );

  const value = useMemo(
    () => ({
      connected,
      loading,
      distributors,
      rankedDistributors,
      refreshForMarket,
      getDistributorProfile,
      getCatalog,
      getRestockSuggestion,
      activeCampaigns,
      pushOrder,
    }),
    [
      connected,
      loading,
      distributors,
      rankedDistributors,
      refreshForMarket,
      getDistributorProfile,
      getCatalog,
      getRestockSuggestion,
      activeCampaigns,
      pushOrder,
    ],
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used within PlatformProvider');
  return ctx;
}

export async function fetchDistributorById(id: string) {
  return getDistributor(id);
}
