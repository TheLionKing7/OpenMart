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
        <Text style={styles.kicker}>Distributor ledger</Text>
        <Text style={styles.title}>Set up your fulfillment ledger</Text>
        <Text style={styles.subtitle}>
          Tell us about your wholesale business — where you operate, which markets you serve, and
          how merchants should order. OpenMarket does not assume your details; you enter them once.
        </Text>
        <View style={styles.list}>
          <Text style={styles.item}>· Business & contact information</Text>
          <Text style={styles.item}>· Markets and regions you cover</Text>
          <Text style={styles.item}>· Logistics and ordering lead times</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Get started" onPress={() => navigation.navigate('OnboardingBusiness')} />
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
  list: { gap: spacing.sm, marginTop: spacing.md },
  item: { ...typography.body, color: colors.ink },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
});
