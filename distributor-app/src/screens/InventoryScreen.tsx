import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { useDistributor } from '../context/DistributorContext';
import { MainStackParamList } from '../navigation/types';
import { formatNgn } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'Inventory'>;

export function InventoryScreen({ navigation }: Props) {
  const { inventory, adjustStock, platformConnected } = useDistributor();

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={inventory}
      keyExtractor={(item) => item.sku}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.hint}>
            Virtual Warehouse Ledger — on-hand and reserved quantities. Tap ± to adjust stock.
          </Text>
          {inventory.length === 0 ? (
            <Text style={styles.empty}>
              No SKUs yet — add products so merchants can browse your catalog and the platform can
              route orders intelligently.
            </Text>
          ) : null}
          <PrimaryButton label="Add product" onPress={() => navigation.navigate('AddProduct')} />
          <Text style={styles.syncHint}>
            {platformConnected
              ? 'Catalog synced to platform — used for merchant routing.'
              : 'Start platform-sync (port 3099) to publish catalog to merchants.'}
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const available = item.quantityOnHand;
        const low = available < 20;
        return (
          <View style={[styles.row, low && styles.rowLow]}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sku}>
                {item.sku} · {item.unit} · {formatNgn(item.priceNgn)}
              </Text>
            </View>
            <View style={styles.qtyBlock}>
              <Text style={styles.qtyLabel}>On hand</Text>
              <View style={styles.qtyRow}>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => adjustStock(item.sku, -1)}
                  accessibilityRole="button"
                  accessibilityLabel={`Decrease ${item.name}`}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </Pressable>
                <Text style={[styles.qty, low && styles.qtyLow]}>{available}</Text>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => adjustStock(item.sku, 1)}
                  accessibilityRole="button"
                  accessibilityLabel={`Increase ${item.name}`}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </Pressable>
              </View>
              {item.reserved > 0 ? (
                <Text style={styles.reserved}>{item.reserved} reserved</Text>
              ) : null}
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.sm },
  header: { gap: spacing.sm, marginBottom: spacing.sm },
  hint: { ...typography.caption, color: colors.muted },
  empty: { ...typography.body, color: colors.muted },
  syncHint: { ...typography.caption, color: colors.muted },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowLow: { borderColor: colors.warning, backgroundColor: colors.warningBg },
  info: { flex: 1, gap: spacing.xs },
  name: { ...typography.label, color: colors.ink },
  sku: { ...typography.caption, color: colors.muted },
  qtyBlock: { alignItems: 'flex-end', gap: spacing.xs },
  qtyLabel: { ...typography.caption, color: colors.muted },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  qtyBtnText: { ...typography.label, color: colors.primary, fontSize: 18 },
  qty: { ...typography.metric, fontSize: 22, minWidth: 40, textAlign: 'center' },
  qtyLow: { color: colors.warning },
  reserved: { ...typography.caption, color: colors.primary },
});
