import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MetricCard } from '../components/MetricCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusPill } from '../components/StatusPill';
import { useDistributor } from '../context/DistributorContext';
import { MainStackParamList } from '../navigation/types';
import { formatLeadTime, formatNgn, formatTime } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { profile, pendingCount, todayPayoutNgn, walletBalanceNgn, ordersForTab, syncFromPlatform, platformConnected, inventory } =
    useDistributor();

  useFocusEffect(
    useCallback(() => {
      syncFromPlatform();
    }, [syncFromPlatform]),
  );

  const urgent = ordersForTab('allocate');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hello, {profile?.operatorName ?? 'Operator'}</Text>
      <Text style={styles.meta}>
        {profile?.distributorName} · {profile?.stallLabel}
      </Text>

      {profile?.orderingConditions ? (
        <View style={styles.termsCard}>
          <Text style={styles.termsKicker}>Your ordering terms</Text>
          <Text style={styles.termsMeta}>
            {profile.hasLogistics ? 'Delivery' : 'Pickup only'} · {formatLeadTime(profile.minLeadTimeDays)}
          </Text>
          <Text style={styles.termsBody}>{profile.orderingConditions}</Text>
          {profile.servesMarkets.length > 0 ? (
            <Text style={styles.termsCoverage}>Serves: {profile.servesMarkets.join(', ')}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.metrics}>
        <MetricCard label="Pending orders" value={String(pendingCount)} accent />
        <MetricCard label="Today's payout" value={formatNgn(todayPayoutNgn)} />
      </View>
      <MetricCard label="Wallet balance" value={formatNgn(walletBalanceNgn)} />

      <PrimaryButton
        label="Open fulfillment queue"
        onPress={() => navigation.navigate('FulfillmentQueue', undefined)}
        style={styles.cta}
      />

      <Text style={styles.platformMeta}>
        Platform {platformConnected ? 'connected' : 'offline'} · {inventory.length} SKU
        {inventory.length === 1 ? '' : 's'} listed for routing
      </Text>

      {urgent.length === 0 && pendingCount === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyMeta}>
            Merchant orders matching your coverage will appear here once platform-sync is running.
            List SKUs in inventory so smart routing knows what you hold.
          </Text>
        </View>
      ) : null}

      {urgent.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Needs allocation</Text>
          {urgent.map((order) => (
            <Pressable
              key={order.id}
              style={styles.card}
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
              accessibilityRole="button"
            >
              <View style={styles.cardTop}>
                <Text style={styles.ref}>{order.orderRef}</Text>
                <StatusPill status={order.status} />
              </View>
              <Text style={styles.shop}>{order.merchantShop}</Text>
              <Text style={styles.cardMeta}>
                {order.merchantMarket} · {formatNgn(order.totalNgn)} · {formatTime(order.paidAt)}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.navRow}>
        <Pressable style={styles.navCard} onPress={() => navigation.navigate('Inventory')} accessibilityRole="button">
          <Text style={styles.navTitle}>Inventory ledger</Text>
          <Text style={styles.navMeta}>VWL stock & reservations</Text>
        </Pressable>
        <Pressable style={styles.navCard} onPress={() => navigation.navigate('Payouts')} accessibilityRole="button">
          <Text style={styles.navTitle}>Payouts</Text>
          <Text style={styles.navMeta}>95% settlement history</Text>
        </Pressable>
      </View>

      <PrimaryButton
        label="Profile"
        variant="secondary"
        onPress={() => navigation.navigate('Profile')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl },
  greeting: { ...typography.title, color: colors.ink },
  meta: { ...typography.body, color: colors.muted },
  termsCard: {
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  termsKicker: { ...typography.label, color: colors.primary },
  termsMeta: { ...typography.caption, color: colors.muted },
  termsBody: { ...typography.body, color: colors.ink },
  termsCoverage: { ...typography.caption, color: colors.muted },
  platformMeta: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  emptyCard: {
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  emptyTitle: { ...typography.label, color: colors.ink },
  emptyMeta: { ...typography.body, color: colors.muted },
  metrics: { flexDirection: 'row', gap: spacing.md },
  cta: { marginTop: spacing.sm },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.label, color: colors.ink },
  card: {
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ref: { ...typography.label, color: colors.ink },
  shop: { ...typography.body, color: colors.ink },
  cardMeta: { ...typography.caption, color: colors.muted },
  navRow: { flexDirection: 'row', gap: spacing.md },
  navCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.xs,
  },
  navTitle: { ...typography.label, color: colors.primary },
  navMeta: { ...typography.caption, color: colors.muted },
});
