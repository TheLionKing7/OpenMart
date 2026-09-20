import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusPill } from '../components/StatusPill';
import { useDistributor } from '../context/DistributorContext';
import { MainStackParamList } from '../navigation/types';
import { IncomingOrder } from '../types/fulfillment';
import { formatNgn, formatTime } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'FulfillmentQueue'>;
type Tab = 'allocate' | 'pack' | 'delivery' | 'done';

const TABS: { id: Tab; label: string }[] = [
  { id: 'allocate', label: 'Allocate' },
  { id: 'pack', label: 'Pack' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'done', label: 'Done' },
];

export function FulfillmentQueueScreen({ navigation, route }: Props) {
  const { ordersForTab } = useDistributor();
  const [tab, setTab] = useState<Tab>(route.params?.tab ?? 'allocate');
  const list = ordersForTab(tab);

  const renderItem = ({ item }: { item: IncomingOrder }) => (
    <Pressable
      style={styles.row}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      accessibilityRole="button"
    >
      <View style={styles.rowTop}>
        <Text style={styles.ref}>{item.orderRef}</Text>
        <StatusPill status={item.status} />
      </View>
      <Text style={styles.shop}>{item.merchantShop}</Text>
      <Text style={styles.meta}>
        {item.merchantMarket} · {formatNgn(item.totalNgn)} · {formatTime(item.paidAt)}
      </Text>
      <Text style={styles.lines}>
        {item.lines.map((l) => `${l.quantity}× ${l.name}`).join(' · ')}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {TABS.map((t) => {
          const active = tab === t.id;
          const count = ordersForTab(t.id).length;
          return (
            <Pressable
              key={t.id}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setTab(t.id)}
              accessibilityRole="button"
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t.label} ({count})
              </Text>
            </Pressable>
          );
        })}
      </View>
      <FlatList
        data={list}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No orders in this stage.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { ...typography.caption, color: colors.muted, fontWeight: '600' },
  tabTextActive: { color: colors.primary },
  list: { padding: spacing.lg, gap: spacing.sm },
  row: {
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ref: { ...typography.label, color: colors.ink },
  shop: { ...typography.body, color: colors.ink },
  meta: { ...typography.caption, color: colors.muted },
  lines: { ...typography.caption, color: colors.primary },
  empty: { ...typography.body, color: colors.muted, textAlign: 'center', padding: spacing.xl },
});
