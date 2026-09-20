import { StyleSheet, Text, View } from 'react-native';
import { PlatformDistributor } from '../../../shared/types';
import { colors, spacing, typography } from '../theme/tokens';

type Props = {
  distributor: Pick<
    PlatformDistributor,
    'hasLogistics' | 'minLeadTimeDays' | 'orderingConditions' | 'distributorName'
  >;
  compact?: boolean;
};

function leadTimeLabel(days: number): string {
  if (days === 0) return 'Same day';
  if (days === 1) return '1 day ahead';
  return `${days} days ahead`;
}

export function DistributorTermsCard({ distributor, compact }: Props) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <Text style={styles.kicker}>{distributor.distributorName} · ordering terms</Text>
      <Text style={styles.meta}>
        {distributor.hasLogistics ? 'Delivery available' : 'Pickup only'} ·{' '}
        {leadTimeLabel(distributor.minLeadTimeDays)}
      </Text>
      <Text style={styles.body}>{distributor.orderingConditions}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  cardCompact: { padding: spacing.md },
  kicker: { ...typography.label, color: colors.primary, fontSize: 13 },
  meta: { ...typography.caption, color: colors.muted },
  body: { ...typography.body, color: colors.ink },
});
