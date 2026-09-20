import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MetricCard } from '../components/MetricCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAffiliate } from '../context/AffiliateContext';
import { MainStackParamList } from '../navigation/types';
import { formatNgn } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { profile, dashboard, platformConnected, refreshDashboard } = useAffiliate();

  useFocusEffect(
    useCallback(() => {
      refreshDashboard();
    }, [refreshDashboard]),
  );

  const stats = dashboard?.stats ?? { signups: 0, activations: 0, earnedNgn: 0, pendingNgn: 0 };
  const recent = dashboard?.referrals.slice(0, 3) ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hello, {profile?.name}</Text>
      <Text style={styles.meta}>
        Code: {profile?.referrerCode} · {platformConnected ? 'Platform connected' : 'Platform offline'}
      </Text>

      <PrimaryButton
        label="Copy referrer code"
        variant="secondary"
        onPress={() => profile && Clipboard.setStringAsync(profile.referrerCode)}
      />

      <View style={styles.metrics}>
        <MetricCard label="Sign-ups" value={String(stats.signups)} accent />
        <MetricCard label="Activations" value={String(stats.activations)} />
      </View>
      <View style={styles.metrics}>
        <MetricCard label="Earned" value={formatNgn(stats.earnedNgn)} />
        <MetricCard label="Pending" value={formatNgn(stats.pendingNgn)} />
      </View>

      <View style={styles.wallet}>
        <Text style={styles.walletLabel}>Affiliate wallet</Text>
        <Text style={styles.walletValue}>{formatNgn(stats.earnedNgn + stats.pendingNgn)}</Text>
        <Text style={styles.walletHint}>Paid by OpenMarket from platform acquisition budget</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent referrals</Text>
        {recent.length === 0 ? (
          <Text style={styles.empty}>No referrals yet. Share your code with merchants.</Text>
        ) : (
          recent.map((r) => (
            <View key={r.id} style={styles.row}>
              <View>
                <Text style={styles.rowTitle}>{r.merchantShop}</Text>
                <Text style={styles.rowMeta}>{r.merchantMarket}</Text>
              </View>
              <Text style={[styles.badge, r.status === 'activated' && styles.badgeActive]}>
                {r.status === 'activated' ? 'Activated' : 'Signed up'}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.navRow}>
        <Pressable style={styles.navCard} onPress={() => navigation.navigate('Referrals')} accessibilityRole="button">
          <Text style={styles.navTitle}>All referrals</Text>
        </Pressable>
        <Pressable style={styles.navCard} onPress={() => navigation.navigate('Commissions')} accessibilityRole="button">
          <Text style={styles.navTitle}>Commissions</Text>
        </Pressable>
      </View>

      <PrimaryButton label="Profile" variant="secondary" onPress={() => navigation.navigate('Profile')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl },
  greeting: { ...typography.title, color: colors.ink },
  meta: { ...typography.body, color: colors.muted },
  metrics: { flexDirection: 'row', gap: spacing.md },
  wallet: {
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success,
    backgroundColor: colors.successBg,
    gap: spacing.xs,
  },
  walletLabel: { ...typography.caption, color: colors.muted },
  walletValue: { ...typography.metric, color: colors.success },
  walletHint: { ...typography.caption, color: colors.muted },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.label, color: colors.ink },
  empty: { ...typography.body, color: colors.muted },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowTitle: { ...typography.label, color: colors.ink },
  rowMeta: { ...typography.caption, color: colors.muted },
  badge: { ...typography.caption, color: colors.pending, fontWeight: '700' },
  badgeActive: { color: colors.success },
  navRow: { flexDirection: 'row', gap: spacing.md },
  navCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  navTitle: { ...typography.label, color: colors.primary },
});
