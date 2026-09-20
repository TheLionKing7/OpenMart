import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { useOnboardingDraft } from '../../context/OnboardingDraftContext';
import { OnboardingStackParamList } from '../../navigation/types';
import { parseMarketsInput } from '../../utils/slug';
import { colors, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingCoverage'>;

const MARKET_SUGGESTIONS = [
  'Oke-Arin Market',
  'Balogun Market',
  'Idumota',
  'Mushin Open Market',
  'Alaba International',
  'Yaba',
  'Ikeja',
  'Surulere',
];

export function OnboardingCoverageScreen({ navigation }: Props) {
  const { draft, updateDraft } = useOnboardingDraft();
  const [marketsInput, setMarketsInput] = useState(draft.servesMarkets.join(', '));

  const selected = useMemo(() => parseMarketsInput(marketsInput), [marketsInput]);

  const toggleSuggestion = (market: string) => {
    const set = new Set(selected);
    if (set.has(market)) set.delete(market);
    else set.add(market);
    setMarketsInput([...set].join(', '));
  };

  const canContinue = selected.length > 0;

  return (
    <View style={styles.container}>
      <OnboardingProgress step={3} total={5} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Markets & regions</Text>
        <Text style={styles.subtitle}>
          Where do you sell and fulfill? List open markets, LGAs, or trade clusters you cover.
          Merchants in these areas can be routed to you.
        </Text>
        <TextField
          label="Areas you serve"
          value={marketsInput}
          onChangeText={setMarketsInput}
          placeholder="Oke-Arin Market, Mushin, Yaba"
          multiline
        />
        <Text style={styles.hint}>Separate with commas. Tap suggestions to add quickly.</Text>
        <View style={styles.chips}>
          {MARKET_SUGGESTIONS.map((market) => {
            const active = selected.includes(market);
            return (
              <Pressable
                key={market}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleSuggestion(market)}
                accessibilityRole="button"
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{market}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={() => {
            updateDraft({ servesMarkets: selected });
            navigation.navigate('OnboardingTerms');
          }}
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
  hint: { ...typography.caption, color: colors.muted },
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
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
});
