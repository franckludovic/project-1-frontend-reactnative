import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generatePseudoToken, storeToken, getStoredToken, removeStoredToken, createPseudoTokenData, createRealTokenData } from '../utils/tokenUtils';
import { useNetworkState } from '../utils/networkUtils';
import { runSync } from '../services/local/SynchManager';
import { createUser, getUserByEmail } from '../services/local/userService';
import { supabase } from '../config/supabaseClient';

type Tokens = { accessToken?: string; refreshToken?: string } | null;
type User = {
  id?: string;
  user_id?: number;
  email?: string;
  full_name?: string;
  username?: string;
  accessToken?: string;
  refreshToken?: string;
  role?: string | string[];
  pseudoToken?: string; // For offline mode
} | string | null;

type AuthMode = 'offline' | 'online' | 'pending';

type AuthContextType = {
  user: User;
  tokens: Tokens;
  authMode: AuthMode;
  isOnline: boolean;
  signIn: (user: User, tokens?: Tokens) => Promise<void>;
  signInOffline: (userData: { email: string; full_name?: string; username?: string }) => Promise<void>;
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

  // Initialize Auth state on app launch and subscribe to Supabase events
  useEffect(() => {
    // 1. Initial Offline Check
    initializeOfflineAuth();

    // 2. Subscribe to Supabase Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase Auth Event:', event);

      if (session) {
        // User logged in online
        const sbUser = session.user;

        // Fetch user metadata from our public.users table to get their user_id
        let publicUser: any = null;
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('firebase_uid', sbUser.id)
            .maybeSingle();

          if (userData) {
            publicUser = userData;
          } else {
            // Fallback to checking by email
            const { data: userDataByEmail } = await supabase
              .from('users')
              .select('*')
              .eq('email', sbUser.email)
              .maybeSingle();
            publicUser = userDataByEmail;
          }
        } catch (dbErr) {
          console.error('Error fetching public user profiles:', dbErr);
        }

        const finalUser = {
          id: sbUser.id,
          user_id: publicUser?.user_id || 0, // Maps to our sequential user_id
          email: sbUser.email,
          full_name: publicUser?.full_name || sbUser.user_metadata?.full_name || '',
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          role: [publicUser?.role || 'user'],
        };

        setUser(finalUser);
        setTokens({ accessToken: session.access_token, refreshToken: session.refresh_token });
        setAuthMode('online');

        // Store online user for persistence
        await AsyncStorage.setItem('online_user', JSON.stringify(finalUser));
        const realTokenData = createRealTokenData(session.access_token, finalUser.user_id, finalUser);
        await storeToken(realTokenData);

        // If there was any offline data accumulated, sync it now!
        if (hasOfflineData) {
          await triggerSync();
        }
      } else {
        // No session - check if we are in offline pseudo token mode
        const storedToken = await getStoredToken();
        if (storedToken && storedToken.type === 'pseudo') {
          // Keep offline state
        } else {
          // Clear everything
          setUser(null);
          setTokens(null);
          setAuthMode('pending');
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [hasOfflineData]);

  const initializeOfflineAuth = async () => {
    try {
      const storedToken = await getStoredToken();

      if (storedToken && storedToken.type === 'pseudo') {
        // Offline mode - restore pseudo-token user
        const storedUser = await AsyncStorage.getItem('offline_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setAuthMode('offline');
          setHasOfflineData(true);
        }
      }
    } catch (error) {
      console.error('Error initializing offline auth:', error);
    }
  };

  const signInOffline = async (userData: { email: string; full_name?: string; username?: string }) => {
    try {
      setIsLoading(true);

      // Check if user already exists in SQLite
      const existingUser = getUserByEmail(userData.email);
      let userId: number;

      if (existingUser) {
        userId = existingUser.user_id!;
      } else {
        // Create user in database for offline mode
        const userToCreate = {
          firebase_uid: undefined,
          full_name: userData.full_name || '',
          email: userData.email,
          username: userData.username || '',
          role: 'user',
          password_hash: undefined,
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
    // Rely on Supabase session listener to automatically pick up the login!
    // But we still persist it locally
    try {
      setIsLoading(true);
      await AsyncStorage.setItem('online_user', JSON.stringify(user));
      setUser(user);
      setTokens(tokens);
      setAuthMode('online');
    } catch (error) {
      console.error('Error in signInOnline helper:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (user: User, tokens?: Tokens) => {
    const hasRealToken = tokens?.accessToken && tokens.accessToken.length > 64; // Pseudo tokens are 64 chars

    if (hasRealToken) {
      await signInOnline(user, tokens);
    } else {
      await signInOffline({
        email: typeof user === 'object' && user?.email ? user.email : '',
        full_name: typeof user === 'object' && user?.full_name ? user.full_name : undefined,
        username: typeof user === 'object' && user?.username ? user.username : undefined
      });
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);

      // 1. Sign out of Supabase Auth
      if (authMode === 'online') {
        await supabase.auth.signOut();
      }

      // 2. Clear all local session storage
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

      console.log('Starting data synchronization to Supabase...');
      await runSync();
      setHasOfflineData(false);
      console.log('Sync completed successfully');

    } catch (error) {
      console.error('Error during sync:', error);
      throw error;
    }
  };

  const refreshToken = async () => {
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

