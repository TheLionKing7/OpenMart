import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { LGA_OPTIONS, MARKET_OPTIONS } from '../../data/markets';
import { OnboardingStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingShop'>;

export function OnboardingShopScreen({ navigation }: Props) {
  const [shopName, setShopName] = useState('');
  const [market, setMarket] = useState<string>(MARKET_OPTIONS[0]);
  const [lga, setLga] = useState<string>(LGA_OPTIONS[0]);
  const [referrerCode, setReferrerCode] = useState('');

  const canContinue = shopName.trim().length >= 2;

  return (
    <View style={styles.container}>
      <OnboardingProgress step={2} total={5} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your shop</Text>
        <Text style={styles.subtitle}>
          Your open market location — used to find wholesalers who serve your area.
        </Text>

        <TextField
          label="Shop name"
          placeholder="e.g. Mama Bola Provisions"
          value={shopName}
          onChangeText={setShopName}
          autoCapitalize="words"
        />

        <Text style={styles.sectionLabel}>Market</Text>
        <View style={styles.chips}>
          {MARKET_OPTIONS.map((m) => (
            <Pressable
              key={m}
              onPress={() => setMarket(m)}
              style={[styles.chip, market === m && styles.chipActive]}
              accessibilityRole="button"
            >
              <Text style={[styles.chipText, market === m && styles.chipTextActive]}>{m}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>LGA</Text>
        <View style={styles.chips}>
          {LGA_OPTIONS.map((l) => (
            <Pressable
              key={l}
              onPress={() => setLga(l)}
              style={[styles.chip, lga === l && styles.chipActive]}
              accessibilityRole="button"
            >
              <Text style={[styles.chipText, lga === l && styles.chipTextActive]}>{l}</Text>
            </Pressable>
          ))}
        </View>

        <TextField
          label="Referrer code (optional)"
          placeholder="From affiliate partner"
          value={referrerCode}
          onChangeText={setReferrerCode}
          hint="AI-powered affiliate partners can share a code when they onboard you."
          autoCapitalize="characters"
        />
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={() =>
            navigation.navigate('OnboardingDistributor', {
              shopName: shopName.trim(),
              marketArea: market,
              lga,
              referrerCode: referrerCode.trim() || undefined,
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.title, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted },
  sectionLabel: { ...typography.label, color: colors.ink, marginTop: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.surface },
  chipText: { ...typography.caption, color: colors.muted },
  chipTextActive: { color: colors.primary, fontWeight: '700' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
