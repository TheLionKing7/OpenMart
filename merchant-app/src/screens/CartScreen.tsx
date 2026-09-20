import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { QuantityStepper } from '../components/QuantityStepper';
import { SyncBar } from '../components/SyncBar';
import { DistributorTermsCard } from '../components/DistributorTermsCard';
import { useCart } from '../context/CartContext';
import { usePlatform } from '../context/PlatformContext';
import { useSync } from '../context/SyncContext';
import { MainStackParamList } from '../navigation/types';
import { formatNgn } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'Cart'>;

export function CartScreen({ navigation }: Props) {
  const { lines, distributorId, distributorName, updateQuantity, subtotalNgn, subsidyTotalNgn, totalNgn } = useCart();
  const { queuePending } = useSync();
  const { getDistributorProfile } = usePlatform();
  const distributor = distributorId ? getDistributorProfile(distributorId) : undefined;

  if (lines.length === 0) {
    return (
      <View style={styles.container}>
        <SyncBar />
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Cart is empty</Text>
          <Text style={styles.emptyBody}>Add wholesale items from the catalog to continue.</Text>
          <PrimaryButton label="Browse catalog" onPress={() => navigation.goBack()} variant="secondary" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SyncBar />
      {distributor ? (
        <View style={styles.termsWrap}>
          <DistributorTermsCard distributor={distributor} compact />
        </View>
      ) : null}
      <FlatList
        data={lines}
        keyExtractor={(l) => l.product.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.line}>
            <View style={styles.lineMain}>
              <Text style={styles.lineName}>{item.product.name}</Text>
              <Text style={styles.lineMeta}>
                {item.quantity} × {formatNgn(item.product.priceNgn)}
              </Text>
              {item.product.manufacturerSubsidyNgn ? (
                <Text style={styles.subsidy}>
                  −{formatNgn(item.product.manufacturerSubsidyNgn * item.quantity)} manufacturer subsidy
                </Text>
              ) : null}
            </View>
            <QuantityStepper
              value={item.quantity}
              onChange={(q) => updateQuantity(item.product.id, q)}
              max={item.product.stock}
            />
          </View>
        )}
        ListFooterComponent={
          <View style={styles.totals}>
            <Row label="Subtotal" value={formatNgn(subtotalNgn)} />
            {subsidyTotalNgn > 0 ? (
              <Row label="Manufacturer subsidies" value={`−${formatNgn(subsidyTotalNgn)}`} accent />
            ) : null}
            <Row label="Total due" value={formatNgn(totalNgn)} bold />
          </View>
        }
      />
      <View style={styles.footer}>
        <PrimaryButton
          label={`Proceed to pay ${formatNgn(totalNgn)}`}
          onPress={() => {
            queuePending();
            navigation.navigate('Checkout', {
              totalNgn,
              distributorId: distributorId ?? '',
              distributorName: distributorName ?? 'Distributor',
            });
          }}
        />
      </View>
    </View>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, bold && styles.totalBold]}>{label}</Text>
      <Text style={[styles.totalValue, bold && styles.totalBold, accent && styles.totalAccent]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  termsWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  list: {
    paddingBottom: spacing.lg,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  lineMain: {
    flex: 1,
    gap: spacing.xs,
  },
  lineName: {
    ...typography.label,
    fontSize: 16,
    color: colors.ink,
  },
  lineMeta: {
    ...typography.caption,
    color: colors.muted,
  },
  subsidy: {
    ...typography.caption,
    color: colors.subsidy,
    fontWeight: '600',
  },
  totals: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    ...typography.body,
    color: colors.muted,
  },
  totalValue: {
    ...typography.body,
    color: colors.ink,
  },
  totalBold: {
    fontWeight: '700',
    color: colors.ink,
    fontSize: 18,
  },
  totalAccent: {
    color: colors.subsidy,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.title,
    color: colors.ink,
  },
  emptyBody: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
});
