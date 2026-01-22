import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generatePseudoToken, storeToken, getStoredToken, removeStoredToken, createPseudoTokenData, createRealTokenData } from '../utils/tokenUtils';
import { useNetworkState } from '../utils/networkUtils';
import { runSync } from '../services/SynchManager';
import { createUser, getUserByEmail } from '../services/userService';

type Tokens = { accessToken?: string; refreshToken?: string } | null;
type User = {
  id?: string;
  user_id?: number;
  email?: string;
  full_name?: string;
  accessToken?: string;
  refreshToken?: string;
  role?: string[];
  pseudoToken?: string; // For offline mode
} | string | null;

type AuthMode = 'offline' | 'online' | 'pending';

type AuthContextType = {
  user: User;
  tokens: Tokens;
  authMode: AuthMode;
  isOnline: boolean;
  signIn: (user: User, tokens?: Tokens) => Promise<void>;
  signInOffline: (userData: { email: string; full_name?: string }) => Promise<void>;
  signInOnline: (user: User, tokens: Tokens) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  isLoading: boolean;
  hasOfflineData: boolean;
  triggerSync: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [tokens, setTokens] = useState<Tokens>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [hasOfflineData, setHasOfflineData] = useState(false);

  const { isConnected: isOnline } = useNetworkState();

  // Initialize auth state on app launch
  useEffect(() => {
    initializeAuth();
  }, []);

  // Handle network changes
  useEffect(() => {
    if (isOnline && authMode === 'offline' && hasOfflineData) {
      // Came online with offline data - prompt for sync
      console.log('Network restored - offline data available for sync');
    }
  }, [isOnline, authMode, hasOfflineData]);

  const initializeAuth = async () => {
    try {
      const storedToken = await getStoredToken();

      if (storedToken) {
        if (storedToken.type === 'pseudo') {
          // Offline mode - restore pseudo-token user
          const storedUser = await AsyncStorage.getItem('offline_user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setAuthMode('offline');
            setHasOfflineData(true);
          }
        } else {
          // Online mode - restore real token
          const storedUser = await AsyncStorage.getItem('online_user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setTokens({ accessToken: storedToken.token });
            setAuthMode('online');
          }
        }
      } else {
        setAuthMode('pending');
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setAuthMode('pending');
    } finally {
      setIsLoading(false);
    }
  };

  const signInOffline = async (userData: { email: string; full_name?: string }) => {
    try {
      setIsLoading(true);

      // Check if user already exists
      const existingUser = getUserByEmail(userData.email);
      let userId: number;

      if (existingUser) {
        userId = existingUser.user_id!;
      } else {
        // Create user in database for offline mode
        const userToCreate = {
          firebase_uid: undefined, // No firebase_uid in offline mode
          full_name: userData.full_name || '',
          email: userData.email,
          role: 'user',
          password_hash: undefined, // No password in offline mode
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        userId = await createUser(userToCreate);
      }

      // Create pseudo-token data
      const pseudoTokenData = createPseudoTokenData(userData);

      // Create offline user object with autoincremented user_id
      const offlineUser = {
        ...userData,
        pseudoToken: pseudoTokenData.token,
        user_id: userId,
      };

      // Store offline user data
      await AsyncStorage.setItem('offline_user', JSON.stringify(offlineUser));
      await storeToken(pseudoTokenData);

      setUser(offlineUser);
      setAuthMode('offline');
      setHasOfflineData(true);

    } catch (error) {
      console.error('Error signing in offline:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInOnline = async (user: User, tokens: Tokens) => {
    try {
      setIsLoading(true);

      // Store online user data
      await AsyncStorage.setItem('online_user', JSON.stringify(user));
      if (tokens?.accessToken) {
        // Create real token data structure
        const realTokenData = createRealTokenData(
          tokens.accessToken,
          typeof user === 'object' && user?.user_id ? user.user_id : 0,
          user,
          tokens.refreshToken ? undefined : undefined // TODO: Add expiry logic
        );
        await storeToken(realTokenData);
      }

      setUser(user);
      setTokens(tokens);
      setAuthMode('online');

      // Check if we need to sync offline data
      if (hasOfflineData) {
        await triggerSync();
      }

    } catch (error) {
      console.error('Error signing in online:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (user: User, tokens?: Tokens) => {
    // Check if we have a real token (not pseudo)
    const hasRealToken = tokens?.accessToken && tokens.accessToken.length > 64; // Pseudo tokens are 64 chars

    if (hasRealToken) {
      await signInOnline(user, tokens);
    } else {
      // Fallback to offline mode
      await signInOffline({
        email: typeof user === 'object' && user?.email ? user.email : '',
        full_name: typeof user === 'object' && user?.full_name ? user.full_name : undefined
      });
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);

      // Clear all stored data
      await removeStoredToken();
      await AsyncStorage.multiRemove(['offline_user', 'online_user']);

      setUser(null);
      setTokens(null);
      setAuthMode('pending');
      setHasOfflineData(false);

    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSync = async () => {
    try {
      if (!isOnline || authMode !== 'online') {
        console.log('Cannot sync: not online or not authenticated');
        return;
      }

      console.log('Starting data synchronization...');
      await runSync();
      setHasOfflineData(false);
      console.log('Sync completed successfully');

    } catch (error) {
      console.error('Error during sync:', error);
      throw error;
    }
  };

  const refreshToken = async () => {
    // TODO: Implement token refresh logic
    return false;
  };

  const value: AuthContextType = {
    user,
    tokens,
    authMode,
    isOnline,
    signIn,
    signInOffline,
    signInOnline,
    signOut,
    refreshToken,
    isLoading,
    hasOfflineData,
    triggerSync,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
