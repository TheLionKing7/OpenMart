import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { SyncBar } from '../components/SyncBar';
import { useMerchant } from '../context/MerchantContext';
import { MainStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { profile, resetOnboarding } = useMerchant();

  return (
    <View style={styles.container}>
      <SyncBar />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{profile?.shopName}</Text>
        <Row label="Market" value={profile?.marketArea ?? '—'} />
        <Row label="LGA" value={profile?.lga ?? '—'} />
        <Row label="Preferred distributor" value={profile?.preferredDistributorName ?? '—'} />
        <Row label="Phone" value={profile?.phone ?? '—'} />
        {profile?.referrerCode ? <Row label="Referrer" value={profile.referrerCode} /> : null}

        <PrimaryButton
          label="Change distributor"
          variant="secondary"
          onPress={() => navigation.navigate('DistributorSelect')}
          style={styles.changeBtn}
        />

        <View style={styles.divider} />
        <Text style={styles.hint}>
          Reset onboarding to test the full flow again from welcome screen.
        </Text>
        <PrimaryButton label="Reset onboarding (demo)" variant="secondary" onPress={resetOnboarding} />
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, styles.rowValueWrap]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { ...typography.title, color: colors.ink, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { ...typography.body, color: colors.muted, flex: 1 },
  rowValue: { ...typography.body, color: colors.ink, fontWeight: '600', flex: 1, textAlign: 'right' },
  rowValueWrap: { flexShrink: 1 },
  changeBtn: { marginTop: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  hint: { ...typography.caption, color: colors.muted, lineHeight: 18 },
});
