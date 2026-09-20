export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingProfile: undefined;
  OnboardingReady: {
    name: string;
    phone: string;
    markets: string[];
    referrerCode: string;
  };
};

export type MainStackParamList = {
  Dashboard: undefined;
  Referrals: undefined;
  Commissions: undefined;
  Profile: undefined;
};
