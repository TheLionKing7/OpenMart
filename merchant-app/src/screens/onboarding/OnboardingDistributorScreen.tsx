import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { PrimaryButton } from '../../components/PrimaryButton';
import { usePlatform } from '../../context/PlatformContext';
import { distributorsForMarket } from '../../data/distributors';
import { OnboardingStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingDistributor'>;

function leadTimeLabel(days: number): string {
  if (days === 0) return 'Same day';
  if (days === 1) return '1 day ahead';
  return `${days} days ahead`;
}

export function OnboardingDistributorScreen({ navigation, route }: Props) {
  const { marketArea } = route.params;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const { connected, rankedDistributors, refreshForMarket } = usePlatform();

  useEffect(() => {
    refreshForMarket(marketArea);
  }, [marketArea, refreshForMarket]);

  const list = useMemo(() => {
    if (connected && rankedDistributors.length > 0) {
      return rankedDistributors.map((d) => ({
        id: d.distributorId,
        name: d.distributorName,
        stallLabel: d.stallLabel,
        catalogCount: d.catalog.length,
        hasLogistics: d.hasLogistics,
        minLeadTimeDays: d.minLeadTimeDays,
        orderingConditions: d.orderingConditions,
        isPlatform: true,
      }));
    }
    return distributorsForMarket(marketArea).map((d) => ({
      ...d,
      catalogCount: 0,
      hasLogistics: false,
      minLeadTimeDays: 1,
      orderingConditions: '',
      isPlatform: false,
    }));
  }, [connected, rankedDistributors, marketArea]);

  return (
    <View style={styles.container}>
      <OnboardingProgress step={3} total={5} />
      <View style={styles.header}>
        <Text style={styles.title}>Your usual distributor</Text>
        <Text style={styles.subtitle}>
          {connected
            ? `Wholesalers registered for ${marketArea}, ranked by stock listed and lead time.`
            : `${marketArea} — pick your wholesaler. Start platform-sync to see live registered distributors.`}
        </Text>
      </View>
      <FlatList
        data={list}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const active = selectedId === item.id;
          return (
            <Pressable
              style={[styles.row, active && styles.rowActive]}
              onPress={() => {
                setSelectedId(item.id);
                setSelectedName(item.name);
              }}
              accessibilityRole="button"
            >
              <View style={styles.rowMain}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.stall}>{item.stallLabel}</Text>
                {item.isPlatform ? (
                  <>
                    <Text style={styles.meta}>
                      {item.catalogCount} SKU{item.catalogCount === 1 ? '' : 's'} ·{' '}
                      {item.hasLogistics ? 'Delivery' : 'Pickup'} · {leadTimeLabel(item.minLeadTimeDays)}
                    </Text>
                    {item.orderingConditions ? (
                      <Text style={styles.conditions} numberOfLines={2}>
                        {item.orderingConditions}
                      </Text>
                    ) : null}
                    {index === 0 ? <Text style={styles.badge}>Best match for your market</Text> : null}
                  </>
                ) : (
                  <Text style={styles.meta}>Demo listing — not on platform yet</Text>
                )}
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No distributors onboarded for this market yet. Wholesalers must register and list
            inventory before merchants can order.
          </Text>
        }
      />
      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          disabled={!selectedId || !selectedName}
          onPress={() =>
            navigation.navigate('OnboardingPhone', {
              ...route.params,
              preferredDistributorId: selectedId!,
              preferredDistributorName: selectedName!,
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg, gap: spacing.sm },
  title: { ...typography.title, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted, lineHeight: 22 },
  list: { paddingBottom: spacing.lg },
  row: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  rowActive: { backgroundColor: colors.surface, borderLeftWidth: 3, borderLeftColor: colors.primary },
  rowMain: { gap: spacing.xs },
  name: { ...typography.label, fontSize: 16, color: colors.ink },
  stall: { ...typography.caption, color: colors.muted },
  meta: { ...typography.caption, color: colors.primary },
  conditions: { ...typography.caption, color: colors.muted },
  badge: { ...typography.caption, color: colors.success, fontWeight: '700' },
  empty: { ...typography.body, color: colors.muted, padding: spacing.lg, textAlign: 'center' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
