import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MetricCard } from '../components/MetricCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useLogistics } from '../context/LogisticsContext';
import { RootStackParamList } from '../navigation/types';
import { formatNgn } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { profile, dashboard, platformConnected, refreshDashboard } = useLogistics();
  const stats = dashboard?.stats ?? { activeJobs: 0, deliveredJobs: 0, pendingQuotes: 0 };
  const jobs = dashboard?.jobs ?? [];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{profile?.companyName}</Text>
      <Text style={styles.subtitle}>
        {platformConnected ? 'Platform connected' : 'Platform offline — start backend on :3099'}
      </Text>

      <View style={styles.metrics}>
        <MetricCard label="Active jobs" value={String(stats.activeJobs)} />
        <MetricCard label="Pending quotes" value={String(stats.pendingQuotes)} />
        <MetricCard label="Delivered" value={String(stats.deliveredJobs)} />
      </View>

      <PrimaryButton label="Refresh jobs" variant="secondary" onPress={refreshDashboard} />

      <Text style={styles.section}>Partner jobs</Text>
      {jobs.length === 0 ? (
        <Text style={styles.empty}>No jobs yet. Jobs appear when merchants request partner logistics.</Text>
      ) : (
        jobs.map((job) => (
          <Pressable
            key={job.id}
            style={styles.jobCard}
            onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
          >
            <Text style={styles.jobRoute}>{job.routeLabel}</Text>
            <Text style={styles.jobMeta}>
              {job.orderRef} · {job.merchantShop} · {formatNgn(job.feeNgn)}
            </Text>
            <Text style={styles.jobStatus}>{job.status.replace(/_/g, ' ')}</Text>
          </Pressable>
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
  jobCard: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 4,
  },
  jobRoute: { ...typography.label, color: colors.ink },
  jobMeta: { ...typography.caption, color: colors.muted },
  jobStatus: { ...typography.caption, color: colors.primary, textTransform: 'capitalize' },
});
