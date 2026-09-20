import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, touch, typography } from '../theme/tokens';

type Props = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
};

export function QuantityStepper({ value, onChange, min = 0, max = 999 }: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <View style={styles.row}>
      <Pressable
        onPress={dec}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        hitSlop={8}
      >
        <Text style={styles.btnText}>−</Text>
      </Pressable>
      <Text style={styles.value} accessibilityLabel={`Quantity ${value}`}>
        {value}
      </Text>
      <Pressable
        onPress={inc}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        hitSlop={8}
      >
        <Text style={styles.btnText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  btn: {
    minWidth: touch.stepper,
    minHeight: touch.minTarget,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    backgroundColor: colors.border,
  },
  btnText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.ink,
    lineHeight: 26,
  },
  value: {
    ...typography.body,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'center',
    color: colors.ink,
  },
});
