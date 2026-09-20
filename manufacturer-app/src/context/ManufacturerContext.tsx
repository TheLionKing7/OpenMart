import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ManufacturerDashboard, ManufacturerProfile, SubsidyCampaign } from '../../../shared/manufacturer';
import {
  checkPlatformHealth,
  createSubsidyCampaign,
  getManufacturerDashboard,
  registerManufacturer,
} from '../../../shared/platformClient';

const STORAGE_KEY = '@openmarket/manufacturer';

type ManufacturerContextValue = {
  loading: boolean;
  onboardingComplete: boolean;
  profile: ManufacturerProfile | null;
  platformConnected: boolean;
  dashboard: ManufacturerDashboard | null;
  completeOnboarding: (input: {
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    country: string;
    category: string;
    interest: string;
    targetMarkets: string;
    companySize: string;
  }) => Promise<void>;
  resetOnboarding: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  launchCampaign: (input: {
    title: string;
    marketCluster: string;
    category: string;
    discountNgn: number;
    skuPattern: string;
  }) => Promise<void>;
};

const ManufacturerContext = createContext<ManufacturerContextValue | null>(null);

export function ManufacturerProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [profile, setProfile] = useState<ManufacturerProfile | null>(null);
  const [platformConnected, setPlatformConnected] = useState(false);
  const [dashboard, setDashboard] = useState<ManufacturerDashboard | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as { onboardingComplete: boolean; profile: ManufacturerProfile };
        setOnboardingComplete(parsed.onboardingComplete);
        setProfile(parsed.profile);
      })
      .finally(() => setLoading(false));
  }, []);

  const refreshDashboard = useCallback(async () => {
    if (!profile) return;
    const ok = await checkPlatformHealth();
    setPlatformConnected(ok);
    if (!ok) {
      setDashboard(null);
      return;
    }
    try {
      setDashboard(await getManufacturerDashboard(profile.manufacturerId));
    } catch {
      setDashboard(null);
    }
  }, [profile]);

  useEffect(() => {
    if (onboardingComplete && profile) refreshDashboard();
  }, [onboardingComplete, profile, refreshDashboard]);

  const completeOnboarding = useCallback(
    async (input: {
      companyName: string;
      contactName: string;
      phone: string;
      email: string;
      country: string;
      category: string;
      interest: string;
      targetMarkets: string;
      companySize: string;
    }) => {
      const now = new Date().toISOString();
      const manufacturer: ManufacturerProfile = {
        manufacturerId: `mfg-${Date.now().toString(36)}`,
        companyName: input.companyName.trim(),
        contactName: input.contactName.trim(),
        phone: input.phone.trim(),
        email: input.email.trim(),
        country: input.country.trim(),
        category: input.category.trim(),
        interest: input.interest.trim() || 'all',
        targetMarkets: input.targetMarkets.trim(),
        companySize: input.companySize.trim(),
        registeredAt: now,
      };

      setProfile(manufacturer);
      setOnboardingComplete(true);
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ onboardingComplete: true, profile: manufacturer }),
      );

      const ok = await checkPlatformHealth();
      setPlatformConnected(ok);
      if (ok) {
        await registerManufacturer(manufacturer);
        setDashboard(await getManufacturerDashboard(manufacturer.manufacturerId));
      }
    },
    [],
  );

  const resetOnboarding = useCallback(async () => {
    setOnboardingComplete(false);
    setProfile(null);
    setDashboard(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const launchCampaign = useCallback(
    async (input: {
      title: string;
      marketCluster: string;
      category: string;
      discountNgn: number;
      skuPattern: string;
    }) => {
      if (!profile || !platformConnected) return;
      const now = new Date().toISOString();
      const endsAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
      await createSubsidyCampaign({
        manufacturerId: profile.manufacturerId,
        manufacturerName: profile.companyName,
        title: input.title.trim(),
        marketCluster: input.marketCluster.trim(),
        category: input.category.trim() || profile.category,
        discountNgn: input.discountNgn,
        skuPattern: input.skuPattern.trim(),
        startsAt: now,
        endsAt,
        active: true,
      });
      await refreshDashboard();
    },
    [profile, platformConnected, refreshDashboard],
  );

  const value = useMemo(
    () => ({
      loading,
      onboardingComplete,
      profile,
      platformConnected,
      dashboard,
      completeOnboarding,
      resetOnboarding,
      refreshDashboard,
      launchCampaign,
    }),
    [
      loading,
      onboardingComplete,
      profile,
      platformConnected,
      dashboard,
      completeOnboarding,
      resetOnboarding,
      refreshDashboard,
      launchCampaign,
    ],
  );

  return <ManufacturerContext.Provider value={value}>{children}</ManufacturerContext.Provider>;
}

export function useManufacturer() {
  const ctx = useContext(ManufacturerContext);
  if (!ctx) throw new Error('useManufacturer must be used within ManufacturerProvider');
  return ctx;
}
