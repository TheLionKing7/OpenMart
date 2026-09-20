import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

type Props = {
  step: number;
  total: number;
};

export function OnboardingProgress({ step, total }: Props) {
  return (
    <View style={styles.row} accessibilityLabel={`Step ${step} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.dot, i < step ? styles.dotActive : styles.dotInactive]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  dot: { flex: 1, height: 4, borderRadius: 2 },
  dotActive: { backgroundColor: colors.primary },
  dotInactive: { backgroundColor: colors.border },
});
