import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
};

export function PrimaryButton({ label, onPress, disabled, variant = 'primary', style }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        isPrimary ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && (isPrimary ? styles.primaryPressed : styles.secondaryPressed),
        style,
      ]}
      accessibilityRole="button"
    >
      <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textSecondary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { minHeight: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  primary: { backgroundColor: colors.primary },
  primaryPressed: { backgroundColor: colors.primaryPressed },
  secondary: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  secondaryPressed: { backgroundColor: colors.surface },
  disabled: { opacity: 0.45 },
  text: { ...typography.label, fontSize: 16 },
  textPrimary: { color: colors.onPrimary },
  textSecondary: { color: colors.primary },
});
