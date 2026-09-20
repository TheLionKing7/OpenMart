import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatNgn } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type PaymentStatus = 'pending' | 'verified' | 'expired';

type Props = {
  bankName: string;
  accountNumber: string;
  amountNgn: number;
  status: PaymentStatus;
  expiresInMinutes: number;
  onSimulatePayment?: () => void;
};

export function VirtualAccountModule({
  bankName,
  accountNumber,
  amountNgn,
  status,
  expiresInMinutes,
  onSimulatePayment,
}: Props) {
  const [copied, setCopied] = useState(false);

  const copyNumber = async () => {
    await Clipboard.setStringAsync(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openBank = () => {
    Linking.openURL('https://moniepoint.com').catch(() => undefined);
  };

  const statusStyle =
    status === 'verified'
      ? { bg: colors.successBg, text: colors.success, label: 'Payment verified' }
      : status === 'expired'
        ? { bg: colors.errorBg, text: colors.error, label: 'Account expired — generate new' }
        : { bg: colors.pendingBg, text: colors.pending, label: `Awaiting transfer · expires in ${expiresInMinutes} min` };

  return (
    <View style={styles.card}>
      <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
        <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
      </View>

      <Text style={styles.heading}>Transfer exactly</Text>
      <Text style={styles.amount}>{formatNgn(amountNgn)}</Text>

      <Text style={styles.bankLabel}>{bankName}</Text>
      <Text style={styles.accountNumber} selectable accessibilityLabel={`Account number ${accountNumber}`}>
        {accountNumber}
      </Text>

      <Text style={styles.hint}>
        Use your bank app or USSD. Payment is detected automatically within 2 seconds of transfer.
      </Text>

      <Pressable
        onPress={copyNumber}
        style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
        accessibilityRole="button"
        accessibilityLabel="Copy account number"
      >
        <Text style={styles.primaryBtnText}>{copied ? 'Copied!' : 'Copy Number'}</Text>
      </Pressable>

      <Pressable
        onPress={openBank}
        style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]}
        accessibilityRole="button"
        accessibilityLabel="Open bank app"
      >
        <Text style={styles.secondaryBtnText}>Open Bank App</Text>
      </Pressable>

      {status === 'pending' && onSimulatePayment ? (
        <Pressable onPress={onSimulatePayment} style={styles.demoLink} accessibilityRole="button">
          <Text style={styles.demoLinkText}>Simulate payment received (demo)</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
  },
  heading: {
    ...typography.caption,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 38,
  },
  bankLabel: {
    ...typography.body,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  accountNumber: {
    ...typography.account,
    color: colors.ink,
    fontFamily: undefined,
  },
  hint: {
    ...typography.caption,
    color: colors.muted,
    lineHeight: 18,
  },
  primaryBtn: {
    minHeight: 52,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  primaryBtnPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryBtnText: {
    ...typography.label,
    color: colors.onPrimary,
    fontSize: 16,
  },
  secondaryBtn: {
    minHeight: 52,
    backgroundColor: colors.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnPressed: {
    backgroundColor: colors.surface,
  },
  secondaryBtnText: {
    ...typography.label,
    color: colors.primary,
    fontSize: 16,
  },
  demoLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  demoLinkText: {
    ...typography.caption,
    color: colors.accent,
    textDecorationLine: 'underline',
  },
});
