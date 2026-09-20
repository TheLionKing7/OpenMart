import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LogisticsDashboard, LogisticsPartner } from '../../../shared/logistics';
import {
  checkPlatformHealth,
  getLogisticsDashboard,
  registerLogisticsPartner,
  updateLogisticsJob,
} from '../../../shared/platformClient';
import type { LogisticsJobStatus } from '../../../shared/logistics';

const STORAGE_KEY = '@openmarket/logistics';

type LogisticsContextValue = {
  loading: boolean;
  onboardingComplete: boolean;
  profile: LogisticsPartner | null;
  platformConnected: boolean;
  dashboard: LogisticsDashboard | null;
  completeOnboarding: (input: {
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    corridors: string;
    fleet: string;
    license: string;
    insurance: string;
    crossBorder: string;
  }) => Promise<void>;
  resetOnboarding: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  advanceJob: (jobId: string, status: LogisticsJobStatus) => Promise<void>;
};

const LogisticsContext = createContext<LogisticsContextValue | null>(null);

export function LogisticsProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [profile, setProfile] = useState<LogisticsPartner | null>(null);
  const [platformConnected, setPlatformConnected] = useState(false);
  const [dashboard, setDashboard] = useState<LogisticsDashboard | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as { onboardingComplete: boolean; profile: LogisticsPartner };
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
      setDashboard(await getLogisticsDashboard(profile.partnerId));
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
      corridors: string;
      fleet: string;
      license: string;
      insurance: string;
      crossBorder: string;
    }) => {
      const now = new Date().toISOString();
      const partner: LogisticsPartner = {
        partnerId: `log-${Date.now().toString(36)}`,
        companyName: input.companyName.trim(),
        contactName: input.contactName.trim(),
        phone: input.phone.trim(),
        email: input.email.trim(),
        corridors: input.corridors.trim(),
        fleet: input.fleet.trim(),
        license: input.license.trim(),
        insurance: input.insurance.trim(),
        crossBorder: input.crossBorder.trim(),
        registeredAt: now,
      };

      setProfile(partner);
      setOnboardingComplete(true);
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ onboardingComplete: true, profile: partner }),
      );

      const ok = await checkPlatformHealth();
      setPlatformConnected(ok);
      if (ok) {
        await registerLogisticsPartner(partner);
        setDashboard(await getLogisticsDashboard(partner.partnerId));
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

  const advanceJob = useCallback(
    async (jobId: string, status: LogisticsJobStatus) => {
      if (!platformConnected) return;
      await updateLogisticsJob(jobId, { status });
      await refreshDashboard();
    },
    [platformConnected, refreshDashboard],
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
      advanceJob,
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
      advanceJob,
    ],
  );

  return <LogisticsContext.Provider value={value}>{children}</LogisticsContext.Provider>;
}

export function useLogistics() {
  const ctx = useContext(LogisticsContext);
  if (!ctx) throw new Error('useLogistics must be used within LogisticsProvider');
  return ctx;
}
