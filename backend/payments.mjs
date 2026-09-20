const ACTIVATION_BOUNTY_NGN = 3000;
const PLATFORM_FEE_RATE = 0.05;

// Clients may not set prices: every line is re-priced from the distributor's
// VWL catalog and totals are derived from those catalog prices. Throws on
// unknown SKUs or invalid quantities so the route can answer 400.
export function priceOrderLines(body, distributor) {
  const requested = Array.isArray(body.lines) ? body.lines : [];
  if (requested.length === 0) {
    throw new Error('Order lines are required');
  }

  const catalog = distributor.catalog ?? [];
  const unknownSkus = [];
  const lines = [];

  for (const raw of requested) {
    const sku = String(raw?.sku ?? '').trim();
    const quantity = Math.floor(Number(raw?.quantity));
    if (!sku || !Number.isFinite(quantity) || quantity <= 0) {
      throw new Error('Each order line needs a sku and a positive integer quantity');
    }
    const item = catalog.find((c) => c.sku.toLowerCase() === sku.toLowerCase());
    if (!item) {
      unknownSkus.push(sku);
      continue;
    }
    lines.push({
      sku: item.sku,
      name: item.name,
      quantity,
      unitPriceNgn: item.priceNgn,
    });
  }

  if (unknownSkus.length > 0) {
    throw new Error(
      `SKU(s) not in ${distributor.distributorId} catalog: ${unknownSkus.join(', ')}`,
    );
  }

  const totalNgn = lines.reduce((sum, l) => sum + l.unitPriceNgn * l.quantity, 0);
  const platformFeeNgn = Math.round(totalNgn * PLATFORM_FEE_RATE);
  const distributorPayoutNgn = totalNgn - platformFeeNgn;

  return { lines, totalNgn, distributorPayoutNgn, platformFeeNgn };
}

// Referral activation (and its bounty) may only fire from a finalized payment —
// never from a client call. Idempotent: matches the referral by merchant and
// de-dupes the commission by referral id.
function activateReferralForOrder(state, draft, now) {
  if (!draft?.merchantId) return;
  const referral = state.referrals.find(
    (r) => r.merchantId === draft.merchantId && r.status === 'signed_up',
  );
  if (!referral) return;

  referral.status = 'activated';
  referral.activatedAt = now;
  referral.firstOrderRef = draft.orderRef;

  if (!state.commissions.some((c) => c.referralId === referral.id)) {
    state.commissions.unshift({
      id: `com-${Date.now()}`,
      referrerCode: referral.referrerCode,
      referralId: referral.id,
      merchantShop: referral.merchantShop,
      amountNgn: ACTIVATION_BOUNTY_NGN,
      status: 'credited',
      reason: 'merchant_activation',
      createdAt: now,
      creditedAt: now,
    });
  }
}

export function finalizePayment(state, reference, { channel, paidAt } = {}) {
  const payment = state.payments.find((p) => p.reference === reference);
  if (!payment || payment.status === 'success') {
    return { state, payment, order: state.orders.find((o) => o.id === payment?.orderId) };
  }

  const now = paidAt ?? new Date().toISOString();
  payment.status = 'success';
  payment.paidAt = now;
  if (channel) payment.paystackChannel = channel;

  const draft = payment.orderDraft;
  const platformOrder = {
    id: draft.id,
    orderRef: draft.orderRef,
    merchantShop: draft.merchantShop,
    merchantMarket: draft.merchantMarket,
    distributorId: draft.distributorId,
    totalNgn: draft.totalNgn,
    distributorPayoutNgn: draft.distributorPayoutNgn,
    platformFeeNgn: draft.platformFeeNgn,
    lines: draft.lines,
    status: 'payment_verified',
    createdAt: draft.createdAt ?? now,
    paidAt: now,
    requestLogistics: Boolean(draft.requestLogistics),
  };

  if (!state.orders.some((o) => o.id === platformOrder.id)) {
    state.orders.unshift(platformOrder);
  }

  activateReferralForOrder(state, draft, now);

  return { state, payment, order: platformOrder };
}

export function buildOrderDraft(body, distributor) {
  const orderId = `order-${Date.now()}`;
  const orderRef = `OM-${Date.now().toString(36).toUpperCase()}`;
  const now = new Date().toISOString();
  const priced = priceOrderLines(body, distributor);

  return {
    id: orderId,
    orderRef,
    merchantShop: body.merchantShop,
    merchantMarket: body.merchantMarket,
    merchantId: body.merchantId,
    referrerCode: body.referrerCode,
    distributorId: distributor.distributorId,
    distributorName: distributor.distributorName ?? body.distributorName,
    totalNgn: priced.totalNgn,
    distributorPayoutNgn: priced.distributorPayoutNgn,
    platformFeeNgn: priced.platformFeeNgn,
    itemCount: priced.lines.reduce((sum, l) => sum + l.quantity, 0),
    linesSummary: priced.lines.map((l) => `${l.quantity}× ${l.name}`),
    orderLines: priced.lines.map((l) => ({ sku: l.sku, name: l.name, quantity: l.quantity })),
    lines: priced.lines,
    status: 'payment_verified',
    createdAt: now,
    requestLogistics: Boolean(body.requestLogistics),
  };
}

export { ACTIVATION_BOUNTY_NGN };
