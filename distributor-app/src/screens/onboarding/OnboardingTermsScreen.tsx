import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { useOnboardingDraft } from '../../context/OnboardingDraftContext';
import { OnboardingStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingTerms'>;

const LEAD_TIME_OPTIONS = [
  { days: 0, label: 'Same day' },
  { days: 1, label: '1 day ahead' },
  { days: 3, label: '3 days ahead' },
  { days: 7, label: '7 days ahead' },
];

export function OnboardingTermsScreen({ navigation }: Props) {
  const { draft, updateDraft } = useOnboardingDraft();

  const canContinue = draft.orderingConditions.trim().length >= 10;

  return (
    <View style={styles.container}>
      <OnboardingProgress step={4} total={5} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Logistics & ordering</Text>
        <Text style={styles.subtitle}>
          How should merchants order from you? State lead times and any conditions — e.g. advance
          notice required for door delivery.
        </Text>

        <Text style={styles.label}>Do you provide delivery / logistics?</Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.toggle, draft.hasLogistics && styles.toggleActive]}
            onPress={() => updateDraft({ hasLogistics: true })}
            accessibilityRole="button"
          >
            <Text style={[styles.toggleText, draft.hasLogistics && styles.toggleTextActive]}>Yes</Text>
          </Pressable>
          <Pressable
            style={[styles.toggle, !draft.hasLogistics && styles.toggleActive]}
            onPress={() => updateDraft({ hasLogistics: false, minLeadTimeDays: 0 })}
            accessibilityRole="button"
          >
            <Text style={[styles.toggleText, !draft.hasLogistics && styles.toggleTextActive]}>
              No — pickup only
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Minimum order lead time</Text>
        <Text style={styles.hint}>
          {draft.hasLogistics
            ? 'How far ahead must a merchant order for you to deliver?'
            : 'How soon can merchants collect after payment?'}
        </Text>
        <View style={styles.chips}>
          {LEAD_TIME_OPTIONS.map((opt) => {
            const active = draft.minLeadTimeDays === opt.days;
            return (
              <Pressable
                key={opt.days}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => updateDraft({ minLeadTimeDays: opt.days })}
                accessibilityRole="button"
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextField
          label="Ordering conditions"
          value={draft.orderingConditions}
          onChangeText={(v) => updateDraft({ orderingConditions: v })}
          placeholder={
            draft.hasLogistics
              ? 'e.g. Order 3+ days ahead for door delivery. Minimum cart ₦50,000.'
              : 'e.g. Pickup at stall after payment clears. No same-day delivery.'
          }
          multiline
          style={styles.conditions}
        />
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={() => navigation.navigate('OnboardingReady')}
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
  label: { ...typography.label, color: colors.ink, marginTop: spacing.sm },
  hint: { ...typography.caption, color: colors.muted },
  row: { flexDirection: 'row', gap: spacing.sm },
  toggle: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  toggleActive: { borderColor: colors.primary, backgroundColor: colors.bg },
  toggleText: { ...typography.label, color: colors.muted },
  toggleTextActive: { color: colors.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.bg },
  chipText: { ...typography.caption, color: colors.muted },
  chipTextActive: { color: colors.primary, fontWeight: '700' },
  conditions: { minHeight: 96, textAlignVertical: 'top' },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
});
