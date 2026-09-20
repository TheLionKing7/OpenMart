import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3099);
const STATE_FILE = path.join(__dirname, 'platform-state.json');
const ACTIVATION_BOUNTY_NGN = 3000;

const emptyState = () => ({
  distributors: [],
  orders: [],
  affiliates: [],
  referrals: [],
  commissions: [],
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
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
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

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const state = readState();

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      send(res, 200, { ok: true });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/state') {
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
    if (req.method === 'PATCH' && orderMatch) {
      const body = await parseBody(req);
      const idx = state.orders.findIndex((o) => o.id === orderMatch[1]);
      if (idx < 0) {
        send(res, 404, { error: 'Order not found' });
        return;
      }
      state.orders[idx] = { ...state.orders[idx], ...body };
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

    if (req.method === 'POST' && url.pathname === '/referrals/activate') {
      const body = await parseBody(req);
      const referral = state.referrals.find(
        (r) => r.merchantId === body.merchantId && r.status === 'signed_up',
      );
      if (!referral) {
        send(res, 200, { activated: false });
        return;
      }

      const now = new Date().toISOString();
      referral.status = 'activated';
      referral.activatedAt = now;
      referral.firstOrderRef = body.orderRef;

      const existingCommission = state.commissions.find((c) => c.referralId === referral.id);
      if (!existingCommission) {
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

      writeState(state);
      send(res, 200, { activated: true, referral });
      return;
    }

    send(res, 404, { error: 'Not found' });
  } catch (e) {
    send(res, 500, { error: String(e) });
  }
});

server.listen(PORT, () => {
  console.log(`OpenMarket platform sync on http://localhost:${PORT}`);
});
