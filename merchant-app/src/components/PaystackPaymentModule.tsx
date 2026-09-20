import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { PAYMENT_CHANNELS } from '../../../shared/payments';
import { formatNgn } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type PaymentStatus = 'idle' | 'pending' | 'verified' | 'failed';

type Props = {
  amountNgn: number;
  reference: string;
  status: PaymentStatus;
  demoMode: boolean;
  authorizationUrl: string;
  onPay: () => void;
  onVerify: () => void;
  onSimulate?: () => void;
  verifying?: boolean;
};

export function PaystackPaymentModule({
  amountNgn,
  reference,
  status,
  demoMode,
  authorizationUrl,
  onPay,
  onVerify,
  onSimulate,
  verifying,
}: Props) {
  const statusStyle =
    status === 'verified'
      ? { bg: colors.successBg, text: colors.success, label: 'Payment verified' }
      : status === 'failed'
        ? { bg: colors.errorBg, text: colors.error, label: 'Payment failed — try again' }
        : { bg: colors.pendingBg, text: colors.pending, label: 'Awaiting payment' };

  const openCheckout = () => {
    if (Platform.OS === 'web') {
      window.open(authorizationUrl, '_blank', 'noopener,noreferrer');
    } else {
      Linking.openURL(authorizationUrl);
    }
    onPay();
  };

  return (
    <View style={styles.card}>
      <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
        <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
      </View>

      <Text style={styles.heading}>Pay via Paystack</Text>
      <Text style={styles.amount}>{formatNgn(amountNgn)}</Text>
      <Text style={styles.ref}>Ref: {reference}</Text>

      <Text style={styles.channelsTitle}>Nigerian payment options</Text>
      <View style={styles.channels}>
        {PAYMENT_CHANNELS.map((ch) => (
          <View key={ch.id} style={styles.channelRow}>
            <Text style={styles.channelLabel}>{ch.label}</Text>
            <Text style={styles.channelHint}>{ch.hint}</Text>
          </View>
        ))}
      </View>

      {status !== 'verified' ? (
        <>
          <Pressable
            onPress={openCheckout}
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>
              {demoMode ? 'Open demo checkout' : 'Pay with Paystack'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onVerify}
            disabled={verifying}
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryBtnText}>
              {verifying ? 'Checking payment…' : "I've paid — verify"}
            </Text>
          </Pressable>

          {demoMode && onSimulate ? (
            <Pressable onPress={onSimulate} style={styles.demoLink} accessibilityRole="button">
              <Text style={styles.demoLinkText}>Simulate payment success (demo)</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}

      {demoMode ? (
        <Text style={styles.demoNote}>
          Demo mode: add Paystack keys to backend/.env for live card, bank, USSD, and transfer.
        </Text>
      ) : (
        <Text style={styles.hint}>
          Choose card, bank, USSD, transfer, or QR on the Paystack checkout page.
        </Text>
      )}
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
  statusText: { ...typography.caption, fontWeight: '700' },
  heading: { ...typography.caption, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  amount: { fontSize: 32, fontWeight: '700', color: colors.ink, lineHeight: 38 },
  ref: { ...typography.caption, color: colors.muted },
  channelsTitle: { ...typography.label, color: colors.ink, marginTop: spacing.sm },
  channels: { gap: spacing.sm },
  channelRow: { gap: 2 },
  channelLabel: { ...typography.label, color: colors.ink, fontSize: 14 },
  channelHint: { ...typography.caption, color: colors.muted },
  primaryBtn: {
    minHeight: 52,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  primaryBtnPressed: { backgroundColor: colors.primaryPressed },
  primaryBtnText: { ...typography.label, color: colors.onPrimary, fontSize: 16 },
  secondaryBtn: {
    minHeight: 52,
    backgroundColor: colors.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnPressed: { backgroundColor: colors.surface },
  secondaryBtnText: { ...typography.label, color: colors.primary, fontSize: 16 },
  demoLink: { alignItems: 'center', paddingVertical: spacing.sm },
  demoLinkText: { ...typography.caption, color: colors.accent, textDecorationLine: 'underline' },
  hint: { ...typography.caption, color: colors.muted, lineHeight: 18 },
  demoNote: { ...typography.caption, color: colors.warning, lineHeight: 18 },
});
