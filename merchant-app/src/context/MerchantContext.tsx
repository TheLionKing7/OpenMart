import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { syncReferralSignup } from '../utils/affiliateSync';
import { OrderLineRecord, OrderRecord, SettlementStepId } from '../types/order';
import { ShopStockItem, defaultLowThreshold, isLowStock } from '../types/stock';

export type MerchantProfile = {
  shopName: string;
  marketArea: string;
  lga: string;
  phone: string;
  preferredDistributorId: string;
  preferredDistributorName: string;
  referrerCode?: string;
};

type MerchantContextValue = {
  loading: boolean;
  onboardingComplete: boolean;
  profile: MerchantProfile | null;
  orders: OrderRecord[];
  shopStock: ShopStockItem[];
  lowStockItems: ShopStockItem[];
  activeOrderId: string | null;
  completeOnboarding: (profile: MerchantProfile) => Promise<void>;
  resetOnboarding: () => Promise<void>;
  createOrder: (order: Omit<OrderRecord, 'settlementStep' | 'settledAt' | 'stockReceived'>) => void;
  advanceSettlement: (orderId: string) => void;
  applySettlementStep: (orderId: string, step: SettlementStepId) => void;
  getOrder: (orderId: string) => OrderRecord | undefined;
  recordSale: (productId: string, quantity?: number) => void;
  receiveStockFromOrder: (orderId: string) => void;
  setPreferredDistributor: (id: string, name: string) => void;
};

const STORAGE_KEY = '@openmarket/merchant';

type StoredState = {
  onboardingComplete: boolean;
  profile: MerchantProfile | null;
  orders: OrderRecord[];
  shopStock: ShopStockItem[];
};

const MerchantContext = createContext<MerchantContextValue | null>(null);

const SETTLEMENT_SEQUENCE: SettlementStepId[] = [
  'payment_verified',
  'settlement_split',
  'inventory_allocated',
  'runner_assigned',
  'out_for_delivery',
  'settled',
];

function mergeStockLine(stock: ShopStockItem[], line: OrderLineRecord): ShopStockItem[] {
  const existing = stock.find((s) => s.productId === line.productId);
  const now = new Date().toISOString();

  if (existing) {
    const quantityOnHand = existing.quantityOnHand + line.quantity;
    const lowStockThreshold = defaultLowThreshold(quantityOnHand);
    return stock.map((s) =>
      s.productId === line.productId
        ? { ...s, quantityOnHand, lowStockThreshold, lastRestockedAt: now }
        : s,
    );
  }

  return [
    ...stock,
    {
      productId: line.productId,
      name: line.name,
      sku: line.sku,
      unit: line.unit,
      distributorId: line.distributorId,
      quantityOnHand: line.quantity,
      lowStockThreshold: defaultLowThreshold(line.quantity),
      lastRestockedAt: now,
    },
  ];
}

export function MerchantProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [shopStock, setShopStock] = useState<ShopStockItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as StoredState;
        setOnboardingComplete(parsed.onboardingComplete);
        setProfile(parsed.profile);
        setOrders(
          (parsed.orders ?? []).map((o) => {
            const legacy = o as OrderRecord & { hubId?: string; hubName?: string };
            return {
              ...o,
              orderLines: (o.orderLines ?? []).map((line) => {
                const l = line as OrderLineRecord & { hubId?: string };
                return { ...line, distributorId: l.distributorId ?? l.hubId ?? '' };
              }),
              stockReceived: o.stockReceived ?? false,
              distributorId: o.distributorId ?? legacy.hubId ?? '',
              distributorName: o.distributorName ?? legacy.hubName ?? '',
            };
          }),
        );
        setShopStock(
          (parsed.shopStock ?? []).map((s) => {
            const l = s as ShopStockItem & { hubId?: string };
            return { ...s, distributorId: l.distributorId ?? l.hubId ?? '' };
          }),
        );
        setShopStock(parsed.shopStock ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(async (next: StoredState) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const saveAll = useCallback(
    (nextOrders: OrderRecord[], nextStock: ShopStockItem[]) => {
      persist({
        onboardingComplete: true,
        profile,
        orders: nextOrders,
        shopStock: nextStock,
      });
    },
    [persist, profile],
  );

  const completeOnboarding = useCallback(
    async (nextProfile: MerchantProfile) => {
      setProfile(nextProfile);
      setOnboardingComplete(true);
      await persist({
        onboardingComplete: true,
        profile: nextProfile,
        orders,
        shopStock,
      });
      await syncReferralSignup(nextProfile);
    },
    [persist, orders, shopStock],
  );

  const resetOnboarding = useCallback(async () => {
    setOnboardingComplete(false);
    setProfile(null);
    setOrders([]);
    setShopStock([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const createOrder = useCallback(
    (order: Omit<OrderRecord, 'settlementStep' | 'settledAt' | 'stockReceived'>) => {
      const record: OrderRecord = {
        ...order,
        settlementStep: 'payment_verified',
        stockReceived: false,
      };
      setOrders((prev) => {
        const next = [record, ...prev];
        saveAll(next, shopStock);
        return next;
      });
    },
    [saveAll, shopStock],
  );

  const receiveStockFromOrder = useCallback(
    (orderId: string) => {
      setOrders((prevOrders) => {
        const order = prevOrders.find((o) => o.id === orderId);
        if (!order || order.stockReceived || order.orderLines.length === 0) {
          return prevOrders;
        }

        let nextStock = shopStock;
        for (const line of order.orderLines) {
          nextStock = mergeStockLine(nextStock, line);
        }

        const nextOrders = prevOrders.map((o) =>
          o.id === orderId ? { ...o, stockReceived: true } : o,
        );

        setShopStock(nextStock);
        saveAll(nextOrders, nextStock);
        return nextOrders;
      });
    },
    [shopStock, saveAll],
  );

  const advanceSettlement = useCallback(
    (orderId: string) => {
      setOrders((prev) => {
        const order = prev.find((o) => o.id === orderId);
        if (!order) return prev;

        const idx = SETTLEMENT_SEQUENCE.indexOf(order.settlementStep);
        if (idx === -1 || idx >= SETTLEMENT_SEQUENCE.length - 1) return prev;

        const newStep = SETTLEMENT_SEQUENCE[idx + 1];
        const nextOrders = prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                settlementStep: newStep,
                settledAt: newStep === 'settled' ? new Date().toISOString() : o.settledAt,
              }
            : o,
        );

        if (newStep === 'settled') {
          if (!order.stockReceived) {
            let nextStock = shopStock;
            for (const line of order.orderLines) {
              nextStock = mergeStockLine(nextStock, line);
            }
            const withStock = nextOrders.map((o) =>
              o.id === orderId ? { ...o, stockReceived: true } : o,
            );
            setShopStock(nextStock);
            saveAll(withStock, nextStock);
            return withStock;
          }
        }

        saveAll(nextOrders, shopStock);
        return nextOrders;
      });
    },
    [shopStock, saveAll],
  );

  const applySettlementStep = useCallback(
    (orderId: string, step: SettlementStepId) => {
      setOrders((prev) => {
        const order = prev.find((o) => o.id === orderId);
        if (!order) return prev;

        const currentIdx = SETTLEMENT_SEQUENCE.indexOf(order.settlementStep);
        const targetIdx = SETTLEMENT_SEQUENCE.indexOf(step);
        if (targetIdx <= currentIdx) return prev;

        let nextOrders = [...prev];
        for (let i = currentIdx + 1; i <= targetIdx; i++) {
          const newStep = SETTLEMENT_SEQUENCE[i];
          nextOrders = nextOrders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  settlementStep: newStep,
                  settledAt: newStep === 'settled' ? new Date().toISOString() : o.settledAt,
                }
              : o,
          );
        }

        const finalOrder = nextOrders.find((o) => o.id === orderId);
        if (finalOrder?.settlementStep === 'settled' && !finalOrder.stockReceived) {
          let nextStock = shopStock;
          for (const line of finalOrder.orderLines) {
            nextStock = mergeStockLine(nextStock, line);
          }
          nextOrders = nextOrders.map((o) =>
            o.id === orderId ? { ...o, stockReceived: true } : o,
          );
          setShopStock(nextStock);
          saveAll(nextOrders, nextStock);
          return nextOrders;
        }

        saveAll(nextOrders, shopStock);
        return nextOrders;
      });
    },
    [shopStock, saveAll],
  );

  const recordSale = useCallback(
    (productId: string, quantity = 1) => {
      setShopStock((prev) => {
        const next = prev.map((item) => {
          if (item.productId !== productId) return item;
          const quantityOnHand = Math.max(0, item.quantityOnHand - quantity);
          return {
            ...item,
            quantityOnHand,
            lastSaleAt: new Date().toISOString(),
          };
        });
        saveAll(orders, next);
        return next;
      });
    },
    [orders, saveAll],
  );

  const setPreferredDistributor = useCallback(
    (id: string, name: string) => {
      if (!profile) return;
      const next = { ...profile, preferredDistributorId: id, preferredDistributorName: name };
      setProfile(next);
      persist({ onboardingComplete: true, profile: next, orders, shopStock });
    },
    [profile, orders, shopStock, persist],
  );

  const getOrder = useCallback((orderId: string) => orders.find((o) => o.id === orderId), [orders]);

  const activeOrderId = useMemo(
    () => orders.find((o) => o.settlementStep !== 'settled')?.id ?? null,
    [orders],
  );

  const lowStockItems = useMemo(() => shopStock.filter(isLowStock), [shopStock]);

  const value = useMemo(
    () => ({
      loading,
      onboardingComplete,
      profile,
      orders,
      shopStock,
      lowStockItems,
      activeOrderId,
      completeOnboarding,
      resetOnboarding,
      createOrder,
      advanceSettlement,
      applySettlementStep,
      getOrder,
      recordSale,
      receiveStockFromOrder,
      setPreferredDistributor,
    }),
    [
      loading,
      onboardingComplete,
      profile,
      orders,
      shopStock,
      lowStockItems,
      activeOrderId,
      completeOnboarding,
      resetOnboarding,
      createOrder,
      advanceSettlement,
      applySettlementStep,
      getOrder,
      recordSale,
      receiveStockFromOrder,
      setPreferredDistributor,
    ],
  );

  return <MerchantContext.Provider value={value}>{children}</MerchantContext.Provider>;
}

export function useMerchant() {
  const ctx = useContext(MerchantContext);
  if (!ctx) throw new Error('useMerchant must be used within MerchantProvider');
  return ctx;
}
