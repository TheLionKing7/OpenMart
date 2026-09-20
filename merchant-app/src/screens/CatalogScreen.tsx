import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { DistributorTermsCard } from '../components/DistributorTermsCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { SkuListRow } from '../components/SkuListRow';
import { SyncBar } from '../components/SyncBar';
import { useCart } from '../context/CartContext';
import { usePlatform } from '../context/PlatformContext';
import { useMerchant } from '../context/MerchantContext';
import { useSync } from '../context/SyncContext';
import { productsForDistributor } from '../data/products';
import { MainStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'Catalog'>;

export function CatalogScreen({ navigation, route }: Props) {
  const { distributorId, lines, addOrUpdate, itemCount } = useCart();
  const { toggleOfflineDemo } = useSync();
  const { profile } = useMerchant();
  const { connected, getCatalog, getDistributorProfile, refreshForMarket } = usePlatform();
  const [query, setQuery] = useState('');
  const activeDistributor = distributorId ?? route.params.distributorId;

  useEffect(() => {
    if (profile?.marketArea) refreshForMarket(profile.marketArea);
  }, [profile?.marketArea, refreshForMarket]);

  const platformDistributor = getDistributorProfile(activeDistributor);

  const catalogProducts = useMemo(() => {
    const platformCatalog = getCatalog(activeDistributor);
    const source =
      connected && platformCatalog.length > 0
        ? platformCatalog
        : productsForDistributor(activeDistributor);
    if (!query.trim()) return source;
    const q = query.toLowerCase();
    return source.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [activeDistributor, connected, getCatalog, query]);

  const qtyFor = (id: string) => lines.find((l) => l.product.id === id)?.quantity ?? 0;

  return (
    <View style={styles.container}>
      <SyncBar />
      <View style={styles.toolbar}>
        <Text style={styles.distributorLabel}>{route.params.distributorName}</Text>
        {platformDistributor ? <DistributorTermsCard distributor={platformDistributor} compact /> : null}
        {!connected ? (
          <Text style={styles.offlineHint}>
            Platform offline — showing demo catalog. Start platform-sync for live VWL stock.
          </Text>
        ) : connected && platformDistributor && platformDistributor.catalog.length === 0 ? (
          <Text style={styles.offlineHint}>
            This distributor has not listed products yet. Ask them to add SKUs to their ledger.
          </Text>
        ) : null}
        <TextInput
          style={styles.search}
          placeholder="Search SKU or product"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Search products"
          autoCorrect={false}
        />
        <Pressable onPress={toggleOfflineDemo} style={styles.demoToggle} accessibilityRole="button">
          <Text style={styles.demoToggleText}>Toggle offline demo</Text>
        </Pressable>
      </View>

      {catalogProducts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptyBody}>
            {connected
              ? 'Distributor catalog is empty or unavailable for this market.'
              : 'Try a different search, change distributor, or start platform-sync.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={catalogProducts}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <SkuListRow
              product={item}
              quantity={qtyFor(item.id)}
              onQuantityChange={(qty) => addOrUpdate(item, qty)}
            />
          )}
        />
      )}

      <View style={styles.footer}>
        <PrimaryButton
          label={itemCount > 0 ? `Review cart (${itemCount} items)` : 'Add items to continue'}
          onPress={() => navigation.navigate('Cart')}
          disabled={itemCount === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  toolbar: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  distributorLabel: { ...typography.label, color: colors.primary },
  offlineHint: { ...typography.caption, color: colors.muted },
  search: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
    color: colors.ink,
    backgroundColor: colors.bg,
  },
  demoToggle: { alignSelf: 'flex-start', paddingVertical: spacing.xs },
  demoToggleText: { ...typography.caption, color: colors.accent },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: { ...typography.label, color: colors.ink, fontSize: 18 },
  emptyBody: { ...typography.body, color: colors.muted, textAlign: 'center' },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
