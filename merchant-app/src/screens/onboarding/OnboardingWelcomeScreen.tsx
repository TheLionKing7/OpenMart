import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { OpenMarketLogo } from '../../components/OpenMarketLogo';
import { PrimaryButton } from '../../components/PrimaryButton';
import { OnboardingStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingWelcome'>;

export function OnboardingWelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <OnboardingProgress step={1} total={5} />
      <View style={styles.body}>
        <OpenMarketLogo />
        <Text style={styles.kicker}>For retailers</Text>
        <Text style={styles.title}>Restock wholesale. Pay with Paystack. Track every naira.</Text>
        <Text style={styles.bodyText}>
          Built for open-market shops in Lagos. Card, bank, USSD, transfer, or QR — settlement
          splits automatically to your distributor (95/5).
        </Text>
        <View style={styles.points}>
          <Text style={styles.point}>· Restock from your usual wholesaler</Text>
          <Text style={styles.point}>· Pay via Paystack — Nigerian payment options</Text>
          <Text style={styles.point}>· Track settlement from payment to delivery</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Get started" onPress={() => navigation.navigate('OnboardingShop')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: spacing.xl, gap: spacing.lg, justifyContent: 'center' },
  kicker: { ...typography.caption, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { ...typography.title, fontSize: 26, color: colors.ink, lineHeight: 32 },
  bodyText: { ...typography.body, color: colors.muted, lineHeight: 24 },
  points: { gap: spacing.sm, marginTop: spacing.md },
  point: { ...typography.body, color: colors.ink },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
