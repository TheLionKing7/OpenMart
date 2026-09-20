import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MetricCard } from '../components/MetricCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useManufacturer } from '../context/ManufacturerContext';
import { RootStackParamList } from '../navigation/types';
import { formatDate, formatNgn } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { profile, dashboard, platformConnected, refreshDashboard } = useManufacturer();
  const campaigns = dashboard?.campaigns ?? [];
  const active = campaigns.filter((c) => c.active);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{profile?.companyName}</Text>
      <Text style={styles.subtitle}>
        {platformConnected ? 'Platform connected' : 'Platform offline — start backend on :3099'}
      </Text>

      <View style={styles.metrics}>
        <MetricCard label="Active campaigns" value={String(active.length)} />
        <MetricCard label="Total campaigns" value={String(campaigns.length)} />
        <MetricCard label="Category" value={profile?.category || '—'} />
      </View>

      <PrimaryButton label="Launch SmartSubsidy campaign" onPress={() => navigation.navigate('CreateCampaign')} />
      <PrimaryButton label="Refresh" variant="secondary" onPress={refreshDashboard} />

      <Text style={styles.section}>Campaigns</Text>
      {campaigns.length === 0 ? (
        <Text style={styles.empty}>No campaigns yet. Launch a 48-hour trade promotion for a market cluster.</Text>
      ) : (
        campaigns.map((camp) => (
          <View key={camp.id} style={styles.card}>
            <Text style={styles.cardTitle}>{camp.title}</Text>
            <Text style={styles.cardMeta}>
              {camp.marketCluster} · {formatNgn(camp.discountNgn)} off · ends {formatDate(camp.endsAt)}
            </Text>
            <Text style={[styles.badge, camp.active ? styles.badgeOn : styles.badgeOff]}>
              {camp.active ? 'Active' : 'Ended'}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg, flexGrow: 1 },
  title: { ...typography.title, color: colors.ink },
  subtitle: { ...typography.caption, color: colors.muted },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  section: { ...typography.label, color: colors.ink, marginTop: spacing.md },
  empty: { ...typography.body, color: colors.muted },
  card: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 4,
  },
  cardTitle: { ...typography.label, color: colors.ink },
  cardMeta: { ...typography.caption, color: colors.muted },
  badge: { ...typography.caption, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeOn: { backgroundColor: '#e8f5e9', color: colors.success },
  badgeOff: { backgroundColor: colors.border, color: colors.muted },
});
