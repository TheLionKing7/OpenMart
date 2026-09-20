import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useDistributor } from '../../context/DistributorContext';
import { useOnboardingDraft } from '../../context/OnboardingDraftContext';
import { OnboardingStackParamList } from '../../navigation/types';
import { formatLeadTime } from '../../utils/format';
import { createDistributorId } from '../../utils/slug';
import { colors, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingReady'>;

export function OnboardingReadyScreen({}: Props) {
  const { draft } = useOnboardingDraft();
  const { completeOnboarding } = useDistributor();

  return (
    <View style={styles.container}>
      <OnboardingProgress step={5} total={5} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Review & open ledger</Text>
        <Text style={styles.subtitle}>
          Merchants matching your coverage will see these terms when ordering. You start with an
          empty queue — add inventory as you go.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Business</Text>
          <Text style={styles.cardValue}>{draft.distributorName}</Text>
          <Text style={styles.cardMeta}>
            {draft.stallLabel} · {draft.lga}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Operator</Text>
          <Text style={styles.cardValue}>{draft.operatorName}</Text>
          <Text style={styles.cardMeta}>{draft.phone}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Coverage</Text>
          <Text style={styles.cardValue}>{draft.servesMarkets.join(' · ')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Logistics</Text>
          <Text style={styles.cardValue}>
            {draft.hasLogistics ? 'Delivery provided' : 'Pickup only'}
          </Text>
          <Text style={styles.cardMeta}>Lead time: {formatLeadTime(draft.minLeadTimeDays)}</Text>
          <Text style={styles.conditions}>{draft.orderingConditions}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label="Open fulfillment ledger"
          onPress={() =>
            completeOnboarding({
              distributorId: createDistributorId(draft.distributorName),
              distributorName: draft.distributorName.trim(),
              stallLabel: draft.stallLabel.trim(),
              lga: draft.lga.trim(),
              operatorName: draft.operatorName.trim(),
              phone: draft.phone.trim(),
              servesMarkets: draft.servesMarkets,
              hasLogistics: draft.hasLogistics,
              minLeadTimeDays: draft.minLeadTimeDays,
              orderingConditions: draft.orderingConditions.trim(),
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.md },
  title: { ...typography.title, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted },
  card: {
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  cardLabel: { ...typography.caption, color: colors.muted },
  cardValue: { ...typography.label, color: colors.ink, fontSize: 16 },
  cardMeta: { ...typography.caption, color: colors.muted },
  conditions: { ...typography.body, color: colors.ink, marginTop: spacing.xs },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
});
