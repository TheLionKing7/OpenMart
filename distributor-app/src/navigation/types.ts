export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingBusiness: undefined;
  OnboardingCoverage: undefined;
  OnboardingTerms: undefined;
  OnboardingReady: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  FulfillmentQueue: { tab?: 'allocate' | 'pack' | 'delivery' | 'done' } | undefined;
  OrderDetail: { orderId: string };
  Inventory: undefined;
  AddProduct: undefined;
  Payouts: undefined;
  Profile: undefined;
};
