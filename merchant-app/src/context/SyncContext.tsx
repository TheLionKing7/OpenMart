import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type SyncState = 'synced' | 'offline' | 'error';

type SyncContextValue = {
  syncState: SyncState;
  pendingCount: number;
  lastSyncedMinutesAgo: number;
  toggleOfflineDemo: () => void;
  retrySync: () => void;
  queuePending: () => void;
  clearPending: (count?: number) => void;
};

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncedMinutesAgo, setLastSyncedMinutesAgo] = useState(2);

  const toggleOfflineDemo = useCallback(() => {
    setSyncState((s) => (s === 'offline' ? 'synced' : 'offline'));
  }, []);

  const retrySync = useCallback(() => {
    setSyncState('synced');
    setLastSyncedMinutesAgo(0);
    setPendingCount(0);
  }, []);

  const queuePending = useCallback(() => {
    setPendingCount((c) => c + 1);
    if (syncState === 'offline') return;
    setSyncState('offline');
  }, [syncState]);

  const clearPending = useCallback((count = 1) => {
    setPendingCount((c) => Math.max(0, c - count));
    setLastSyncedMinutesAgo(0);
    setSyncState('synced');
  }, []);

  const value = useMemo(
    () => ({
      syncState,
      pendingCount,
      lastSyncedMinutesAgo,
      toggleOfflineDemo,
      retrySync,
      queuePending,
      clearPending,
    }),
    [syncState, pendingCount, lastSyncedMinutesAgo, toggleOfflineDemo, retrySync, queuePending, clearPending],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within SyncProvider');
  return ctx;
}
