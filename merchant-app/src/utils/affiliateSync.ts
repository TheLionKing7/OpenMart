import { registerReferral } from '../../../shared/platformClient';
import { MerchantProfile } from '../context/MerchantContext';

export function merchantIdFromProfile(profile: MerchantProfile): string {
  return profile.phone.replace(/\D/g, '');
}

export async function syncReferralSignup(profile: MerchantProfile): Promise<void> {
  if (!profile.referrerCode?.trim()) return;
  try {
    await registerReferral({
      referrerCode: profile.referrerCode.trim().toUpperCase(),
      merchantId: merchantIdFromProfile(profile),
      merchantShop: profile.shopName,
      merchantMarket: profile.marketArea,
    });
  } catch {
    // Platform offline — referral queued locally only for demo
  }
}

// Referral activation is server-side: the backend activates the referral and
// credits the bounty in finalizePayment once the order payment is verified.
