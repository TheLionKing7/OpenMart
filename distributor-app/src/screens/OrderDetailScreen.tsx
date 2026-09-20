import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusPill } from '../components/StatusPill';
import { useDistributor } from '../context/DistributorContext';
import { MainStackParamList } from '../navigation/types';
import { FULFILLMENT_STEPS, nextStatus } from '../types/fulfillment';
import { formatNgn, formatTime } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'OrderDetail'>;

export function OrderDetailScreen({ route, navigation }: Props) {
  const { getOrder, advanceOrder } = useDistributor();
  const order = getOrder(route.params.orderId);

  if (!order) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Order not found.</Text>
      </View>
    );
  }

  const next = nextStatus(order.status);
  const nextLabel =
    next === 'allocated'
      ? 'Allocate stock'
      : next === 'ready_to_pack'
        ? 'Mark ready to pack'
        : next === 'out_for_delivery'
          ? 'Dispatch for delivery'
          : next === 'completed'
            ? 'Mark completed'
            : null;

  const currentIdx = FULFILLMENT_STEPS.findIndex((s) => s.id === order.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.ref}>{order.orderRef}</Text>
        <StatusPill status={order.status} />
      </View>

      <Text style={styles.shop}>{order.merchantShop}</Text>
      <Text style={styles.meta}>
        {order.merchantMarket} · Paid {formatTime(order.paidAt)}
      </Text>

      {order.requestLogistics ? (
        <View style={styles.logisticsBanner}>
          <Text style={styles.logisticsTitle}>Partner logistics requested</Text>
          <Text style={styles.logisticsMeta}>
            {order.logisticsJobId ? `Job ${order.logisticsJobId}` : 'Job pending assignment'}
          </Text>
        </View>
      ) : null}

      <View style={styles.timeline}>
        {FULFILLMENT_STEPS.map((step, idx) => {
          const done = idx <= currentIdx;
          return (
            <View key={step.id} style={styles.step}>
              <View style={[styles.dot, done && styles.dotDone]} />
              <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{step.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Line items</Text>
        {order.lines.map((line) => (
          <View key={line.sku} style={styles.lineRow}>
            <Text style={styles.lineName}>
              {line.quantity}× {line.name}
            </Text>
            <Text style={styles.linePrice}>{formatNgn(line.unitPriceNgn * line.quantity)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settlement split</Text>
        <View style={styles.splitRow}>
          <Text style={styles.splitLabel}>Order total</Text>
          <Text style={styles.splitValue}>{formatNgn(order.totalNgn)}</Text>
        </View>
        <View style={styles.splitRow}>
          <Text style={styles.splitLabel}>Your payout (95%)</Text>
          <Text style={[styles.splitValue, styles.payout]}>{formatNgn(order.distributorPayoutNgn)}</Text>
        </View>
        <View style={styles.splitRow}>
          <Text style={styles.splitLabel}>Platform fee (5%)</Text>
          <Text style={styles.splitValue}>{formatNgn(order.platformFeeNgn)}</Text>
        </View>
      </View>

      {nextLabel ? (
        <PrimaryButton
          label={nextLabel}
          onPress={() => {
            advanceOrder(order.id);
            if (next === 'completed') navigation.goBack();
          }}
          style={styles.cta}
        />
      ) : (
        <Text style={styles.done}>Order fulfilled and settled.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.body, color: colors.muted },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ref: { ...typography.title, color: colors.ink },
  shop: { ...typography.body, color: colors.ink, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.muted },
  logisticsBanner: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 4,
  },
  logisticsTitle: { ...typography.label, color: colors.ink },
  logisticsMeta: { ...typography.caption, color: colors.muted },
  timeline: { gap: spacing.sm, paddingVertical: spacing.md },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border },
  dotDone: { backgroundColor: colors.primary },
  stepLabel: { ...typography.caption, color: colors.muted },
  stepLabelDone: { color: colors.ink, fontWeight: '600' },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.label, color: colors.ink },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between' },
  lineName: { ...typography.body, color: colors.ink, flex: 1 },
  linePrice: { ...typography.body, color: colors.muted },
  splitRow: { flexDirection: 'row', justifyContent: 'space-between' },
  splitLabel: { ...typography.body, color: colors.muted },
  splitValue: { ...typography.label, color: colors.ink },
  payout: { color: colors.success },
  cta: { marginTop: spacing.md },
  done: { ...typography.body, color: colors.success, textAlign: 'center' },
});
