const LOGISTICS_FEE_RATE = 0.03;

function slugId(prefix, name) {
  const base = String(name || prefix)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
  return `${prefix}-${base || 'x'}-${Date.now().toString(36).slice(-4)}`;
}

function parseMarkets(coverage, marketHub) {
  const parts = String(coverage || '')
    .split(/[,;|/]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (marketHub && !parts.some((p) => p.toLowerCase() === marketHub.toLowerCase())) {
    parts.unshift(marketHub);
  }
  return parts.length ? parts : marketHub ? [marketHub] : [];
}

export function extensionDefaults() {
  return {
    leads: [],
    manufacturers: [],
    logisticsPartners: [],
    logisticsJobs: [],
    campaigns: [],
  };
}

export function ingestRegistration(state, body) {
  const audience = body.audience;
  const now = new Date().toISOString();
  const lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    audience,
    submittedAt: now,
    status: 'new',
    ...Object.fromEntries(
      Object.entries(body).filter(([, v]) => v != null && String(v).trim()),
    ),
  };
  state.leads.unshift(lead);

  const result = { lead, provisioned: null };

  if (audience === 'affiliate') {
    const referrerCode = `AFF-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    const profile = {
      affiliateId: slugId('aff', body.business),
      referrerCode,
      name: body.name,
      phone: body.phone,
      markets: parseMarkets(body.outreach, body.marketHub),
      registeredAt: now,
    };
    const idx = state.affiliates.findIndex((a) => a.phone === body.phone);
    if (idx >= 0) state.affiliates[idx] = { ...state.affiliates[idx], ...profile };
    else state.affiliates.push(profile);
    result.provisioned = { type: 'affiliate', referrerCode };
    lead.status = 'onboarded';
  }

  if (audience === 'distributor') {
    const distributorId = slugId('dist', body.business);
    const record = {
      distributorId,
      distributorName: body.business,
      stallLabel: body.business,
      lga: body.warehouseCity || '',
      operatorName: body.name,
      phone: body.phone,
      servesMarkets: parseMarkets(body.coverage, body.marketHub),
      hasLogistics: false,
      minLeadTimeDays: 1,
      orderingConditions: `SKU count: ${body.skuCount || '—'}. Categories: ${body.categories || '—'}.`,
      catalog: [],
      registeredAt: now,
      updatedAt: now,
    };
    const idx = state.distributors.findIndex((d) => d.phone === body.phone);
    if (idx >= 0) state.distributors[idx] = { ...state.distributors[idx], ...record };
    else state.distributors.push(record);
    result.provisioned = { type: 'distributor', distributorId };
    lead.status = 'onboarded';
  }

  if (audience === 'manufacturer') {
    const manufacturerId = slugId('mfg', body.business);
    const profile = {
      manufacturerId,
      companyName: body.business,
      contactName: body.name,
      phone: body.phone,
      email: body.email || '',
      country: body.country || '',
      category: body.category || '',
      interest: body.manufacturerInterest || 'all',
      targetMarkets: body.targetMarkets || '',
      companySize: body.companySize,
      registeredAt: now,
    };
    const idx = state.manufacturers.findIndex((m) => m.email === body.email);
    if (idx >= 0) state.manufacturers[idx] = { ...state.manufacturers[idx], ...profile };
    else state.manufacturers.push(profile);
    result.provisioned = { type: 'manufacturer', manufacturerId };
    lead.status = 'onboarded';
  }

  if (audience === 'logistics') {
    const partnerId = slugId('log', body.business);
    const partner = {
      partnerId,
      companyName: body.business,
      contactName: body.name,
      phone: body.phone,
      email: body.email || '',
      corridors: body.corridors || '',
      fleet: body.fleet || '',
      license: body.license || '',
      insurance: body.insurance || '',
      crossBorder: body.crossBorder || '',
      registeredAt: now,
    };
    const idx = state.logisticsPartners.findIndex((p) => p.phone === body.phone);
    if (idx >= 0) state.logisticsPartners[idx] = { ...state.logisticsPartners[idx], ...partner };
    else state.logisticsPartners.push(partner);
    result.provisioned = { type: 'logistics', partnerId };
    lead.status = 'onboarded';
  }

  return result;
}

export function matchLogisticsPartner(state, market) {
  const m = String(market || '').toLowerCase();
  if (!m) return state.logisticsPartners[0] ?? null;
  return (
    state.logisticsPartners.find((p) => p.corridors.toLowerCase().includes(m)) ??
    state.logisticsPartners[0] ??
    null
  );
}

export function createLogisticsJobForOrder(state, order, { requestLogistics, distributor }) {
  const needsJob = requestLogistics || distributor?.hasLogistics;
  if (!needsJob) return null;
  if (state.logisticsJobs.some((j) => j.orderId === order.id && j.status !== 'cancelled')) {
    return state.logisticsJobs.find((j) => j.orderId === order.id);
  }

  const partner = matchLogisticsPartner(state, order.merchantMarket);
  if (!partner) return null;

  const now = new Date().toISOString();
  const job = {
    id: `job-${Date.now()}`,
    orderId: order.id,
    orderRef: order.orderRef,
    partnerId: partner.partnerId,
    partnerName: partner.companyName,
    distributorId: order.distributorId,
    merchantShop: order.merchantShop,
    merchantMarket: order.merchantMarket,
    routeLabel: `${order.merchantMarket} → ${distributor?.lga || order.distributorId}`,
    feeNgn: Math.round(order.totalNgn * LOGISTICS_FEE_RATE),
    status: 'pending_quote',
    createdAt: now,
    updatedAt: now,
  };
  state.logisticsJobs.unshift(job);
  order.logisticsJobId = job.id;
  order.requestLogistics = Boolean(requestLogistics || distributor?.hasLogistics);
  return job;
}

export function syncLogisticsJobWithOrderStatus(state, order) {
  const job = state.logisticsJobs.find((j) => j.orderId === order.id);
  if (!job) return;
  const now = new Date().toISOString();
  if (order.status === 'ready_to_pack' && job.status === 'pending_quote') {
    job.status = 'quote_accepted';
    job.updatedAt = now;
  }
  if (order.status === 'out_for_delivery') {
    job.status = 'in_transit';
    job.updatedAt = now;
  }
  if (order.status === 'completed') {
    job.status = 'delivered';
    job.updatedAt = now;
  }
}

export function logisticsDashboard(state, partnerId) {
  const partner = state.logisticsPartners.find((p) => p.partnerId === partnerId);
  if (!partner) return null;
  const jobs = state.logisticsJobs.filter((j) => j.partnerId === partnerId);
  return {
    partner,
    stats: {
      activeJobs: jobs.filter((j) => !['delivered', 'cancelled'].includes(j.status)).length,
      deliveredJobs: jobs.filter((j) => j.status === 'delivered').length,
      pendingQuotes: jobs.filter((j) => j.status === 'pending_quote').length,
    },
    jobs: jobs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
  };
}

export function manufacturerDashboard(state, manufacturerId) {
  const manufacturer = state.manufacturers.find((m) => m.manufacturerId === manufacturerId);
  if (!manufacturer) return null;
  const campaigns = state.campaigns.filter((c) => c.manufacturerId === manufacturerId);
  return { manufacturer, campaigns };
}

export function activeCampaigns(state, market, category) {
  const now = Date.now();
  const m = String(market || '').toLowerCase();
  const c = String(category || '').toLowerCase();
  return state.campaigns.filter((camp) => {
    if (!camp.active) return false;
    if (new Date(camp.endsAt).getTime() < now) return false;
    if (new Date(camp.startsAt).getTime() > now) return false;
    if (m && !camp.marketCluster.toLowerCase().includes(m) && !m.includes(camp.marketCluster.toLowerCase())) {
      return false;
    }
    if (c && camp.category && !camp.category.toLowerCase().includes(c)) return false;
    return true;
  });
}
