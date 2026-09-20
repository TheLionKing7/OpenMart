import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SyncBar } from '../components/SyncBar';
import { useCart } from '../context/CartContext';
import { useMerchant } from '../context/MerchantContext';
import { usePlatform } from '../context/PlatformContext';
import { distributors, distributorsForMarket } from '../data/distributors';
import { MainStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'DistributorSelect'>;

function leadTimeLabel(days: number): string {
  if (days === 0) return 'Same day';
  if (days === 1) return '1 day ahead';
  return `${days} days ahead`;
}

export function DistributorSelectScreen({ navigation }: Props) {
  const { profile, setPreferredDistributor } = useMerchant();
  const { setDistributor } = useCart();
  const { connected, rankedDistributors, refreshForMarket } = usePlatform();

  useEffect(() => {
    if (profile?.marketArea) refreshForMarket(profile.marketArea);
  }, [profile?.marketArea, refreshForMarket]);

  const list = useMemo(() => {
    if (connected && rankedDistributors.length > 0) {
      return rankedDistributors.map((d, index) => ({
        id: d.distributorId,
        name: d.distributorName,
        stallLabel: d.stallLabel,
        lga: d.lga,
        catalogCount: d.catalog.length,
        hasLogistics: d.hasLogistics,
        minLeadTimeDays: d.minLeadTimeDays,
        isBestMatch: index === 0,
        isPlatform: true,
      }));
    }
    const fallback = profile?.marketArea
      ? distributorsForMarket(profile.marketArea)
      : distributors;
    return (fallback.length > 0 ? fallback : distributors).map((d) => ({
      ...d,
      catalogCount: 0,
      hasLogistics: false,
      minLeadTimeDays: 1,
      isBestMatch: false,
      isPlatform: false,
    }));
  }, [connected, rankedDistributors, profile?.marketArea]);

  const pick = (id: string, name: string) => {
    setDistributor(id, name);
    setPreferredDistributor(id, name);
    navigation.navigate('Catalog', { distributorId: id, distributorName: name });
  };

  return (
    <View style={styles.container}>
      <SyncBar />
      <View style={styles.header}>
        <Text style={styles.title}>Choose your distributor</Text>
        <Text style={styles.subtitle}>
          {connected
            ? `Ranked by stock and lead time for ${profile?.marketArea ?? 'your market'}.`
            : profile?.marketArea
              ? `Wholesalers serving ${profile.marketArea}. Start platform-sync for live routing.`
              : 'Select the wholesaler who fulfills your orders.'}
        </Text>
      </View>
      <FlatList
        data={list}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isPreferred = profile?.preferredDistributorId === item.id;
          return (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => pick(item.id, item.name)}
              accessibilityRole="button"
            >
              <View style={styles.rowMain}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.stall}>
                  {item.stallLabel} · {item.lga}
                </Text>
                {item.isPlatform ? (
                  <Text style={styles.meta}>
                    {item.catalogCount} SKUs · {item.hasLogistics ? 'Delivery' : 'Pickup'} ·{' '}
                    {leadTimeLabel(item.minLeadTimeDays)}
                  </Text>
                ) : null}
                {isPreferred ? <Text style={styles.badge}>Your usual supplier</Text> : null}
                {item.isBestMatch ? <Text style={styles.match}>Best match</Text> : null}
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg, gap: spacing.xs },
  title: { ...typography.title, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted, lineHeight: 22 },
  list: { paddingBottom: spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 72,
  },
  rowPressed: { backgroundColor: colors.surface },
  rowMain: { flex: 1, gap: spacing.xs },
  name: { ...typography.label, fontSize: 16, color: colors.ink },
  stall: { ...typography.caption, color: colors.muted },
  meta: { ...typography.caption, color: colors.primary },
  badge: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  match: { ...typography.caption, color: colors.success, fontWeight: '700' },
  chevron: { fontSize: 24, color: colors.muted },
});
