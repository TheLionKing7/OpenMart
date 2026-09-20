import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DistributorTermsCard } from '../components/DistributorTermsCard';
import { PaystackPaymentModule } from '../components/PaystackPaymentModule';
import { PrimaryButton } from '../components/PrimaryButton';
import { SyncBar } from '../components/SyncBar';
import { useCart } from '../context/CartContext';
import { useMerchant } from '../context/MerchantContext';
import { usePlatform } from '../context/PlatformContext';
import { useSync } from '../context/SyncContext';
import { merchantIdFromProfile } from '../utils/affiliateSync';
import { MainStackParamList } from '../navigation/types';
import {
  initializePayment,
  simulatePaymentSuccess,
  verifyPayment,
} from '../../../shared/platformClient';
import { PaymentSession } from '../../../shared/payments';
import { formatNgn } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation, route }: Props) {
  const { lines, totalNgn, clear } = useCart();
  const { clearPending } = useSync();
  const { createOrder, profile } = useMerchant();
  const { getDistributorProfile } = usePlatform();

  const [session, setSession] = useState<PaymentSession | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'verified' | 'failed'>('idle');
  const [verifying, setVerifying] = useState(false);
  const [requestLogistics, setRequestLogistics] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const distributor = getDistributorProfile(route.params.distributorId);
  const total = route.params.totalNgn;
  const distributorPayoutNgn = Math.round(total * 0.95);
  const platformFeeNgn = total - distributorPayoutNgn;

  useEffect(() => {
    if (distributor?.hasLogistics) setRequestLogistics(true);
  }, [distributor?.hasLogistics]);

  useEffect(() => {
    if (!profile) return;

    const email = `${merchantIdFromProfile(profile)}@merchant.openmarket.africa`;

    initializePayment({
      email,
      merchantId: merchantIdFromProfile(profile),
      merchantShop: profile.shopName,
      merchantMarket: profile.marketArea,
      referrerCode: profile.referrerCode,
      distributorId: route.params.distributorId,
      distributorName: route.params.distributorName,
      lines: lines.map((l) => ({ sku: l.product.sku, quantity: l.quantity })),
      requestLogistics,
    })
      .then(setSession)
      .catch((e) => setInitError(String(e.message || e)))
      .finally(() => setInitializing(false));
  }, [profile, route.params, lines, requestLogistics]);

  const completeAfterPayment = useCallback(
    (orderId: string, orderRef: string) => {
      const paidAt = new Date().toISOString();
      createOrder({
        id: orderId,
        orderRef,
        distributorName: route.params.distributorName,
        distributorId: route.params.distributorId,
        itemCount: lines.reduce((s, l) => s + l.quantity, 0),
        totalNgn: total,
        distributorPayoutNgn,
        platformFeeNgn,
        linesSummary: lines.map((l) => `${l.quantity}× ${l.product.name}`),
        orderLines: lines.map((l) => ({
          productId: l.product.id,
          name: l.product.name,
          sku: l.product.sku,
          unit: l.product.unit,
          distributorId: l.product.distributorId,
          quantity: l.quantity,
        })),
        createdAt: paidAt,
      });
      clearPending();
      clear();
      navigation.replace('Settlement', { orderId });
    },
    [
      clear,
      clearPending,
      createOrder,
      distributorPayoutNgn,
      lines,
      navigation,
      platformFeeNgn,
      route.params,
      total,
    ],
  );

  const runVerify = useCallback(async () => {
    if (!session) return;
    setVerifying(true);
    try {
      const result = await verifyPayment(session.reference);
      if (result.status === 'success') {
        setPaymentStatus('verified');
        if (pollRef.current) clearInterval(pollRef.current);
        completeAfterPayment(session.orderId, session.orderRef);
      } else if (result.status === 'failed') {
        setPaymentStatus('failed');
      }
    } catch {
      setPaymentStatus('failed');
    } finally {
      setVerifying(false);
    }
  }, [session, completeAfterPayment]);

  const startPolling = useCallback(() => {
    setPaymentStatus('pending');
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(runVerify, 4000);
  }, [runVerify]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleSimulate = async () => {
    if (!session) return;
    setVerifying(true);
    try {
      const result = await simulatePaymentSuccess(session.reference);
      if (result.status === 'success') {
        setPaymentStatus('verified');
        completeAfterPayment(session.orderId, session.orderRef);
      }
    } finally {
      setVerifying(false);
    }
  };

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Preparing secure checkout…</Text>
      </View>
    );
  }

  if (initError || !session) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorTitle}>Checkout unavailable</Text>
        <Text style={styles.errorBody}>
          {initError ?? 'Could not reach OpenMarket API. Start the backend on port 3099.'}
        </Text>
        <PrimaryButton label="Go back" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SyncBar />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Pay for your order</Text>
        <Text style={styles.subtitle}>
          {session.orderRef} · {route.params.distributorName}
        </Text>

        {distributor ? <DistributorTermsCard distributor={distributor} /> : null}

        {distributor?.hasLogistics ? (
          <Pressable
            style={styles.logisticsRow}
            onPress={() => setRequestLogistics((v) => !v)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: requestLogistics }}
          >
            <View style={[styles.checkbox, requestLogistics && styles.checkboxOn]} />
            <View style={styles.logisticsCopy}>
              <Text style={styles.logisticsTitle}>Partner logistics delivery</Text>
              <Text style={styles.logisticsHint}>
                Licensed carrier on your corridor — coordinated by OpenMarket, not platform fleet.
              </Text>
            </View>
          </Pressable>
        ) : null}

        <PaystackPaymentModule
          amountNgn={session.amountNgn}
          reference={session.reference}
          status={paymentStatus}
          demoMode={session.demoMode}
          authorizationUrl={session.authorizationUrl}
          onPay={startPolling}
          onVerify={runVerify}
          onSimulate={session.demoMode ? handleSimulate : undefined}
          verifying={verifying}
        />

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Order summary</Text>
          {lines.map((l) => (
            <Text key={l.product.id} style={styles.summaryLine}>
              {l.quantity}× {l.product.name} — {formatNgn(l.product.priceNgn * l.quantity)}
            </Text>
          ))}
          <View style={styles.splitRow}>
            <Text style={styles.splitLabel}>Distributor (95%)</Text>
            <Text style={styles.splitValue}>{formatNgn(distributorPayoutNgn)}</Text>
          </View>
          <View style={styles.splitRow}>
            <Text style={styles.splitLabel}>Platform (5%)</Text>
            <Text style={styles.splitValue}>{formatNgn(platformFeeNgn)}</Text>
          </View>
          <Text style={styles.summaryTotal}>Total {formatNgn(totalNgn)}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.bg,
  },
  loadingText: { ...typography.body, color: colors.muted },
  errorTitle: { ...typography.title, color: colors.ink },
  errorBody: { ...typography.body, color: colors.muted, textAlign: 'center' },
  title: { ...typography.title, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted },
  summary: { gap: spacing.sm, paddingTop: spacing.md },
  summaryTitle: { ...typography.label, color: colors.ink },
  summaryLine: { ...typography.caption, color: colors.muted },
  splitRow: { flexDirection: 'row', justifyContent: 'space-between' },
  splitLabel: { ...typography.caption, color: colors.muted },
  splitValue: { ...typography.caption, color: colors.muted },
  summaryTotal: { ...typography.label, color: colors.ink, marginTop: spacing.sm },
  logisticsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: 2,
  },
  checkboxOn: { backgroundColor: colors.primary },
  logisticsCopy: { flex: 1, gap: 4 },
  logisticsTitle: { ...typography.label, color: colors.ink },
  logisticsHint: { ...typography.caption, color: colors.muted, lineHeight: 18 },
});
