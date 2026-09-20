import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AffiliateDashboard,
  AffiliateProfile,
  MERCHANT_ACTIVATION_BOUNTY_NGN,
  generateReferrerCode,
} from '../../../shared/affiliate';
import {
  checkPlatformHealth,
  getAffiliateDashboard,
  registerAffiliate,
} from '../../../shared/platformClient';

export type AffiliateSession = AffiliateProfile;

type AffiliateContextValue = {
  loading: boolean;
  onboardingComplete: boolean;
  profile: AffiliateSession | null;
  platformConnected: boolean;
  dashboard: AffiliateDashboard | null;
  completeOnboarding: (input: {
    name: string;
    phone: string;
    markets: string[];
    referrerCode: string;
  }) => Promise<void>;
  resetOnboarding: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
};

const STORAGE_KEY = '@openmarket/affiliate';

const AffiliateContext = createContext<AffiliateContextValue | null>(null);

export function AffiliateProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [profile, setProfile] = useState<AffiliateSession | null>(null);
  const [platformConnected, setPlatformConnected] = useState(false);
  const [dashboard, setDashboard] = useState<AffiliateDashboard | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as { onboardingComplete: boolean; profile: AffiliateSession };
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
      const data = await getAffiliateDashboard(profile.referrerCode);
      setDashboard(data);
    } catch {
      setDashboard(null);
    }
  }, [profile]);

  useEffect(() => {
    if (onboardingComplete && profile) refreshDashboard();
  }, [onboardingComplete, profile, refreshDashboard]);

  const completeOnboarding = useCallback(
    async (input: { name: string; phone: string; markets: string[]; referrerCode: string }) => {
      const now = new Date().toISOString();
      const session: AffiliateSession = {
        affiliateId: `aff-${Date.now().toString(36)}`,
        referrerCode: input.referrerCode.trim().toUpperCase(),
        name: input.name.trim(),
        phone: input.phone.trim(),
        markets: input.markets,
        registeredAt: now,
      };

      setProfile(session);
      setOnboardingComplete(true);
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ onboardingComplete: true, profile: session }),
      );

      const ok = await checkPlatformHealth();
      setPlatformConnected(ok);
      if (ok) {
        await registerAffiliate(session);
        const data = await getAffiliateDashboard(session.referrerCode);
        setDashboard(data);
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
    ],
  );

  return <AffiliateContext.Provider value={value}>{children}</AffiliateContext.Provider>;
}

export function useAffiliate() {
  const ctx = useContext(AffiliateContext);
  if (!ctx) throw new Error('useAffiliate must be used within AffiliateProvider');
  return ctx;
}

export { generateReferrerCode, MERCHANT_ACTIVATION_BOUNTY_NGN };
