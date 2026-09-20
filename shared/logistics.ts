export type LogisticsJobStatus =
  | 'pending_quote'
  | 'quote_accepted'
  | 'awaiting_pickup'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type LogisticsPartner = {
  partnerId: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  corridors: string;
  fleet: string;
  license: string;
  insurance: string;
  crossBorder: string;
  registeredAt: string;
};

export type LogisticsJob = {
  id: string;
  orderId: string;
  orderRef: string;
  partnerId: string;
  partnerName: string;
  distributorId: string;
  merchantShop: string;
  merchantMarket: string;
  routeLabel: string;
  feeNgn: number;
  status: LogisticsJobStatus;
  createdAt: string;
  updatedAt: string;
};

export type LogisticsDashboard = {
  partner: LogisticsPartner;
  stats: {
    activeJobs: number;
    deliveredJobs: number;
    pendingQuotes: number;
  };
  jobs: LogisticsJob[];
};
