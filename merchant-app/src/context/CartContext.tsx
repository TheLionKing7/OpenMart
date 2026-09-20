import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Product } from '../data/products';

export type CartLine = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  distributorId: string | null;
  distributorName: string | null;
  setDistributor: (distributorId: string, distributorName: string) => void;
  addOrUpdate: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clear: () => void;
  itemCount: number;
  subtotalNgn: number;
  subsidyTotalNgn: number;
  totalNgn: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [distributorId, setDistributorId] = useState<string | null>(null);
  const [distributorName, setDistributorName] = useState<string | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);

  const setDistributor = useCallback((id: string, name: string) => {
    setDistributorId(id);
    setDistributorName(name);
    setLines([]);
  }, []);

  const addOrUpdate = useCallback((product: Product, quantity: number) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.product.id === product.id);
      if (quantity <= 0) {
        return prev.filter((l) => l.product.id !== product.id);
      }
      if (idx === -1) return [...prev, { product, quantity }];
      const next = [...prev];
      next[idx] = { product, quantity };
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((l) => l.product.id !== productId);
      return prev.map((l) => (l.product.id === productId ? { ...l, quantity } : l));
    });
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const itemCount = useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines]);

  const subtotalNgn = useMemo(
    () => lines.reduce((s, l) => s + l.product.priceNgn * l.quantity, 0),
    [lines],
  );

  const subsidyTotalNgn = useMemo(
    () =>
      lines.reduce(
        (s, l) => s + (l.product.manufacturerSubsidyNgn ?? 0) * l.quantity,
        0,
      ),
    [lines],
  );

  const totalNgn = subtotalNgn - subsidyTotalNgn;

  const value = useMemo(
    () => ({
      lines,
      distributorId,
      distributorName,
      setDistributor,
      addOrUpdate,
      updateQuantity,
      removeLine,
      clear,
      itemCount,
      subtotalNgn,
      subsidyTotalNgn,
      totalNgn,
    }),
    [lines, distributorId, distributorName, setDistributor, addOrUpdate, updateQuantity, removeLine, clear, itemCount, subtotalNgn, subsidyTotalNgn, totalNgn],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
