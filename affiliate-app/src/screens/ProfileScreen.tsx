import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAffiliate } from '../context/AffiliateContext';
import { MainStackParamList } from '../navigation/types';
import { formatNgn } from '../utils/format';
import { MERCHANT_ACTIVATION_BOUNTY_NGN } from '../../../shared/affiliate';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'Profile'>;

export function ProfileScreen({}: Props) {
  const { profile, resetOnboarding } = useAffiliate();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Partner</Text>
        <Text style={styles.value}>{profile?.name}</Text>
        <Text style={styles.meta}>{profile?.phone}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Referrer code</Text>
        <Text style={styles.code}>{profile?.referrerCode}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Recruitment markets</Text>
        <Text style={styles.value}>{profile?.markets.join(' · ')}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Commission</Text>
        <Text style={styles.value}>{formatNgn(MERCHANT_ACTIVATION_BOUNTY_NGN)} per activation</Text>
        <Text style={styles.meta}>Paid by OpenMarket when referred merchant settles first order</Text>
      </View>
      <PrimaryButton label="Reset onboarding" variant="secondary" onPress={resetOnboarding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  label: { ...typography.caption, color: colors.muted },
  value: { ...typography.label, color: colors.ink, fontSize: 16 },
  code: { ...typography.metric, fontSize: 22, color: colors.primary, letterSpacing: 1 },
  meta: { ...typography.body, color: colors.muted },
});
