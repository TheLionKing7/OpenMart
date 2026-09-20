import React, { createContext, useContext, useMemo, useState } from 'react';

export type OnboardingDraft = {
  distributorName: string;
  stallLabel: string;
  lga: string;
  operatorName: string;
  phone: string;
  servesMarkets: string[];
  hasLogistics: boolean;
  minLeadTimeDays: number;
  orderingConditions: string;
};

const emptyDraft: OnboardingDraft = {
  distributorName: '',
  stallLabel: '',
  lga: '',
  operatorName: '',
  phone: '',
  servesMarkets: [],
  hasLogistics: false,
  minLeadTimeDays: 1,
  orderingConditions: '',
};

type OnboardingDraftContextValue = {
  draft: OnboardingDraft;
  updateDraft: (patch: Partial<OnboardingDraft>) => void;
  resetDraft: () => void;
};

const OnboardingDraftContext = createContext<OnboardingDraftContextValue | null>(null);

export function OnboardingDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(emptyDraft);

  const value = useMemo(
    () => ({
      draft,
      updateDraft: (patch: Partial<OnboardingDraft>) => setDraft((prev) => ({ ...prev, ...patch })),
      resetDraft: () => setDraft(emptyDraft),
    }),
    [draft],
  );

  return <OnboardingDraftContext.Provider value={value}>{children}</OnboardingDraftContext.Provider>;
}

export function useOnboardingDraft() {
  const ctx = useContext(OnboardingDraftContext);
  if (!ctx) throw new Error('useOnboardingDraft must be used within OnboardingDraftProvider');
  return ctx;
}
