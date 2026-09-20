export type SettlementStepId =
  | 'payment_verified'
  | 'settlement_split'
  | 'inventory_allocated'
  | 'runner_assigned'
  | 'out_for_delivery'
  | 'settled';

export type SettlementStep = {
  id: SettlementStepId;
  label: string;
  detail: string;
};

export type OrderLineRecord = {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  distributorId: string;
  quantity: number;
};

export type OrderRecord = {
  id: string;
  orderRef: string;
  distributorName: string;
  distributorId: string;
  itemCount: number;
  totalNgn: number;
  distributorPayoutNgn: number;
  platformFeeNgn: number;
  linesSummary: string[];
  orderLines: OrderLineRecord[];
  stockReceived: boolean;
  createdAt: string;
  settlementStep: SettlementStepId;
  settledAt?: string;
};

export const SETTLEMENT_STEPS: SettlementStep[] = [
  {
    id: 'payment_verified',
    label: 'Payment verified',
    detail: 'Inbound transfer matched your order signature via NIBSS webhook.',
  },
  {
    id: 'settlement_split',
    label: 'Settlement split',
    detail: '95% routed to distributor wallet · platform fee to operating yield.',
  },
  {
    id: 'inventory_allocated',
    label: 'Inventory allocated',
    detail: 'Goods reserved from virtual warehouse ledger (15-min TTL confirmed).',
  },
  {
    id: 'runner_assigned',
    label: 'Delivery runner assigned',
    detail: '3PL runner notified to pick up pre-allocated stock.',
  },
  {
    id: 'out_for_delivery',
    label: 'Out for delivery',
    detail: 'Runner en route to your shop with allocated goods.',
  },
  {
    id: 'settled',
    label: 'Settled',
    detail: 'Order complete. Stock received and ledger closed.',
  },
];

export function stepIndex(id: SettlementStepId): number {
  return SETTLEMENT_STEPS.findIndex((s) => s.id === id);
}
