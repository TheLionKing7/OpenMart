import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useDistributor } from '../context/DistributorContext';
import { MainStackParamList } from '../navigation/types';
import { formatNgn, formatTime } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'Payouts'>;

export function PayoutsScreen({}: Props) {
  const { payouts, walletBalanceNgn } = useDistributor();

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={payouts}
      keyExtractor={(p) => p.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.balanceLabel}>Total credited</Text>
          <Text style={styles.balance}>{formatNgn(walletBalanceNgn)}</Text>
          <Text style={styles.hint}>95% distributor share credited on stock allocation.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.ref}>{item.orderRef}</Text>
            <Text style={styles.time}>{formatTime(item.paidAt)}</Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.amount}>{formatNgn(item.amountNgn)}</Text>
            <Text style={styles.status}>{item.status === 'credited' ? 'Credited' : 'Pending'}</Text>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No payouts yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.sm },
  header: { gap: spacing.xs, marginBottom: spacing.md },
  balanceLabel: { ...typography.caption, color: colors.muted },
  balance: { ...typography.metric, color: colors.success },
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
  info: { gap: spacing.xs },
  ref: { ...typography.label, color: colors.ink },
  time: { ...typography.caption, color: colors.muted },
  right: { alignItems: 'flex-end', gap: spacing.xs },
  amount: { ...typography.label, color: colors.ink },
  status: { ...typography.caption, color: colors.success, fontWeight: '700' },
  empty: { ...typography.body, color: colors.muted, textAlign: 'center', padding: spacing.xl },
});
