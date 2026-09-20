import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

type Props = { label: string; value: string; accent?: boolean };

export function MetricCard({ label, value, accent }: Props) {
  return (
    <View style={[styles.card, accent && styles.cardAccent]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent && styles.valueAccent]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    minWidth: 100,
  },
  cardAccent: { borderColor: colors.primary },
  label: { ...typography.caption, color: colors.muted },
  value: { ...typography.metric, fontSize: 20, color: colors.ink },
  valueAccent: { color: colors.primary },
});
