import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { SyncBar } from '../components/SyncBar';
import { useMerchant } from '../context/MerchantContext';
import { isLowStock } from '../types/stock';
import { MainStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'RecordSales'>;

export function RecordSalesScreen({ navigation }: Props) {
  const { shopStock, recordSale, lowStockItems } = useMerchant();

  if (shopStock.length === 0) {
    return (
      <View style={styles.container}>
        <SyncBar />
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No shop stock yet</Text>
          <Text style={styles.emptyBody}>
            Stock is added automatically when an order is fully settled and delivered.
          </Text>
          <PrimaryButton label="Restock now" onPress={() => navigation.navigate('DistributorSelect')} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SyncBar />
      {lowStockItems.length > 0 ? (
        <View style={styles.alert}>
          <Text style={styles.alertText}>
            {lowStockItems.length} item{lowStockItems.length === 1 ? '' : 's'} running low
          </Text>
          <Pressable onPress={() => navigation.navigate('DistributorSelect')} accessibilityRole="button">
            <Text style={styles.alertLink}>Reorder →</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={shopStock}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const low = isLowStock(item);
          return (
            <View style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.name}>
                  {item.name} ({item.unit})
                </Text>
                <Text style={styles.meta}>SKU: {item.sku}</Text>
                <Text style={[styles.qty, low && styles.qtyLow]}>
                  {item.quantityOnHand} in shop
                  {low ? ' · Low stock' : ''}
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.soldBtn, pressed && styles.soldBtnPressed]}
                onPress={() => recordSale(item.productId, 1)}
                disabled={item.quantityOnHand === 0}
                accessibilityRole="button"
                accessibilityLabel={`Record 1 sold for ${item.name}`}
              >
                <Text style={styles.soldBtnText}>Sold 1</Text>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  alert: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.warningBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  alertText: { ...typography.label, color: colors.warning },
  alertLink: { ...typography.label, color: colors.primary },
  list: { paddingBottom: spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  rowMain: { flex: 1, gap: spacing.xs },
  name: { ...typography.label, fontSize: 16, color: colors.ink },
  meta: { ...typography.caption, color: colors.muted },
  qty: { ...typography.label, color: colors.ink },
  qtyLow: { color: colors.warning },
  soldBtn: {
    minWidth: 72,
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  soldBtnPressed: { backgroundColor: colors.primaryPressed },
  soldBtnText: { ...typography.label, color: colors.onPrimary },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: { ...typography.title, color: colors.ink },
  emptyBody: { ...typography.body, color: colors.muted, textAlign: 'center' },
});
