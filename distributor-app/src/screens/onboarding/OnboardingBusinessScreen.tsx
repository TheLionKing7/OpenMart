import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { useOnboardingDraft } from '../../context/OnboardingDraftContext';
import { OnboardingStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingBusiness'>;

export function OnboardingBusinessScreen({ navigation }: Props) {
  const { draft, updateDraft } = useOnboardingDraft();

  const canContinue =
    draft.distributorName.trim().length >= 2 &&
    draft.stallLabel.trim().length >= 2 &&
    draft.lga.trim().length >= 2 &&
    draft.operatorName.trim().length >= 2 &&
    draft.phone.trim().length >= 10;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <OnboardingProgress step={2} total={5} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your business</Text>
        <Text style={styles.subtitle}>
          Wholesale name, location, and who operates the ledger today.
        </Text>
        <View style={styles.form}>
          <TextField
            label="Business name"
            value={draft.distributorName}
            onChangeText={(v) => updateDraft({ distributorName: v })}
            placeholder="e.g. Emeka Foods & Provisions"
            autoCapitalize="words"
          />
          <TextField
            label="Warehouse / stall address"
            value={draft.stallLabel}
            onChangeText={(v) => updateDraft({ stallLabel: v })}
            placeholder="e.g. Block 12, Oke-Arin"
          />
          <TextField
            label="LGA"
            value={draft.lga}
            onChangeText={(v) => updateDraft({ lga: v })}
            placeholder="e.g. Lagos Island"
            autoCapitalize="words"
          />
          <TextField
            label="Operator name"
            value={draft.operatorName}
            onChangeText={(v) => updateDraft({ operatorName: v })}
            placeholder="Who runs fulfillment today?"
            autoCapitalize="words"
          />
          <TextField
            label="Phone"
            value={draft.phone}
            onChangeText={(v) => updateDraft({ phone: v })}
            placeholder="08012345678"
            keyboardType="phone-pad"
          />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={() => navigation.navigate('OnboardingCoverage')}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.md },
  title: { ...typography.title, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted },
  form: { gap: spacing.lg, marginTop: spacing.sm },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
});
