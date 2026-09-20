export type FulfillmentStatus =
  | 'payment_verified'
  | 'allocated'
  | 'ready_to_pack'
  | 'out_for_delivery'
  | 'completed';

export type OrderLine = {
  sku: string;
  name: string;
  quantity: number;
  unitPriceNgn: number;
};

export type IncomingOrder = {
  id: string;
  orderRef: string;
  merchantShop: string;
  merchantMarket: string;
  distributorId: string;
  totalNgn: number;
  distributorPayoutNgn: number;
  platformFeeNgn: number;
  lines: OrderLine[];
  status: FulfillmentStatus;
  createdAt: string;
  paidAt: string;
  completedAt?: string;
  requestLogistics?: boolean;
  logisticsJobId?: string;
};

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  priceNgn: number;
  distributorId: string;
  quantityOnHand: number;
  reserved: number;
};

export type PayoutRecord = {
  id: string;
  orderRef: string;
  amountNgn: number;
  paidAt: string;
  status: 'credited' | 'pending';
};

export const FULFILLMENT_STEPS: { id: FulfillmentStatus; label: string }[] = [
  { id: 'payment_verified', label: 'Payment verified' },
  { id: 'allocated', label: 'Stock allocated' },
  { id: 'ready_to_pack', label: 'Ready to pack' },
  { id: 'out_for_delivery', label: 'Out for delivery' },
  { id: 'completed', label: 'Completed' },
];

export const STATUS_SEQUENCE: FulfillmentStatus[] = [
  'payment_verified',
  'allocated',
  'ready_to_pack',
  'out_for_delivery',
  'completed',
];

export function nextStatus(current: FulfillmentStatus): FulfillmentStatus | null {
  const idx = STATUS_SEQUENCE.indexOf(current);
  if (idx === -1 || idx >= STATUS_SEQUENCE.length - 1) return null;
  return STATUS_SEQUENCE[idx + 1];
}

export function statusLabel(status: FulfillmentStatus): string {
  return FULFILLMENT_STEPS.find((s) => s.id === status)?.label ?? status;
}

export function queueTabFor(status: FulfillmentStatus): string {
  if (status === 'payment_verified') return 'allocate';
  if (status === 'allocated' || status === 'ready_to_pack') return 'pack';
  if (status === 'out_for_delivery') return 'delivery';
  return 'done';
}
