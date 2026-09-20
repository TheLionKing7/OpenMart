import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SyncBar } from '../components/SyncBar';
import { useMerchant } from '../context/MerchantContext';
import { MainStackParamList } from '../navigation/types';
import { formatNgn } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'OrderHistory'>;

function statusLabel(step: string): string {
  if (step === 'settled') return 'Settled';
  if (step === 'payment_verified') return 'Payment verified';
  return 'In progress';
}

export function OrderHistoryScreen({ navigation }: Props) {
  const { orders } = useMerchant();

  return (
    <View style={styles.container}>
      <SyncBar />
      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyBody}>Completed and active orders appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate('Settlement', { orderId: item.id })}
              accessibilityRole="button"
            >
              <View style={styles.rowMain}>
                <Text style={styles.ref}>{item.orderRef}</Text>
                <Text style={styles.meta}>
                  {item.distributorName} · {formatNgn(item.totalNgn)}
                </Text>
              </View>
              <Text
                style={[
                  styles.status,
                  item.settlementStep === 'settled' ? styles.statusDone : styles.statusActive,
                ]}
              >
                {statusLabel(item.settlementStep)}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { paddingBottom: spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 64,
  },
  rowMain: { flex: 1, gap: 2 },
  ref: { ...typography.label, color: colors.ink },
  meta: { ...typography.caption, color: colors.muted },
  status: { ...typography.caption, fontWeight: '700' },
  statusDone: { color: colors.success },
  statusActive: { color: colors.pending },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyTitle: { ...typography.title, color: colors.ink },
  emptyBody: { ...typography.body, color: colors.muted },
});
