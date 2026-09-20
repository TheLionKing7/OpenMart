export type ShopStockItem = {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  distributorId: string;
  quantityOnHand: number;
  lowStockThreshold: number;
  lastRestockedAt: string;
  lastSaleAt?: string;
};

export function isLowStock(item: ShopStockItem): boolean {
  return item.quantityOnHand <= item.lowStockThreshold;
}

export function defaultLowThreshold(receivedQty: number): number {
  return Math.max(2, Math.floor(receivedQty * 0.2));
}
