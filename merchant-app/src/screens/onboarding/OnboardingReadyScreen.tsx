import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useMerchant } from '../../context/MerchantContext';
import { OnboardingStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingReady'>;

export function OnboardingReadyScreen({ route }: Props) {
  const { completeOnboarding } = useMerchant();
  const {
    shopName,
    marketArea,
    lga,
    phone,
    preferredDistributorId,
    preferredDistributorName,
    referrerCode,
  } = route.params;

  const finish = async () => {
    await completeOnboarding({
      shopName,
      marketArea,
      lga,
      phone,
      preferredDistributorId,
      preferredDistributorName,
      referrerCode,
    });
  };

  return (
    <View style={styles.container}>
      <OnboardingProgress step={5} total={5} />
      <View style={styles.body}>
        <Text style={styles.title}>You're set, {shopName}</Text>
        <Text style={styles.subtitle}>
          {marketArea} · {lga}
          {'\n'}Supplier: {preferredDistributorName}
          {referrerCode ? `\nReferred by ${referrerCode}` : ''}
        </Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What happens next</Text>
          <Text style={styles.step}>1. Restock from {preferredDistributorName}</Text>
          <Text style={styles.step}>2. Pay via virtual account (auto-verified)</Text>
          <Text style={styles.step}>3. Track settlement through delivery</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Go to home" onPress={finish} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: spacing.xl, gap: spacing.lg, justifyContent: 'center' },
  title: { ...typography.title, fontSize: 24, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted, lineHeight: 22 },
  card: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  cardTitle: { ...typography.label, color: colors.ink },
  step: { ...typography.body, color: colors.ink },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
