import { PlatformOrderStatus } from '../../../shared/types';
import { SettlementStepId } from '../types/order';

export function settlementStepFromPlatform(
  status: PlatformOrderStatus,
  requestLogistics?: boolean,
): SettlementStepId {
  switch (status) {
    case 'payment_verified':
      return 'payment_verified';
    case 'allocated':
      return 'settlement_split';
    case 'ready_to_pack':
      return requestLogistics ? 'runner_assigned' : 'inventory_allocated';
    case 'out_for_delivery':
      return 'out_for_delivery';
    case 'completed':
      return 'settled';
    default:
      return 'payment_verified';
  }
}
