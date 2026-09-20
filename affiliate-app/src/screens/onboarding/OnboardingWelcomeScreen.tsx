import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { OpenMarketLogo } from '../../components/OpenMarketLogo';
import { PrimaryButton } from '../../components/PrimaryButton';
import { MERCHANT_ACTIVATION_BOUNTY_NGN } from '../../context/AffiliateContext';
import { OnboardingStackParamList } from '../../navigation/types';
import { formatNgn } from '../../utils/format';
import { colors, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingWelcome'>;

export function OnboardingWelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <OnboardingProgress step={1} total={3} />
      <View style={styles.body}>
        <OpenMarketLogo />
        <Text style={styles.kicker}>Affiliate partners</Text>
        <Text style={styles.title}>Grow the trade network</Text>
        <Text style={styles.subtitle}>
          Bring verified merchants onto OpenMarket with your referrer code. You earn when they complete
          their first settled order — paid by OpenMarket, not merchants or distributors.
        </Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phase 1 bounty</Text>
          <Text style={styles.bounty}>{formatNgn(MERCHANT_ACTIVATION_BOUNTY_NGN)}</Text>
          <Text style={styles.cardMeta}>Per merchant activation (first settled order)</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Get started" onPress={() => navigation.navigate('OnboardingProfile')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: spacing.xl, gap: spacing.md },
  kicker: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  title: { ...typography.title, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted },
  card: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.xs,
  },
  cardTitle: { ...typography.label, color: colors.primary },
  bounty: { ...typography.metric, color: colors.success },
  cardMeta: { ...typography.caption, color: colors.muted },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
});
