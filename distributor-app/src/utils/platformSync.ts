import {
  registerDistributor,
  updateDistributorCatalog,
  listOrdersForDistributor,
  updateOrderStatus,
} from '../../../shared/platformClient';
import { PlatformCatalogItem } from '../../../shared/types';
import { OperatorProfile } from '../context/DistributorContext';
import { FulfillmentStatus, IncomingOrder, InventoryItem } from '../types/fulfillment';

export function inventoryToCatalog(inventory: InventoryItem[]): PlatformCatalogItem[] {
  return inventory.map((item) => ({
    id: item.id,
    sku: item.sku,
    name: item.name,
    unit: item.unit,
    priceNgn: item.priceNgn,
    quantityOnHand: item.quantityOnHand,
    reserved: item.reserved,
  }));
}

export async function registerOnPlatform(profile: OperatorProfile, catalog: InventoryItem[]) {
  return registerDistributor({
    ...profile,
    catalog: inventoryToCatalog(catalog),
  });
}

export async function pushCatalog(profile: OperatorProfile, inventory: InventoryItem[]) {
  return updateDistributorCatalog(profile.distributorId, inventoryToCatalog(inventory));
}

export function platformOrderToIncoming(order: {
  id: string;
  orderRef: string;
  merchantShop: string;
  merchantMarket: string;
  distributorId: string;
  totalNgn: number;
  distributorPayoutNgn: number;
  platformFeeNgn: number;
  lines: { sku: string; name: string; quantity: number; unitPriceNgn: number }[];
  status: FulfillmentStatus;
  createdAt: string;
  paidAt: string;
  completedAt?: string;
  requestLogistics?: boolean;
  logisticsJobId?: string;
}): IncomingOrder {
  return { ...order };
}

export async function pullOrders(distributorId: string): Promise<IncomingOrder[]> {
  const orders = await listOrdersForDistributor(distributorId);
  return orders.map(platformOrderToIncoming);
}

export async function pushOrderStatus(
  orderId: string,
  status: FulfillmentStatus,
  completedAt?: string,
) {
  return updateOrderStatus(orderId, status, completedAt);
}
