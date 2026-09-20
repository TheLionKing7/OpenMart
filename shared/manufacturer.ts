export type ManufacturerInterest = 'telemetry' | 'subsidy' | 'procurement' | 'all';

export type ManufacturerProfile = {
  manufacturerId: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  country: string;
  category: string;
  interest: ManufacturerInterest | string;
  targetMarkets: string;
  companySize?: string;
  registeredAt: string;
};

export type SubsidyCampaign = {
  id: string;
  manufacturerId: string;
  manufacturerName: string;
  title: string;
  marketCluster: string;
  category: string;
  discountNgn: number;
  skuPattern?: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

export type ManufacturerDashboard = {
  manufacturer: ManufacturerProfile;
  campaigns: SubsidyCampaign[];
};
