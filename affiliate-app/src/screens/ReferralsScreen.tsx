import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useAffiliate } from '../context/AffiliateContext';
import { MainStackParamList } from '../navigation/types';
import { formatDate } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'Referrals'>;

export function ReferralsScreen({}: Props) {
  const { dashboard } = useAffiliate();
  const referrals = dashboard?.referrals ?? [];

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={referrals}
      keyExtractor={(r) => r.id}
      ListHeaderComponent={
        <Text style={styles.hint}>
          Signed up = merchant onboarded with your code. Activated = first settled order complete.
        </Text>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.shop}>{item.merchantShop}</Text>
            <Text style={styles.meta}>{item.merchantMarket} · {formatDate(item.referredAt)}</Text>
            {item.firstOrderRef ? (
              <Text style={styles.order}>Order {item.firstOrderRef}</Text>
            ) : null}
          </View>
          <Text style={[styles.status, item.status === 'activated' && styles.statusActive]}>
            {item.status === 'activated' ? 'Activated' : 'Signed up'}
          </Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No referrals yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.sm },
  hint: { ...typography.caption, color: colors.muted, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  info: { flex: 1, gap: spacing.xs },
  shop: { ...typography.label, color: colors.ink },
  meta: { ...typography.caption, color: colors.muted },
  order: { ...typography.caption, color: colors.primary },
  status: { ...typography.caption, color: colors.pending, fontWeight: '700' },
  statusActive: { color: colors.success },
  empty: { ...typography.body, color: colors.muted, textAlign: 'center', padding: spacing.xl },
});
