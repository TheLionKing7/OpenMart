import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getOrder as getPlatformOrder } from '../../../shared/platformClient';
import { PrimaryButton } from '../components/PrimaryButton';
import { SettlementTimeline } from '../components/SettlementTimeline';
import { SyncBar } from '../components/SyncBar';
import { useMerchant } from '../context/MerchantContext';
import { MainStackParamList } from '../navigation/types';
import { formatNgn } from '../utils/format';
import { settlementStepFromPlatform } from '../utils/platformStatus';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'Settlement'>;

export function SettlementScreen({ navigation, route }: Props) {
  const { getOrder, advanceSettlement, applySettlementStep } = useMerchant();
  const order = getOrder(route.params.orderId);

  useEffect(() => {
    if (!order || order.settlementStep === 'settled') return;

    const sync = async () => {
      const platformOrder = await getPlatformOrder(order.id);
      if (!platformOrder) return;
      const step = settlementStepFromPlatform(
        platformOrder.status,
        platformOrder.requestLogistics,
      );
      applySettlementStep(order.id, step);
    };

    sync();
    const timer = setInterval(sync, 5000);
    return () => clearInterval(timer);
  }, [order, applySettlementStep]);

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Order not found</Text>
        <PrimaryButton label="Back to home" onPress={() => navigation.navigate('Home')} />
      </View>
    );
  }

  const isSettled = order.settlementStep === 'settled';

  return (
    <View style={styles.container}>
      <SyncBar />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settlement</Text>
        <Text style={styles.ref}>{order.orderRef}</Text>
        <Text style={styles.meta}>
          {order.distributorName} · {order.itemCount} items · {formatNgn(order.totalNgn)}
        </Text>

        <View style={styles.splitCard}>
          <Text style={styles.splitTitle}>Split ledger</Text>
          <View style={styles.splitRow}>
            <Text style={styles.splitLabel}>Distributor payout (95%)</Text>
            <Text style={styles.splitValue}>{formatNgn(order.distributorPayoutNgn)}</Text>
          </View>
          <View style={styles.splitRow}>
            <Text style={styles.splitLabel}>Platform fee (5%)</Text>
            <Text style={styles.splitValue}>{formatNgn(order.platformFeeNgn)}</Text>
          </View>
        </View>

        <SettlementTimeline
          currentStep={order.settlementStep}
          showDemoControl
          onAdvanceDemo={() => advanceSettlement(order.id)}
        />

        {isSettled ? (
          <View style={styles.stockNote}>
            <Text style={styles.stockNoteTitle}>Shop stock updated</Text>
            <Text style={styles.stockNoteBody}>
              {order.orderLines.length} SKU{order.orderLines.length === 1 ? '' : 's'} added to your shop ledger.
              Record sales from Home to track depletion.
            </Text>
          </View>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        {isSettled ? (
          <PrimaryButton
            label="Back to home"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
          />
        ) : (
          <PrimaryButton
            label="Continue tracking"
            variant="secondary"
            onPress={() => navigation.navigate('Home')}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.title, color: colors.ink },
  ref: { ...typography.label, color: colors.muted, letterSpacing: 1 },
  meta: { ...typography.body, color: colors.muted },
  splitCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  splitTitle: { ...typography.label, color: colors.ink },
  splitRow: { flexDirection: 'row', justifyContent: 'space-between' },
  splitLabel: { ...typography.caption, color: colors.muted },
  splitValue: { ...typography.caption, color: colors.ink, fontWeight: '700' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  error: { ...typography.body, color: colors.error, padding: spacing.xl },
  stockNote: {
    padding: spacing.lg,
    backgroundColor: colors.successBg,
    borderRadius: 8,
    gap: spacing.xs,
  },
  stockNoteTitle: { ...typography.label, color: colors.success },
  stockNoteBody: { ...typography.caption, color: colors.muted, lineHeight: 18 },
});
