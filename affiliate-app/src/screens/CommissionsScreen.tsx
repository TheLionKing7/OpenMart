import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { MERCHANT_ACTIVATION_BOUNTY_NGN, useAffiliate } from '../context/AffiliateContext';
import { MainStackParamList } from '../navigation/types';
import { formatDate, formatNgn } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'Commissions'>;

export function CommissionsScreen({}: Props) {
  const { dashboard } = useAffiliate();
  const commissions = dashboard?.commissions ?? [];

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={commissions}
      keyExtractor={(c) => c.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.hint}>
            Merchant activation bounty: {formatNgn(MERCHANT_ACTIVATION_BOUNTY_NGN)} — funded by
            OpenMarket platform fee pool.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View>
            <Text style={styles.shop}>{item.merchantShop}</Text>
            <Text style={styles.meta}>{formatDate(item.createdAt)} · Merchant activation</Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.amount}>{formatNgn(item.amountNgn)}</Text>
            <Text style={[styles.status, item.status === 'credited' && styles.statusCredited]}>
              {item.status === 'credited' ? 'Credited' : 'Pending'}
            </Text>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>No commissions yet. Activations appear after a referred merchant settles their first order.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.sm },
  header: { marginBottom: spacing.sm },
  hint: { ...typography.caption, color: colors.muted },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  shop: { ...typography.label, color: colors.ink },
  meta: { ...typography.caption, color: colors.muted },
  right: { alignItems: 'flex-end', gap: spacing.xs },
  amount: { ...typography.label, color: colors.ink },
  status: { ...typography.caption, color: colors.pending, fontWeight: '700' },
  statusCredited: { color: colors.success },
  empty: { ...typography.body, color: colors.muted, textAlign: 'center', padding: spacing.xl },
});
