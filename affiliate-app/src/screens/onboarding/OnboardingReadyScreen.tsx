import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { PrimaryButton } from '../../components/PrimaryButton';
import { MERCHANT_ACTIVATION_BOUNTY_NGN, useAffiliate } from '../../context/AffiliateContext';
import { OnboardingStackParamList } from '../../navigation/types';
import { formatNgn } from '../../utils/format';
import { colors, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingReady'>;

export function OnboardingReadyScreen({ route }: Props) {
  const { completeOnboarding } = useAffiliate();
  const { name, phone, markets, referrerCode } = route.params;

  return (
    <View style={styles.container}>
      <OnboardingProgress step={3} total={3} />
      <View style={styles.body}>
        <Text style={styles.title}>You're live, {name}</Text>
        <Text style={styles.subtitle}>Share your code with merchants in {markets.join(', ')}.</Text>
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Referrer code</Text>
          <Text style={styles.code}>{referrerCode}</Text>
          <PrimaryButton
            label="Copy code"
            variant="secondary"
            onPress={() => Clipboard.setStringAsync(referrerCode)}
          />
        </View>
        <Text style={styles.meta}>
          Earn {formatNgn(MERCHANT_ACTIVATION_BOUNTY_NGN)} when a referred merchant completes their
          first settled order. Commission is credited by OpenMarket.
        </Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton
          label="Open dashboard"
          onPress={() => completeOnboarding({ name, phone, markets, referrerCode })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: spacing.xl, gap: spacing.lg },
  title: { ...typography.title, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted },
  codeCard: {
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.md,
    alignItems: 'center',
  },
  codeLabel: { ...typography.caption, color: colors.muted },
  code: { ...typography.metric, color: colors.primary, letterSpacing: 2 },
  meta: { ...typography.body, color: colors.muted },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
});
