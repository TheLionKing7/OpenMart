import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { OnboardingStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingPhone'>;

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('234')) return `+${digits}`;
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`;
  if (digits.length === 10) return `+234${digits}`;
  return input;
}

export function OnboardingPhoneScreen({ navigation, route }: Props) {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const phoneValid = phone.replace(/\D/g, '').length >= 10;
  const otpValid = otp.length === 4;

  return (
    <View style={styles.container}>
      <OnboardingProgress step={4} total={5} />
      <View style={styles.body}>
        <Text style={styles.title}>Verify your number</Text>
        <Text style={styles.subtitle}>
          Used for payment alerts and WhatsApp SmartBridge ordering. We never share your number with
          distributors.
        </Text>

        <TextField
          label="Phone number"
          placeholder="0803 000 0000"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        {!otpSent ? (
          <PrimaryButton
            label="Send verification code"
            variant="secondary"
            disabled={!phoneValid}
            onPress={() => setOtpSent(true)}
          />
        ) : (
          <>
            <TextField
              label="4-digit code"
              placeholder="1234"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={4}
              hint="Demo: enter any 4 digits"
            />
          </>
        )}

        <View style={styles.trustBox}>
          <Text style={styles.trustTitle}>Trust Index (coming soon)</Text>
          <Text style={styles.trustBody}>
            Your restock history builds a programmatic credit profile — no formal bank statements
            required.
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          disabled={!otpSent || !otpValid}
          onPress={() =>
            navigation.navigate('OnboardingReady', {
              ...route.params,
              phone: normalizePhone(phone),
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: spacing.xl, gap: spacing.lg },
  title: { ...typography.title, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted, lineHeight: 22 },
  trustBox: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  trustTitle: { ...typography.label, color: colors.ink },
  trustBody: { ...typography.caption, color: colors.muted, lineHeight: 18 },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
