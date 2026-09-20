import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  FulfillmentStatus,
  IncomingOrder,
  InventoryItem,
  PayoutRecord,
  nextStatus,
} from '../types/fulfillment';
import { pullOrders, pushCatalog, pushOrderStatus, registerOnPlatform } from '../utils/platformSync';
import { checkPlatformHealth } from '../../../shared/platformClient';

export type OperatorProfile = {
  distributorId: string;
  distributorName: string;
  stallLabel: string;
  lga: string;
  operatorName: string;
  phone: string;
  servesMarkets: string[];
  hasLogistics: boolean;
  minLeadTimeDays: number;
  orderingConditions: string;
};

type StoredState = {
  onboardingComplete: boolean;
  profile: OperatorProfile | null;
  orders: IncomingOrder[];
  inventory: InventoryItem[];
  payouts: PayoutRecord[];
};

type DistributorContextValue = {
  loading: boolean;
  onboardingComplete: boolean;
  profile: OperatorProfile | null;
  orders: IncomingOrder[];
  inventory: InventoryItem[];
  payouts: PayoutRecord[];
  platformConnected: boolean;
  walletBalanceNgn: number;
  todayPayoutNgn: number;
  pendingCount: number;
  completeOnboarding: (profile: OperatorProfile) => Promise<void>;
  resetOnboarding: () => Promise<void>;
  syncFromPlatform: () => Promise<void>;
  pushCatalogToPlatform: () => Promise<void>;
  addCatalogItem: (item: Omit<InventoryItem, 'distributorId' | 'reserved'>) => void;
  advanceOrder: (orderId: string) => void;
  adjustStock: (sku: string, delta: number) => void;
  getOrder: (id: string) => IncomingOrder | undefined;
  ordersForTab: (tab: 'allocate' | 'pack' | 'delivery' | 'done') => IncomingOrder[];
};

const STORAGE_KEY = '@openmarket/distributor';

const DistributorContext = createContext<DistributorContextValue | null>(null);

function normalizeProfile(raw: Partial<OperatorProfile> & Pick<OperatorProfile, 'distributorId' | 'distributorName' | 'operatorName' | 'phone'>): OperatorProfile {
  return {
    distributorId: raw.distributorId,
    distributorName: raw.distributorName,
    stallLabel: raw.stallLabel ?? '',
    lga: raw.lga ?? '',
    operatorName: raw.operatorName,
    phone: raw.phone,
    servesMarkets: raw.servesMarkets ?? [],
    hasLogistics: raw.hasLogistics ?? false,
    minLeadTimeDays: raw.minLeadTimeDays ?? 1,
    orderingConditions: raw.orderingConditions ?? '',
  };
}

function normalizeInventory(items: InventoryItem[], distributorId: string): InventoryItem[] {
  return items.map((item, idx) => ({
    id: item.id ?? `sku-${item.sku.toLowerCase()}`,
    sku: item.sku,
    name: item.name,
    unit: item.unit,
    priceNgn: item.priceNgn ?? 0,
    distributorId: item.distributorId ?? distributorId,
    quantityOnHand: item.quantityOnHand,
    reserved: item.reserved ?? 0,
  }));
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const t = new Date();
  return d.toDateString() === t.toDateString();
}

function tabFilter(tab: 'allocate' | 'pack' | 'delivery' | 'done', status: FulfillmentStatus): boolean {
  if (tab === 'allocate') return status === 'payment_verified';
  if (tab === 'pack') return status === 'allocated' || status === 'ready_to_pack';
  if (tab === 'delivery') return status === 'out_for_delivery';
  return status === 'completed';
}

function mergeOrders(local: IncomingOrder[], remote: IncomingOrder[]): IncomingOrder[] {
  const map = new Map<string, IncomingOrder>();
  for (const o of remote) map.set(o.id, o);
  for (const o of local) {
    const existing = map.get(o.id);
    if (!existing || o.status !== existing.status) map.set(o.id, o);
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
  );
}

export function DistributorProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [orders, setOrders] = useState<IncomingOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [platformConnected, setPlatformConnected] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as StoredState;
        const p = parsed.profile ? normalizeProfile(parsed.profile) : null;
        setOnboardingComplete(parsed.onboardingComplete);
        setProfile(p);
        setOrders(parsed.orders ?? []);
        setInventory(p ? normalizeInventory(parsed.inventory ?? [], p.distributorId) : []);
        setPayouts(parsed.payouts ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(async (state: StoredState) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, []);

  const pushCatalogToPlatform = useCallback(async () => {
    if (!profile) return;
    const ok = await checkPlatformHealth();
    setPlatformConnected(ok);
    if (!ok) return;
    await pushCatalog(profile, inventory);
  }, [profile, inventory]);

  const syncFromPlatform = useCallback(async () => {
    if (!profile) return;
    const ok = await checkPlatformHealth();
    setPlatformConnected(ok);
    if (!ok) return;

    const remoteOrders = await pullOrders(profile.distributorId);
    setOrders((prev) => {
      const merged = mergeOrders(prev, remoteOrders);
      persist({
        onboardingComplete: true,
        profile,
        orders: merged,
        inventory,
        payouts,
      });
      return merged;
    });
  }, [profile, inventory, payouts, persist]);

  const completeOnboarding = useCallback(
    async (nextProfile: OperatorProfile) => {
      const p = normalizeProfile(nextProfile);
      setProfile(p);
      setOrders([]);
      setInventory([]);
      setPayouts([]);
      setOnboardingComplete(true);
      await persist({
        onboardingComplete: true,
        profile: p,
        orders: [],
        inventory: [],
        payouts: [],
      });

      const ok = await checkPlatformHealth();
      setPlatformConnected(ok);
      if (ok) await registerOnPlatform(p, []);
    },
    [persist],
  );

  const resetOnboarding = useCallback(async () => {
    setOnboardingComplete(false);
    setProfile(null);
    setOrders([]);
    setInventory([]);
    setPayouts([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const saveAll = useCallback(
    (nextOrders: IncomingOrder[], nextInventory: InventoryItem[], nextPayouts: PayoutRecord[]) => {
      if (!profile) return;
      persist({
        onboardingComplete: true,
        profile,
        orders: nextOrders,
        inventory: nextInventory,
        payouts: nextPayouts,
      });
    },
    [profile, persist],
  );

  const advanceOrder = useCallback(
    (orderId: string) => {
      setOrders((prev) => {
        const order = prev.find((o) => o.id === orderId);
        if (!order) return prev;

        const next = nextStatus(order.status);
        if (!next) return prev;

        let nextInventory = inventory;
        if (order.status === 'payment_verified' && next === 'allocated') {
          nextInventory = inventory.map((item) => {
            const line = order.lines.find((l) => l.sku === item.sku);
            if (!line) return item;
            return {
              ...item,
              reserved: item.reserved + line.quantity,
              quantityOnHand: Math.max(0, item.quantityOnHand - line.quantity),
            };
          });
          setInventory(nextInventory);
          if (profile) {
            pushCatalog(profile, nextInventory).catch(() => undefined);
          }
        }

        const completedAt = next === 'completed' ? new Date().toISOString() : order.completedAt;
        const nextOrders = prev.map((o) =>
          o.id === orderId ? { ...o, status: next, completedAt } : o,
        );

        let nextPayouts = payouts;
        if (next === 'allocated' && !payouts.some((p) => p.orderRef === order.orderRef)) {
          nextPayouts = [
            {
              id: `pay-${order.id}`,
              orderRef: order.orderRef,
              amountNgn: order.distributorPayoutNgn,
              paidAt: new Date().toISOString(),
              status: 'credited',
            },
            ...payouts,
          ];
          setPayouts(nextPayouts);
        }

        saveAll(nextOrders, nextInventory, nextPayouts);
        pushOrderStatus(orderId, next, completedAt).catch(() => undefined);
        return nextOrders;
      });
    },
    [inventory, payouts, profile, saveAll],
  );

  const adjustStock = useCallback(
    (sku: string, delta: number) => {
      setInventory((prev) => {
        const next = prev.map((item) =>
          item.sku === sku
            ? { ...item, quantityOnHand: Math.max(0, item.quantityOnHand + delta) }
            : item,
        );
        saveAll(orders, next, payouts);
        if (profile) pushCatalog(profile, next).catch(() => undefined);
        return next;
      });
    },
    [orders, payouts, profile, saveAll],
  );

  const addCatalogItem = useCallback(
    (item: Omit<InventoryItem, 'distributorId' | 'reserved'>) => {
      if (!profile) return;
      setInventory((prev) => {
        const next = [
          ...prev.filter((p) => p.sku !== item.sku),
          { ...item, distributorId: profile.distributorId, reserved: 0 },
        ];
        saveAll(orders, next, payouts);
        pushCatalog(profile, next).catch(() => undefined);
        return next;
      });
    },
    [orders, payouts, profile, saveAll],
  );

  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  const ordersForTab = useCallback(
    (tab: 'allocate' | 'pack' | 'delivery' | 'done') =>
      orders.filter((o) => tabFilter(tab, o.status)),
    [orders],
  );

  const walletBalanceNgn = useMemo(
    () => payouts.filter((p) => p.status === 'credited').reduce((s, p) => s + p.amountNgn, 0),
    [payouts],
  );

  const todayPayoutNgn = useMemo(
    () => payouts.filter((p) => p.status === 'credited' && isToday(p.paidAt)).reduce((s, p) => s + p.amountNgn, 0),
    [payouts],
  );

  const pendingCount = useMemo(
    () => orders.filter((o) => o.status !== 'completed').length,
    [orders],
  );

  const value = useMemo(
    () => ({
      loading,
      onboardingComplete,
      profile,
      orders,
      inventory,
      payouts,
      platformConnected,
      walletBalanceNgn,
      todayPayoutNgn,
      pendingCount,
      completeOnboarding,
      resetOnboarding,
      syncFromPlatform,
      pushCatalogToPlatform,
      addCatalogItem,
      advanceOrder,
      adjustStock,
      getOrder,
      ordersForTab,
    }),
    [
      loading,
      onboardingComplete,
      profile,
      orders,
      inventory,
      payouts,
      platformConnected,
      walletBalanceNgn,
      todayPayoutNgn,
      pendingCount,
      completeOnboarding,
      resetOnboarding,
      syncFromPlatform,
      pushCatalogToPlatform,
      addCatalogItem,
      advanceOrder,
      adjustStock,
      getOrder,
      ordersForTab,
    ],
  );

  return <DistributorContext.Provider value={value}>{children}</DistributorContext.Provider>;
}

export function useDistributor() {
  const ctx = useContext(DistributorContext);
  if (!ctx) throw new Error('useDistributor must be used within DistributorProvider');
  return ctx;
}
