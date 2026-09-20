import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { useDistributor } from '../context/DistributorContext';
import { MainStackParamList } from '../navigation/types';
import { formatLeadTime } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'Profile'>;

export function ProfileScreen({}: Props) {
  const { profile, resetOnboarding } = useDistributor();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Business</Text>
        <Text style={styles.value}>{profile?.distributorName}</Text>
        <Text style={styles.meta}>
          {profile?.stallLabel} · {profile?.lga}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Operator</Text>
        <Text style={styles.value}>{profile?.operatorName}</Text>
        <Text style={styles.meta}>{profile?.phone}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Coverage</Text>
        <Text style={styles.value}>{profile?.servesMarkets.join(' · ') || '—'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Logistics</Text>
        <Text style={styles.value}>
          {profile?.hasLogistics ? 'Delivery provided' : 'Pickup only'}
        </Text>
        <Text style={styles.meta}>Lead time: {formatLeadTime(profile?.minLeadTimeDays ?? 0)}</Text>
        {profile?.orderingConditions ? (
          <Text style={styles.conditions}>{profile.orderingConditions}</Text>
        ) : null}
      </View>

      <Text style={styles.demo}>Demo build — data stored locally on device.</Text>
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
  meta: { ...typography.body, color: colors.muted },
  conditions: { ...typography.body, color: colors.ink, marginTop: spacing.xs },
  demo: { ...typography.caption, color: colors.muted },
});
