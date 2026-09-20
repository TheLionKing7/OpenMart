import { StyleSheet, Text, View } from 'react-native';
import { FulfillmentStatus, statusLabel } from '../types/fulfillment';
import { colors, spacing, typography } from '../theme/tokens';

type Props = { status: FulfillmentStatus };

export function StatusPill({ status }: Props) {
  const style =
    status === 'completed'
      ? { bg: colors.successBg, text: colors.success }
      : status === 'payment_verified'
        ? { bg: colors.pendingBg, text: colors.pending }
        : status === 'out_for_delivery'
          ? { bg: colors.warningBg, text: colors.warning }
          : { bg: colors.surface, text: colors.primary };

  return (
    <View style={[styles.pill, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>{statusLabel(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 6 },
  text: { ...typography.caption, fontWeight: '700' },
});
