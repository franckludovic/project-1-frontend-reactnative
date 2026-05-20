import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

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

  useEffect(() => {
    if (!isOnline) {
      setSyncState('offline');
    } else if (authMode === 'offline' && hasOfflineData) {
      setSyncState('idle'); 
    } else if (authMode === 'online' && !hasOfflineData) {
      setSyncState('success'); 
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
          icon: 'cloud-offline',
          label: 'Offline Mode',
          color: COLORS.textMuted,
          backgroundColor: '#F1F5F9', // gray-100
          borderColor: 'rgba(148, 163, 184, 0.1)',
          showTrigger: false,
        };
      case 'syncing':
        return {
          icon: 'sync',
          label: syncProgress || 'Syncing data...',
          color: COLORS.primary,
          backgroundColor: COLORS.primaryLight,
          borderColor: 'rgba(255, 90, 54, 0.1)',
          showTrigger: false,
        };
      case 'success':
        return {
          icon: 'checkmark-circle',
          label: lastSyncTime ? `Synced ${getTimeAgo(lastSyncTime)}` : 'Cloud Synced',
          color: COLORS.emeraldGreen,
          backgroundColor: COLORS.emeraldLight,
          borderColor: 'rgba(16, 185, 129, 0.1)',
          showTrigger: hasOfflineData,
        };
      case 'error':
        return {
          icon: 'alert-circle',
          label: 'Sync failed',
          color: COLORS.redAlert,
          backgroundColor: COLORS.redLight,
          borderColor: 'rgba(239, 68, 68, 0.1)',
          showTrigger: true,
        };
      default: 
        return {
          icon: hasOfflineData ? 'sync' : 'checkmark-circle',
          label: hasOfflineData ? 'Ready to sync' : 'Up to date',
          color: hasOfflineData ? COLORS.primary : COLORS.emeraldGreen,
          backgroundColor: hasOfflineData ? COLORS.primaryLight : COLORS.emeraldLight,
          borderColor: hasOfflineData ? 'rgba(255, 90, 54, 0.1)' : 'rgba(16, 185, 129, 0.1)',
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
        style={[styles.compactContainer, { backgroundColor: config.backgroundColor, borderColor: config.borderColor }]}
        onPress={config.showTrigger && showTrigger ? handleManualSync : undefined}
        disabled={!config.showTrigger || !showTrigger}
        activeOpacity={0.8}
      >
        <View style={styles.compactIconContainer}>
          {syncState === 'syncing' ? (
            <ActivityIndicator size="small" color={config.color} />
          ) : (
            <Ionicons name={config.icon as any} size={14} color={config.color} />
          )}
        </View>
        <Text style={[styles.compactLabel, { color: config.color }]}>
          {config.label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor, borderColor: config.borderColor }]}>
      <View style={styles.leftSection}>
        <View style={[styles.iconFrame, { backgroundColor: 'rgba(255, 255, 255, 0.7)' }]}>
          {syncState === 'syncing' ? (
            <ActivityIndicator size="small" color={config.color} />
          ) : (
            <Ionicons name={config.icon as any} size={18} color={config.color} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
          {hasOfflineData && syncState !== 'syncing' && (
            <Text style={styles.subLabel}>
              {authMode === 'offline' ? 'Local changes pending' : 'Changes ready to sync'}
            </Text>
          )}
        </View>
      </View>
      {config.showTrigger && showTrigger && (
        <TouchableOpacity
          style={[styles.triggerButton, { backgroundColor: config.color }]}
          onPress={handleManualSync}
          disabled={syncState === 'syncing'}
          activeOpacity={0.85}
        >
          <Text style={styles.triggerText}>
            {syncState === 'error' ? 'Retry' : 'Sync Now'}
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 24,
    marginBottom: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 10,
  },
  iconFrame: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  compactIconContainer: { 
    marginRight: 6 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  compactLabel: { 
    fontSize: 11, 
    fontWeight: '700' 
  },
  textContainer: { 
    flex: 1 
  },
  subLabel: { 
    fontSize: 11, 
    color: COLORS.textMuted, 
    marginTop: 2,
    fontWeight: '500',
  },
  triggerButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  triggerText: { 
    fontSize: 12, 
    fontWeight: '800',
    color: '#fff',
  },
});

export default SyncStatus;
