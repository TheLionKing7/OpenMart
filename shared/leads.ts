export type LeadAudience =
  | 'merchant'
  | 'affiliate'
  | 'distributor'
  | 'manufacturer'
  | 'logistics';

export type LeadRecord = {
  id: string;
  audience: LeadAudience;
  submittedAt: string;
  name: string;
  phone: string;
  business: string;
  email?: string;
  status: 'new' | 'contacted' | 'onboarded';
  [key: string]: string | undefined;
};
