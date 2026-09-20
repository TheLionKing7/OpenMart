import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PAYSTACK_CHANNELS,
  getPublicKey,
  initializeTransaction,
  paystackConfigured,
  verifyTransaction,
  verifyWebhookSignature,
} from './paystack.mjs';
import { buildOrderDraft, finalizePayment } from './payments.mjs';
import {
  activeCampaigns,
  createLogisticsJobForOrder,
  extensionDefaults,
  ingestRegistration,
  logisticsDashboard,
  manufacturerDashboard,
  syncLogisticsJobWithOrderStatus,
} from './extensions.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3099);
const STATE_FILE = path.join(__dirname, 'platform-state.json');

loadEnv();

const CHANNEL_LABELS = [
  { id: 'card', label: 'Debit / Credit Card', hint: 'Visa, Verve, Mastercard' },
  { id: 'bank', label: 'Pay with Bank', hint: 'Instant bank debit' },
  { id: 'bank_transfer', label: 'Bank Transfer', hint: 'Dedicated transfer account' },
  { id: 'ussd', label: 'USSD', hint: 'Dial code from any phone' },
  { id: 'qr', label: 'QR Code', hint: 'Scan to pay' },
];

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const emptyState = () => ({
  distributors: [],
  orders: [],
  affiliates: [],
  referrals: [],
  commissions: [],
  payments: [],
  ...extensionDefaults(),
});

function readState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return emptyState();
    const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    return { ...emptyState(), ...raw };
  } catch {
    return emptyState();
  }
}

function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-paystack-signature',
  });
  res.end(JSON.stringify(body));
}

function sendHtml(res, status, html) {
  res.writeHead(status, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
  res.end(html);
}

// Ledger/lead dumps are admin-only. Fails closed: without ADMIN_TOKEN set in
// the environment these endpoints are unreachable.
function isAdmin(req) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const header = req.headers.authorization ?? '';
  const bearer = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  return bearer === token || req.headers['x-admin-token'] === token;
}

function requireAdmin(req, res) {
  if (isAdmin(req)) return true;
  send(res, 403, { error: 'Forbidden — admin token required (set ADMIN_TOKEN in backend/.env)' });
  return false;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function parseRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function marketMatch(distributor, market) {
  if (!market) return true;
  const m = market.toLowerCase();
  return distributor.servesMarkets.some(
    (s) => s.toLowerCase() === m || m.includes(s.toLowerCase()) || s.toLowerCase().includes(m),
  );
}

function affiliateDashboard(state, referrerCode) {
  const affiliate = state.affiliates.find((a) => a.referrerCode === referrerCode);
  if (!affiliate) return null;

  const referrals = state.referrals.filter((r) => r.referrerCode === referrerCode);
  const commissions = state.commissions.filter((c) => c.referrerCode === referrerCode);
  const signups = referrals.length;
  const activations = referrals.filter((r) => r.status === 'activated').length;
  const earnedNgn = commissions
    .filter((c) => c.status === 'credited')
    .reduce((s, c) => s + c.amountNgn, 0);
  const pendingNgn = commissions
    .filter((c) => c.status === 'pending')
    .reduce((s, c) => s + c.amountNgn, 0);

  return {
    affiliate,
    stats: { signups, activations, earnedNgn, pendingNgn },
    referrals: referrals.sort((a, b) => new Date(b.referredAt) - new Date(a.referredAt)),
    commissions: commissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  };
}

function paymentResponse(state, payment) {
  const order = state.orders.find((o) => o.id === payment.orderId);
  return {
    status: payment.status,
    reference: payment.reference,
    orderId: payment.orderId,
    orderRef: payment.orderRef,
    paidAt: payment.paidAt,
    channel: payment.paystackChannel,
    order,
  };
}

function afterOrderFinalized(state, order) {
  const distributor = state.distributors.find((d) => d.distributorId === order.distributorId);
  createLogisticsJobForOrder(state, order, {
    requestLogistics: order.requestLogistics,
    distributor,
  });
}

async function handleVerify(state, reference) {
  const payment = state.payments.find((p) => p.reference === reference);
  if (!payment) return { error: 'Payment not found', status: 404 };

  if (payment.status === 'success') {
    return { body: paymentResponse(state, payment) };
  }

  if (paystackConfigured() && !payment.demoMode) {
    const data = await verifyTransaction(reference);
    if (data.status === 'success') {
      const result = finalizePayment(state, reference, {
        channel: data.channel,
        paidAt: data.paid_at,
      });
      if (result.order) afterOrderFinalized(result.state, result.order);
      writeState(result.state);
      return { body: paymentResponse(result.state, result.payment) };
    }
    return {
      body: {
        status: 'pending',
        reference,
        orderId: payment.orderId,
        orderRef: payment.orderRef,
      },
    };
  }

  return {
    body: {
      status: 'pending',
      reference,
      orderId: payment.orderId,
      orderRef: payment.orderRef,
    },
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  let state = readState();

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      send(res, 200, {
        ok: true,
        paystack: paystackConfigured(),
        demoPayments: !paystackConfigured(),
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/payments/config') {
      send(res, 200, {
        paystackEnabled: paystackConfigured(),
        demoMode: !paystackConfigured(),
        publicKey: getPublicKey(),
        channels: CHANNEL_LABELS,
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/payments/initialize') {
      const body = await parseBody(req);
      const distributor = state.distributors.find(
        (d) => d.distributorId === body.distributorId,
      );
      if (!distributor) {
        send(res, 404, { error: 'Distributor not found' });
        return;
      }

      let draft;
      try {
        // Prices and totals always come from the distributor VWL catalog —
        // client-supplied totals are ignored.
        draft = buildOrderDraft(body, distributor);
      } catch (e) {
        send(res, 400, { error: String(e.message || e) });
        return;
      }

      const reference = draft.orderRef;
      const amountKobo = Math.round(draft.totalNgn * 100);
      const email = body.email || `${body.merchantId}@merchant.openmarket.africa`;

      let authorizationUrl = '';
      let accessCode = '';
      let demoMode = false;

      if (paystackConfigured()) {
        const init = await initializeTransaction({
          email,
          amountKobo,
          reference,
          metadata: {
            orderId: draft.id,
            merchantShop: body.merchantShop,
            distributorId: body.distributorId,
          },
          callbackUrl: body.callbackUrl,
        });
        authorizationUrl = init.authorizationUrl;
        accessCode = init.accessCode;
      } else {
        demoMode = true;
        authorizationUrl = `http://localhost:${PORT}/pay/demo?ref=${encodeURIComponent(reference)}`;
        accessCode = 'demo';
      }

      const payment = {
        reference,
        orderId: draft.id,
        orderRef: draft.orderRef,
        status: 'pending',
        amountNgn: draft.totalNgn,
        email,
        authorizationUrl,
        accessCode,
        demoMode,
        orderDraft: draft,
        createdAt: new Date().toISOString(),
      };

      state.payments = state.payments.filter((p) => p.reference !== reference);
      state.payments.unshift(payment);
      writeState(state);

      send(res, 201, {
        reference,
        orderId: draft.id,
        orderRef: draft.orderRef,
        authorizationUrl,
        accessCode,
        amountNgn: draft.totalNgn,
        demoMode,
        channels: PAYSTACK_CHANNELS,
      });
      return;
    }

    const payGetMatch = url.pathname.match(/^\/payments\/([^/]+)$/);
    if (req.method === 'GET' && payGetMatch && payGetMatch[1] !== 'config') {
      const reference = decodeURIComponent(payGetMatch[1]);
      const payment = state.payments.find((p) => p.reference === reference);
      if (!payment) {
        send(res, 404, { error: 'Payment not found' });
        return;
      }
      send(res, 200, paymentResponse(state, payment));
      return;
    }

    const payVerifyMatch = url.pathname.match(/^\/payments\/([^/]+)\/verify$/);
    if (req.method === 'POST' && payVerifyMatch) {
      const reference = decodeURIComponent(payVerifyMatch[1]);
      const result = await handleVerify(state, reference);
      if (result.status === 404) {
        send(res, 404, { error: result.error });
        return;
      }
      send(res, 200, result.body);
      return;
    }

    const paySimMatch = url.pathname.match(/^\/payments\/([^/]+)\/simulate-success$/);
    if (req.method === 'POST' && paySimMatch) {
      const allow =
        process.env.ALLOW_PAYMENT_SIMULATE === 'true' || !paystackConfigured();
      if (!allow) {
        send(res, 403, { error: 'Simulation disabled' });
        return;
      }
      const reference = decodeURIComponent(paySimMatch[1]);
      const finalized = finalizePayment(state, reference, { channel: 'demo' });
      if (finalized.order) afterOrderFinalized(finalized.state, finalized.order);
      writeState(finalized.state);
      send(res, 200, paymentResponse(finalized.state, finalized.payment));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/webhooks/paystack') {
      const raw = await parseRawBody(req);
      const signature = req.headers['x-paystack-signature'];
      if (!verifyWebhookSignature(raw, signature)) {
        send(res, 401, { error: 'Invalid signature' });
        return;
      }
      const event = JSON.parse(raw);
      if (event.event === 'charge.success') {
        const reference = event.data?.reference;
        if (reference) {
          state = readState();
          const finalized = finalizePayment(state, reference, {
            channel: event.data?.channel,
            paidAt: event.data?.paid_at,
          });
          if (finalized.order) afterOrderFinalized(finalized.state, finalized.order);
          writeState(finalized.state);
        }
      }
      send(res, 200, { received: true });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/pay/demo') {
      const ref = url.searchParams.get('ref') ?? '';
      sendHtml(
        res,
        200,
        `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>OpenMarket Pay Demo</title>
        <style>body{font-family:system-ui;max-width:420px;margin:40px auto;padding:24px}
        button{background:#0B6E6E;color:#fff;border:0;padding:14px 24px;border-radius:8px;font-size:16px;cursor:pointer;width:100%}
        </style></head><body>
        <h1>OpenMarket · Demo payment</h1>
        <p>Reference: <strong>${ref}</strong></p>
        <p>Paystack keys not configured — simulate a successful payment.</p>
        <button onclick="fetch('/payments/${encodeURIComponent(ref)}/simulate-success',{method:'POST'}).then(()=>alert('Payment recorded. Return to the merchant app and tap Verify payment.'))">Simulate success</button>
        </body></html>`,
      );
      return;
    }

    if (req.method === 'GET' && url.pathname === '/state') {
      if (!requireAdmin(req, res)) return;
      send(res, 200, state);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/distributors') {
      const market = url.searchParams.get('market');
      const list = state.distributors.filter((d) => marketMatch(d, market));
      send(res, 200, list);
      return;
    }

    const distMatch = url.pathname.match(/^\/distributors\/([^/]+)$/);
    if (req.method === 'GET' && distMatch) {
      const found = state.distributors.find((d) => d.distributorId === distMatch[1]);
      if (!found) {
        send(res, 404, { error: 'Distributor not found' });
        return;
      }
      send(res, 200, found);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/distributors') {
      const body = await parseBody(req);
      const now = new Date().toISOString();
      const existingIdx = state.distributors.findIndex((d) => d.distributorId === body.distributorId);
      const record = {
        ...body,
        catalog: body.catalog ?? [],
        registeredAt: existingIdx >= 0 ? state.distributors[existingIdx].registeredAt : now,
        updatedAt: now,
      };
      if (existingIdx >= 0) state.distributors[existingIdx] = record;
      else state.distributors.push(record);
      writeState(state);
      send(res, 200, record);
      return;
    }

    const catalogMatch = url.pathname.match(/^\/distributors\/([^/]+)\/catalog$/);
    if (req.method === 'PUT' && catalogMatch) {
      const body = await parseBody(req);
      const idx = state.distributors.findIndex((d) => d.distributorId === catalogMatch[1]);
      if (idx < 0) {
        send(res, 404, { error: 'Distributor not found' });
        return;
      }
      state.distributors[idx] = {
        ...state.distributors[idx],
        catalog: body.catalog ?? [],
        updatedAt: new Date().toISOString(),
      };
      writeState(state);
      send(res, 200, state.distributors[idx]);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/orders') {
      const distributorId = url.searchParams.get('distributorId');
      const list = distributorId
        ? state.orders.filter((o) => o.distributorId === distributorId)
        : state.orders;
      send(res, 200, list);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/orders') {
      const body = await parseBody(req);
      const existing = state.orders.find((o) => o.id === body.id);
      if (existing) {
        send(res, 200, existing);
        return;
      }
      const order = { ...body, status: body.status ?? 'payment_verified' };
      state.orders.unshift(order);
      writeState(state);
      send(res, 201, order);
      return;
    }

    const orderMatch = url.pathname.match(/^\/orders\/([^/]+)$/);
    if (req.method === 'GET' && orderMatch) {
      const found = state.orders.find((o) => o.id === orderMatch[1]);
      if (!found) {
        send(res, 404, { error: 'Order not found' });
        return;
      }
      send(res, 200, found);
      return;
    }

    if (req.method === 'PATCH' && orderMatch) {
      const body = await parseBody(req);
      const idx = state.orders.findIndex((o) => o.id === orderMatch[1]);
      if (idx < 0) {
        send(res, 404, { error: 'Order not found' });
        return;
      }
      state.orders[idx] = { ...state.orders[idx], ...body };
      syncLogisticsJobWithOrderStatus(state, state.orders[idx]);
      writeState(state);
      send(res, 200, state.orders[idx]);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/affiliates') {
      const body = await parseBody(req);
      const now = new Date().toISOString();
      const existingIdx = state.affiliates.findIndex((a) => a.referrerCode === body.referrerCode);
      const record = {
        ...body,
        registeredAt: existingIdx >= 0 ? state.affiliates[existingIdx].registeredAt : now,
      };
      if (existingIdx >= 0) state.affiliates[existingIdx] = record;
      else state.affiliates.push(record);
      writeState(state);
      send(res, 200, record);
      return;
    }

    const dashboardMatch = url.pathname.match(/^\/affiliates\/([^/]+)\/dashboard$/);
    if (req.method === 'GET' && dashboardMatch) {
      const code = decodeURIComponent(dashboardMatch[1]);
      const dashboard = affiliateDashboard(state, code);
      if (!dashboard) {
        send(res, 404, { error: 'Affiliate not found' });
        return;
      }
      send(res, 200, dashboard);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/referrals') {
      const body = await parseBody(req);
      const affiliate = state.affiliates.find((a) => a.referrerCode === body.referrerCode);
      if (!affiliate) {
        send(res, 404, { error: 'Invalid referrer code' });
        return;
      }
      const existing = state.referrals.find((r) => r.merchantId === body.merchantId);
      if (existing) {
        send(res, 200, existing);
        return;
      }
      const referral = {
        id: `ref-${Date.now()}`,
        referrerCode: body.referrerCode,
        merchantId: body.merchantId,
        merchantShop: body.merchantShop,
        merchantMarket: body.merchantMarket,
        referredAt: new Date().toISOString(),
        status: 'signed_up',
      };
      state.referrals.unshift(referral);
      writeState(state);
      send(res, 201, referral);
      return;
    }

    // Referral activation has no public endpoint — it fires inside
    // finalizePayment (payments.mjs) only after a payment is verified.

    if (req.method === 'POST' && url.pathname === '/register') {
      const body = await parseBody(req);
      if (!body.audience || !body.name || !body.phone || !body.business) {
        send(res, 400, { error: 'audience, name, phone, and business are required' });
        return;
      }
      const result = ingestRegistration(state, body);
      writeState(state);
      send(res, 201, { ok: true, leadId: result.lead.id, provisioned: result.provisioned });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/leads') {
      if (!requireAdmin(req, res)) return;
      send(res, 200, state.leads ?? []);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/manufacturers') {
      const body = await parseBody(req);
      const now = new Date().toISOString();
      const manufacturerId = body.manufacturerId || `mfg-${Date.now().toString(36)}`;
      const record = {
        manufacturerId,
        companyName: body.companyName || body.business,
        contactName: body.contactName || body.name,
        phone: body.phone,
        email: body.email || '',
        country: body.country || '',
        category: body.category || '',
        interest: body.interest || body.manufacturerInterest || 'all',
        targetMarkets: body.targetMarkets || '',
        companySize: body.companySize,
        registeredAt: now,
      };
      const idx = state.manufacturers.findIndex((m) => m.manufacturerId === manufacturerId);
      if (idx >= 0) state.manufacturers[idx] = { ...state.manufacturers[idx], ...record };
      else state.manufacturers.push(record);
      writeState(state);
      send(res, 200, record);
      return;
    }

    const mfgDashMatch = url.pathname.match(/^\/manufacturers\/([^/]+)\/dashboard$/);
    if (req.method === 'GET' && mfgDashMatch) {
      const dashboard = manufacturerDashboard(state, decodeURIComponent(mfgDashMatch[1]));
      if (!dashboard) {
        send(res, 404, { error: 'Manufacturer not found' });
        return;
      }
      send(res, 200, dashboard);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/campaigns') {
      const body = await parseBody(req);
      const now = new Date().toISOString();
      const campaign = {
        id: `camp-${Date.now()}`,
        manufacturerId: body.manufacturerId,
        manufacturerName: body.manufacturerName,
        title: body.title,
        marketCluster: body.marketCluster,
        category: body.category || '',
        discountNgn: Number(body.discountNgn) || 0,
        skuPattern: body.skuPattern,
        startsAt: body.startsAt || now,
        endsAt: body.endsAt || new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        active: body.active !== false,
      };
      state.campaigns.unshift(campaign);
      writeState(state);
      send(res, 201, campaign);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/campaigns/active') {
      const market = url.searchParams.get('market') || '';
      const category = url.searchParams.get('category') || '';
      send(res, 200, activeCampaigns(state, market, category));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/logistics/partners') {
      const body = await parseBody(req);
      const now = new Date().toISOString();
      const partnerId = body.partnerId || `log-${Date.now().toString(36)}`;
      const record = {
        partnerId,
        companyName: body.companyName || body.business,
        contactName: body.contactName || body.name,
        phone: body.phone,
        email: body.email || '',
        corridors: body.corridors || '',
        fleet: body.fleet || '',
        license: body.license || '',
        insurance: body.insurance || '',
        crossBorder: body.crossBorder || '',
        registeredAt: now,
      };
      const idx = state.logisticsPartners.findIndex((p) => p.partnerId === partnerId);
      if (idx >= 0) state.logisticsPartners[idx] = { ...state.logisticsPartners[idx], ...record };
      else state.logisticsPartners.push(record);
      writeState(state);
      send(res, 200, record);
      return;
    }

    const logDashMatch = url.pathname.match(/^\/logistics\/partners\/([^/]+)\/dashboard$/);
    if (req.method === 'GET' && logDashMatch) {
      const dashboard = logisticsDashboard(state, decodeURIComponent(logDashMatch[1]));
      if (!dashboard) {
        send(res, 404, { error: 'Logistics partner not found' });
        return;
      }
      send(res, 200, dashboard);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/logistics/jobs') {
      const partnerId = url.searchParams.get('partnerId');
      const list = partnerId
        ? state.logisticsJobs.filter((j) => j.partnerId === partnerId)
        : state.logisticsJobs;
      send(res, 200, list);
      return;
    }

    const logJobMatch = url.pathname.match(/^\/logistics\/jobs\/([^/]+)$/);
    if (req.method === 'PATCH' && logJobMatch) {
      const body = await parseBody(req);
      const idx = state.logisticsJobs.findIndex((j) => j.id === logJobMatch[1]);
      if (idx < 0) {
        send(res, 404, { error: 'Job not found' });
        return;
      }
      state.logisticsJobs[idx] = {
        ...state.logisticsJobs[idx],
        ...body,
        updatedAt: new Date().toISOString(),
      };
      writeState(state);
      send(res, 200, state.logisticsJobs[idx]);
      return;
    }

    send(res, 404, { error: 'Not found' });
  } catch (e) {
    console.error(e);
    send(res, 500, { error: String(e.message || e) });
  }
});

server.listen(PORT, () => {
  console.log(`OpenMarket API on http://localhost:${PORT}`);
  console.log(`Paystack: ${paystackConfigured() ? 'enabled' : 'demo mode (add keys to backend/.env)'}`);
});
