import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSync } from '../context/SyncContext';
import { colors, spacing, typography } from '../theme/tokens';

export function SyncBar() {
  const { syncState, pendingCount, lastSyncedMinutesAgo, retrySync } = useSync();

  const config =
    syncState === 'synced'
      ? {
          bg: colors.successBg,
          dot: colors.success,
          label: `Synced (Last updated: ${lastSyncedMinutesAgo === 0 ? 'just now' : `${lastSyncedMinutesAgo} min ago`})`,
        }
      : syncState === 'offline'
        ? {
            bg: colors.pendingBg,
            dot: colors.pending,
            label: `Offline — Changes saved locally (${pendingCount} pending)`,
          }
        : {
            bg: colors.errorBg,
            dot: colors.error,
            label: 'Sync failed — tap to retry',
          };

  const content = (
    <View style={[styles.bar, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} accessibilityElementsHidden />
      <Text style={styles.text}>{config.label}</Text>
    </View>
  );

  if (syncState === 'error') {
    return (
      <Pressable onPress={retrySync} accessibilityRole="button" accessibilityLabel="Retry sync">
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  text: {
    ...typography.caption,
    color: colors.ink,
    flex: 1,
  },
});
