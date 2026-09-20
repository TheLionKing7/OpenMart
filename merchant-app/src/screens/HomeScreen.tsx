import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { SyncBar } from '../components/SyncBar';
import { useCart } from '../context/CartContext';
import { useMerchant } from '../context/MerchantContext';
import { usePlatform } from '../context/PlatformContext';
import { MainStackParamList } from '../navigation/types';
import { formatNgn } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { profile, orders, activeOrderId, getOrder, shopStock, lowStockItems } = useMerchant();
  const { setDistributor } = useCart();
  const { connected, refreshForMarket, getRestockSuggestion, activeCampaigns } = usePlatform();
  const activeOrder = activeOrderId ? getOrder(activeOrderId) : undefined;
  const lastSettled = orders.find((o) => o.settlementStep === 'settled');

  useFocusEffect(
    useCallback(() => {
      if (profile?.marketArea) refreshForMarket(profile.marketArea);
    }, [profile?.marketArea, refreshForMarket]),
  );

  const restockSuggestion = useMemo(() => {
    if (!connected || !profile?.marketArea || !profile.preferredDistributorId || lowStockItems.length === 0) {
      return null;
    }
    return getRestockSuggestion(
      profile.marketArea,
      profile.preferredDistributorId,
      lowStockItems.map((item) => ({ sku: item.sku, quantity: 1 })),
    );
  }, [connected, profile, lowStockItems, getRestockSuggestion]);

  const restockPreferred = () => {
    if (profile?.preferredDistributorId && profile.preferredDistributorName) {
      setDistributor(profile.preferredDistributorId, profile.preferredDistributorName);
      navigation.navigate('Catalog', {
        distributorId: profile.preferredDistributorId,
        distributorName: profile.preferredDistributorName,
      });
    } else {
      navigation.navigate('DistributorSelect');
    }
  };

  const restockSuggested = () => {
    if (!restockSuggestion) return;
    const { distributorId, distributorName } = restockSuggestion.distributor;
    setDistributor(distributorId, distributorName);
    navigation.navigate('Catalog', { distributorId, distributorName });
  };

  return (
    <View style={styles.container}>
      <SyncBar />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Hello, {profile?.shopName ?? 'Merchant'}</Text>
        <Text style={styles.meta}>
          {profile?.marketArea} · {profile?.lga}
        </Text>
        {profile?.preferredDistributorName ? (
          <Text style={styles.supplier}>Supplier: {profile.preferredDistributorName}</Text>
        ) : null}

        {activeCampaigns.length > 0 ? (
          <View style={styles.campaignBanner}>
            <Text style={styles.campaignKicker}>SmartSubsidy</Text>
            <Text style={styles.campaignTitle}>{activeCampaigns[0].title}</Text>
            <Text style={styles.campaignMeta}>
              {activeCampaigns[0].manufacturerName} · save {formatNgn(activeCampaigns[0].discountNgn)} per unit
            </Text>
          </View>
        ) : null}

        {lowStockItems.length > 0 ? (
          <Pressable style={styles.lowStockBanner} onPress={restockPreferred} accessibilityRole="button">
            <Text style={styles.lowStockText}>
              {lowStockItems.length} item{lowStockItems.length === 1 ? '' : 's'} low — tap to reorder
            </Text>
          </Pressable>
        ) : null}

        {restockSuggestion ? (
          <View style={styles.suggestCard}>
            <Text style={styles.suggestKicker}>Suggested supplier</Text>
            <Text style={styles.suggestTitle}>{restockSuggestion.distributor.distributorName}</Text>
            <Text style={styles.suggestMeta}>
              {restockSuggestion.reason === 'preferred_out_of_stock'
                ? `${profile?.preferredDistributorName ?? 'Your supplier'} is out of stock for ${restockSuggestion.missingFromPreferred.join(', ')}.`
                : 'Your usual supplier is not on the platform ledger yet.'}{' '}
              This wholesaler has stock for your low items.
            </Text>
            <Text style={styles.suggestDetail}>
              {restockSuggestion.distributor.catalog.length} SKUs listed ·{' '}
              {restockSuggestion.distributor.hasLogistics ? 'Delivery' : 'Pickup'} ·{' '}
              {restockSuggestion.distributor.minLeadTimeDays === 0
                ? 'Same day'
                : `${restockSuggestion.distributor.minLeadTimeDays} day lead time`}
            </Text>
            <PrimaryButton label="Restock from suggested supplier" onPress={restockSuggested} />
            <Pressable onPress={restockPreferred} accessibilityRole="button" style={styles.suggestLink}>
              <Text style={styles.suggestLinkText}>Stick with {profile?.preferredDistributorName}</Text>
            </Pressable>
          </View>
        ) : null}

        <PrimaryButton label="Restock now" onPress={restockPreferred} style={styles.cta} />

        {shopStock.length > 0 ? (
          <PrimaryButton
            label="Record sales"
            variant="secondary"
            onPress={() => navigation.navigate('RecordSales')}
          />
        ) : null}

        {activeOrder ? (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('Settlement', { orderId: activeOrder.id })}
            accessibilityRole="button"
          >
            <Text style={styles.cardKicker}>Active order</Text>
            <Text style={styles.cardTitle}>{activeOrder.orderRef}</Text>
            <Text style={styles.cardMeta}>
              {activeOrder.distributorName} · {formatNgn(activeOrder.totalNgn)} · In progress
            </Text>
            <Text style={styles.cardLink}>Track settlement →</Text>
          </Pressable>
        ) : null}

        {lastSettled ? (
          <View style={styles.cardMuted}>
            <Text style={styles.cardKicker}>Last settled</Text>
            <Text style={styles.cardTitle}>{lastSettled.orderRef}</Text>
            <Text style={styles.cardMeta}>
              {lastSettled.distributorName} · {formatNgn(lastSettled.totalNgn)} · Delivered
            </Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.cardMuted}>
            <Text style={styles.cardTitle}>No orders yet</Text>
            <Text style={styles.cardMeta}>Your first restock takes under 2 minutes.</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => navigation.navigate('OrderHistory')}
          style={styles.linkRow}
          accessibilityRole="button"
        >
          <Text style={styles.linkText}>Order history</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Profile')}
          style={styles.linkRow}
          accessibilityRole="button"
        >
          <Text style={styles.linkText}>Shop profile</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  greeting: { ...typography.title, color: colors.ink },
  meta: { ...typography.body, color: colors.muted },
  supplier: { ...typography.label, color: colors.primary },
  campaignBanner: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    gap: 4,
  },
  campaignKicker: { ...typography.caption, color: colors.accent, fontWeight: '700' },
  campaignTitle: { ...typography.label, color: colors.ink },
  campaignMeta: { ...typography.caption, color: colors.muted },
  cta: { marginTop: spacing.sm },
  lowStockBanner: {
    padding: spacing.md,
    backgroundColor: colors.warningBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  lowStockText: { ...typography.label, color: colors.warning, textAlign: 'center' },
  suggestCard: {
    padding: spacing.lg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  suggestKicker: { ...typography.caption, color: colors.accent, fontWeight: '700' },
  suggestTitle: { ...typography.label, fontSize: 16, color: colors.ink },
  suggestMeta: { ...typography.body, color: colors.muted },
  suggestDetail: { ...typography.caption, color: colors.primary },
  suggestLink: { alignSelf: 'center', paddingVertical: spacing.sm },
  suggestLinkText: { ...typography.caption, color: colors.muted, textDecorationLine: 'underline' },
  card: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.xs,
  },
  cardMuted: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  cardKicker: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  cardTitle: { ...typography.label, fontSize: 16, color: colors.ink },
  cardMeta: { ...typography.caption, color: colors.muted },
  cardLink: { ...typography.caption, color: colors.primary, fontWeight: '700', marginTop: spacing.xs },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 48,
  },
  linkText: { ...typography.body, color: colors.ink },
  chevron: { fontSize: 22, color: colors.muted },
});
