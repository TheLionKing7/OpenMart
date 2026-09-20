import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { useLogistics } from '../context/LogisticsContext';
import { RootStackParamList } from '../navigation/types';
import { formatNgn } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';
import type { LogisticsJobStatus } from '../../../shared/logistics';

type Props = NativeStackScreenProps<RootStackParamList, 'JobDetail'>;

const NEXT: Partial<Record<LogisticsJobStatus, LogisticsJobStatus>> = {
  pending_quote: 'quote_accepted',
  quote_accepted: 'awaiting_pickup',
  awaiting_pickup: 'in_transit',
  in_transit: 'delivered',
};

export function JobDetailScreen({ navigation, route }: Props) {
  const { dashboard, advanceJob } = useLogistics();
  const job = dashboard?.jobs.find((j) => j.id === route.params.jobId);

  if (!job) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Job not found</Text>
        <PrimaryButton label="Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const next = NEXT[job.status];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{job.routeLabel}</Text>
      <Text style={styles.meta}>{job.orderRef}</Text>
      <Text style={styles.meta}>{job.merchantShop} · {job.merchantMarket}</Text>
      <Text style={styles.meta}>Fee {formatNgn(job.feeNgn)}</Text>
      <Text style={styles.status}>{job.status.replace(/_/g, ' ')}</Text>
      {next ? (
        <PrimaryButton
          label={`Mark ${next.replace(/_/g, ' ')}`}
          onPress={async () => {
            await advanceJob(job.id, next);
            navigation.goBack();
          }}
        />
      ) : null}
      <PrimaryButton label="Back" variant="secondary" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  title: { ...typography.title, color: colors.ink },
  meta: { ...typography.body, color: colors.muted },
  status: { ...typography.label, color: colors.primary, textTransform: 'capitalize' },
});
