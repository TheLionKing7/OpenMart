export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingShop: undefined;
  OnboardingDistributor: {
    shopName: string;
    marketArea: string;
    lga: string;
    referrerCode?: string;
  };
  OnboardingPhone: {
    shopName: string;
    marketArea: string;
    lga: string;
    preferredDistributorId: string;
    preferredDistributorName: string;
    referrerCode?: string;
  };
  OnboardingReady: {
    shopName: string;
    marketArea: string;
    lga: string;
    phone: string;
    preferredDistributorId: string;
    preferredDistributorName: string;
    referrerCode?: string;
  };
};

export type MainStackParamList = {
  Home: undefined;
  DistributorSelect: undefined;
  Catalog: { distributorId: string; distributorName: string };
  Cart: undefined;
  Checkout: { totalNgn: number; distributorId: string; distributorName: string };
  Settlement: { orderId: string };
  OrderHistory: undefined;
  RecordSales: undefined;
  Profile: undefined;
};
