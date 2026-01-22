import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useNetworkState } from '../utils/networkUtils';

type SyncState = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

type Props = {
  compact?: boolean;
  showTrigger?: boolean;
};

const SyncStatus: React.FC<Props> = ({ compact = false, showTrigger = true }) => {
  const { authMode, isOnline, hasOfflineData, triggerSync } = useAuth();
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncProgress, setSyncProgress] = useState<string>('');

  // Determine current sync state
  useEffect(() => {
    if (!isOnline) {
      setSyncState('offline');
    } else if (authMode === 'offline' && hasOfflineData) {
      setSyncState('idle'); // Ready to sync
    } else if (authMode === 'online' && !hasOfflineData) {
      setSyncState('success'); // Synced
    } else {
      setSyncState('idle');
    }
  }, [isOnline, authMode, hasOfflineData]);

  const handleManualSync = async () => {
    if (syncState === 'syncing' || !isOnline) return;

    setSyncState('syncing');
    setSyncProgress('Starting sync...');

    try {
      await triggerSync();
      setSyncState('success');
      setLastSyncTime(new Date());
      setSyncProgress('Sync completed');
    } catch (error) {
      setSyncState('error');
      setSyncProgress('Sync failed');
    }
  };

  const getStatusConfig = () => {
    switch (syncState) {
      case 'offline':
        return {
          icon: '📶',
          label: 'Offline',
          color: '#666',
          backgroundColor: '#F5F5F5',
          showTrigger: false,
        };
      case 'syncing':
        return {
          icon: '⏳',
          label: syncProgress || 'Syncing...',
          color: COLORS.orange,
          backgroundColor: '#FFF8E1',
          showTrigger: false,
        };
      case 'success':
        return {
          icon: '✅',
          label: lastSyncTime ? `Synced ${getTimeAgo(lastSyncTime)}` : 'Synced',
          color: '#18A66B',
          backgroundColor: '#F0F9F4',
          showTrigger: hasOfflineData,
        };
      case 'error':
        return {
          icon: '❌',
          label: 'Sync failed',
          color: '#B00020',
          backgroundColor: '#FFEBEE',
          showTrigger: true,
        };
      default: // idle
        return {
          icon: hasOfflineData ? '🔄' : '✅',
          label: hasOfflineData ? 'Ready to sync' : 'Up to date',
          color: hasOfflineData ? COLORS.orange : '#18A66B',
          backgroundColor: hasOfflineData ? '#FFF8E1' : '#F0F9F4',
          showTrigger: hasOfflineData,
        };
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const config = getStatusConfig();

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { backgroundColor: config.backgroundColor }]}
        onPress={config.showTrigger && showTrigger ? handleManualSync : undefined}
        disabled={!config.showTrigger || !showTrigger}
      >
        <Text style={[styles.compactIcon, { color: config.color }]}>
          {syncState === 'syncing' ? <ActivityIndicator size="small" color={config.color} /> : config.icon}
        </Text>
        <Text style={[styles.compactLabel, { color: config.color }]}>
          {config.label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      <View style={styles.iconContainer}>
        {syncState === 'syncing' ? (
          <ActivityIndicator size="small" color={config.color} />
        ) : (
          <Text style={[styles.icon, { color: config.color }]}>{config.icon}</Text>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
        {hasOfflineData && syncState !== 'syncing' && (
          <Text style={styles.subLabel}>
            {authMode === 'offline' ? 'Local changes pending' : 'Data to sync'}
          </Text>
        )}
      </View>
      {config.showTrigger && showTrigger && (
        <TouchableOpacity
          style={[styles.triggerButton, { borderColor: config.color }]}
          onPress={handleManualSync}
          disabled={syncState === 'syncing'}
        >
          <Text style={[styles.triggerText, { color: config.color }]}>
            {syncState === 'error' ? 'Retry' : 'Sync'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F0F9F4',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 10,
  },
  iconContainer: { marginRight: 10 },
  icon: { fontSize: 16 },
  compactIcon: { fontSize: 14, marginRight: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#18A66B' },
  compactLabel: { fontSize: 12, fontWeight: '500' },
  textContainer: { flex: 1 },
  subLabel: { fontSize: 11, color: '#666', marginTop: 2 },
  triggerButton: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 10,
  },
  triggerText: { fontSize: 12, fontWeight: '600' },
});

export default SyncStatus;
