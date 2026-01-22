// TESTING FLAG: Set to true to force offline mode for testing
const FORCE_OFFLINE_FOR_TESTING = true;

import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

// Network state interface
export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isOnline: boolean; // Combined check for internet connectivity
}

// Network status hook
export const useNetworkState = (): NetworkState => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: false,
    isInternetReachable: null,
    type: 'unknown',
    isOnline: false,
  });

  useEffect(() => {
    // Get initial network state
    const unsubscribe = NetInfo.addEventListener(state => {
      // TESTING: Force offline mode if flag is set
      const actualIsOnline = state.isConnected && state.isInternetReachable !== false;
      const isOnline = FORCE_OFFLINE_FOR_TESTING ? false : actualIsOnline;

      setNetworkState({
        isConnected: FORCE_OFFLINE_FOR_TESTING ? false : state.isConnected,
        isInternetReachable: FORCE_OFFLINE_FOR_TESTING ? false : state.isInternetReachable,
        type: state.type,
        isOnline,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkState;
};

// Check if device has internet connectivity
export const checkInternetConnectivity = async (): Promise<boolean> => {
  // TESTING: Force offline mode if flag is set
  if (FORCE_OFFLINE_FOR_TESTING) {
    return false;
  }

  try {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable !== false;
  } catch (error) {
    console.error('Error checking internet connectivity:', error);
    return false;
  }
};

// Network status change listener
export const addNetworkListener = (callback: (state: NetworkState) => void) => {
  return NetInfo.addEventListener(state => {
    const networkState: NetworkState = {
      isConnected: FORCE_OFFLINE_FOR_TESTING ? false : state.isConnected,
      isInternetReachable: FORCE_OFFLINE_FOR_TESTING ? false : state.isInternetReachable,
      type: state.type,
      isOnline: FORCE_OFFLINE_FOR_TESTING ? false : (state.isConnected && state.isInternetReachable !== false),
    };
    callback(networkState);
  });
};

// Simple connectivity check (for sync operations)
export const isOnline = async (): Promise<boolean> => {
  // TESTING: Force offline mode if flag is set
  if (FORCE_OFFLINE_FOR_TESTING) {
    return false;
  }

  return await checkInternetConnectivity();
};
