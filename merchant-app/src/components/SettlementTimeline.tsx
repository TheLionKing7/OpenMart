import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SETTLEMENT_STEPS, SettlementStepId, stepIndex } from '../types/order';
import { colors, spacing, typography } from '../theme/tokens';

type Props = {
  currentStep: SettlementStepId;
  onAdvanceDemo?: () => void;
  showDemoControl?: boolean;
};

export function SettlementTimeline({ currentStep, onAdvanceDemo, showDemoControl }: Props) {
  const currentIdx = stepIndex(currentStep);

  return (
    <View style={styles.wrap}>
      {SETTLEMENT_STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const pending = idx > currentIdx;

        return (
          <View key={step.id} style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.marker,
                  done && styles.markerDone,
                  active && styles.markerActive,
                  pending && styles.markerPending,
                ]}
              >
                <Text style={[styles.markerText, (done || active) && styles.markerTextOn]}>
                  {done ? '✓' : idx + 1}
                </Text>
              </View>
              {idx < SETTLEMENT_STEPS.length - 1 ? (
                <View style={[styles.line, done && styles.lineDone]} />
              ) : null}
            </View>
            <View style={styles.content}>
              <Text style={[styles.label, active && styles.labelActive]}>{step.label}</Text>
              <Text style={styles.detail}>{step.detail}</Text>
            </View>
          </View>
        );
      })}
      {showDemoControl && currentStep !== 'settled' && onAdvanceDemo ? (
        <Pressable onPress={onAdvanceDemo} style={styles.demoBtn} accessibilityRole="button">
          <Text style={styles.demoText}>Advance settlement step (demo)</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 72,
  },
  rail: {
    alignItems: 'center',
    width: 32,
  },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  markerDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  markerActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  markerPending: {
    borderColor: colors.border,
  },
  markerText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.muted,
  },
  markerTextOn: {
    color: colors.onPrimary,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    minHeight: 24,
  },
  lineDone: {
    backgroundColor: colors.success,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.muted,
  },
  labelActive: {
    color: colors.ink,
    fontSize: 16,
  },
  detail: {
    ...typography.caption,
    color: colors.muted,
    lineHeight: 18,
  },
  demoBtn: {
    marginTop: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  demoText: {
    ...typography.caption,
    color: colors.accent,
    textDecorationLine: 'underline',
  },
});
