import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { generateReferrerCode } from '../../context/AffiliateContext';
import { OnboardingStackParamList } from '../../navigation/types';
import { parseMarketsInput } from '../../utils/markets';
import { colors, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingProfile'>;

const MARKET_SUGGESTIONS = ['Oke-Arin Market', 'Mushin Open Market', 'Idumota', 'Balogun Market'];

export function OnboardingProfileScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [marketsInput, setMarketsInput] = useState('');
  const [referrerCode, setReferrerCode] = useState('');

  const markets = parseMarketsInput(marketsInput);
  const canContinue =
    name.trim().length >= 2 && phone.trim().length >= 10 && markets.length > 0 && referrerCode.trim().length >= 4;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <OnboardingProgress step={2} total={3} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your partner profile</Text>
        <Text style={styles.subtitle}>Merchants enter your referrer code when they onboard.</Text>
        <View style={styles.form}>
          <TextField label="Your name" value={name} onChangeText={setName} placeholder="Ada Okafor" autoCapitalize="words" />
          <TextField label="Phone" value={phone} onChangeText={setPhone} placeholder="08012345678" keyboardType="phone-pad" />
          <TextField
            label="Markets you recruit in"
            value={marketsInput}
            onChangeText={setMarketsInput}
            placeholder="Oke-Arin Market, Mushin"
            multiline
            hint="Comma-separated. Merchants in these areas are your focus."
          />
          <View style={styles.chips}>
            {MARKET_SUGGESTIONS.map((m) => (
              <Pressable
                key={m}
                style={styles.chip}
                onPress={() =>
                  setMarketsInput((prev) => {
                    const set = new Set(parseMarketsInput(prev));
                    set.add(m);
                    return [...set].join(', ');
                  })
                }
              >
                <Text style={styles.chipText}>{m}</Text>
              </Pressable>
            ))}
          </View>
          <TextField
            label="Referrer code"
            value={referrerCode}
            onChangeText={(v) => setReferrerCode(v.toUpperCase())}
            placeholder="ADA-X7K2"
            autoCapitalize="characters"
            hint="Share this code with merchants. Tap generate if needed."
          />
          <PrimaryButton
            label="Generate code"
            variant="secondary"
            onPress={() => setReferrerCode(generateReferrerCode(name || 'Affiliate'))}
          />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={() =>
            navigation.navigate('OnboardingReady', {
              name: name.trim(),
              phone: phone.trim(),
              markets,
              referrerCode: referrerCode.trim().toUpperCase(),
            })
          }
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
  form: { gap: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { ...typography.caption, color: colors.muted },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
});
