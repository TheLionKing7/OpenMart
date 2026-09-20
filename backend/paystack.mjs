import crypto from 'node:crypto';

const PAYSTACK_BASE = 'https://api.paystack.co';

/** Nigerian checkout channels supported by Paystack */
export const PAYSTACK_CHANNELS = ['card', 'bank', 'ussd', 'bank_transfer', 'qr'];

export function paystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_'));
}

export function getPublicKey() {
  return process.env.PAYSTACK_PUBLIC_KEY ?? '';
}

function secretHeaders() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('PAYSTACK_SECRET_KEY not configured');
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

export async function initializeTransaction({
  email,
  amountKobo,
  reference,
  metadata,
  callbackUrl,
}) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: secretHeaders(),
    body: JSON.stringify({
      email,
      amount: amountKobo,
      reference,
      currency: 'NGN',
      channels: PAYSTACK_CHANNELS,
      metadata,
      callback_url: callbackUrl,
    }),
  });

  const json = await res.json();
  if (!json.status) {
    throw new Error(json.message || 'Paystack initialize failed');
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export async function verifyTransaction(reference) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: secretHeaders(),
  });
  const json = await res.json();
  if (!json.status) {
    throw new Error(json.message || 'Paystack verify failed');
  }
  return json.data;
}

export function verifyWebhookSignature(rawBody, signature) {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');
  return hash === signature;
}
