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
  pseudoToken?: string;
  isGuest?: boolean; // <-- NEW: marks a guest/anonymous session
} | string | null;

type AuthMode = 'offline' | 'online' | 'guest' | 'pending';

type AuthContextType = {
  user: User;
  tokens: Tokens;
  authMode: AuthMode;
  isOnline: boolean;
  isGuest: boolean; // <-- easy flag for UI
  signIn: (user: User, tokens?: Tokens) => Promise<void>;
  signInOnline: (user: User, tokens: Tokens) => Promise<void>;
  continueAsGuest: () => Promise<void>; // <-- NEW: replaces signInOffline
  signOut: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  isLoading: boolean;
  hasOfflineData: boolean;
  triggerSync: () => Promise<void>;
};

const GUEST_USER_EMAIL = 'guest@travelbuddy.local';
const GUEST_USER_KEY = 'guest_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [tokens, setTokens] = useState<Tokens>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [hasOfflineData, setHasOfflineData] = useState(false);

  const { isConnected: isOnline } = useNetworkState();

  const isGuest = authMode === 'guest';

  // Initialize Auth state on app launch and subscribe to Supabase events
  useEffect(() => {
    // 1. Initial Offline Check (restore cached session if available)
    initializeAuth();

    // 2. Subscribe to Supabase Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase Auth Event:', event);

      if (session) {
        // User logged in online
        const sbUser = session.user;

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
          user_id: publicUser?.user_id || 0,
          email: sbUser.email,
          full_name: publicUser?.full_name || sbUser.user_metadata?.full_name || '',
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          role: [publicUser?.role || 'user'],
          isGuest: false,
        };

        setUser(finalUser);
        setTokens({ accessToken: session.access_token, refreshToken: session.refresh_token });
        setAuthMode('online');

        await AsyncStorage.setItem('online_user', JSON.stringify(finalUser));
        const expiresAt = session.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined;
        const realTokenData = createRealTokenData(session.access_token, finalUser.user_id, finalUser, expiresAt);
        await storeToken(realTokenData);

        // Auto-sync any guest/offline data when user successfully authenticates
        if (hasOfflineData) {
          await triggerSync();
        }
      } else {
        // No Supabase session — check for cached real token (e.g. went offline)
        const storedToken = await getStoredToken();

        if (storedToken?.type === 'real' && !isOnline) {
          // Previously logged in online, now offline — allow access with cached user data
          const storedUser = await AsyncStorage.getItem('online_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setAuthMode('offline');
          } else {
            setAuthMode('pending');
          }
        } else if (storedToken?.type === 'guest') {
          // Restore a previous guest session
          const guestUser = await AsyncStorage.getItem(GUEST_USER_KEY);
          if (guestUser) {
            setUser(JSON.parse(guestUser));
            setAuthMode('guest');
            setHasOfflineData(true);
          } else {
            setAuthMode('pending');
          }
        } else {
          // No valid session of any kind
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
  }, [hasOfflineData, isOnline]);

  /**
   * Restores a prior session at app launch (before Supabase listener fires).
   * Priority: Online cached session > Guest session > nothing
   */
  const initializeAuth = async () => {
    try {
      const storedToken = await getStoredToken();

      if (!storedToken) {
        // No session ever stored — show login screen
        return;
      }

      if (storedToken.type === 'real' && !isOnline) {
        // Had a real login, now offline — restore from cache
        const storedUser = await AsyncStorage.getItem('online_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setAuthMode('offline');
        }
      } else if (storedToken.type === 'guest') {
        // Restore a guest session
        const guestUser = await AsyncStorage.getItem(GUEST_USER_KEY);
        if (guestUser) {
          setUser(JSON.parse(guestUser));
          setAuthMode('guest');
          setHasOfflineData(true);
        }
      }
      // If it's a 'real' token and we ARE online, Supabase listener handles it
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  };

  /**
   * NEW: Creates (or restores) a local Guest profile.
   * Does NOT require any credentials. Clearly a guest, not a real account.
   */
  const continueAsGuest = async () => {
    try {
      setIsLoading(true);

      // Check if a guest user already exists in SQLite
      let guestSQLiteUser = getUserByEmail(GUEST_USER_EMAIL);
      let guestUserId: number;

      if (guestSQLiteUser) {
        guestUserId = guestSQLiteUser.user_id!;
      } else {
        // First time: create the guest profile
        guestUserId = await createUser({
          firebase_uid: undefined,
          full_name: 'Guest',
          email: GUEST_USER_EMAIL,
          username: 'guest',
          role: 'guest',
          password_hash: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      const guestUserObj = {
        user_id: guestUserId,
        email: GUEST_USER_EMAIL,
        full_name: 'Guest',
        username: 'guest',
        role: 'guest',
        isGuest: true,
      };

      // Use a special 'guest' token type so we can identify and restore it
      const guestTokenData = {
        ...createPseudoTokenData({ email: GUEST_USER_EMAIL, full_name: 'Guest' }),
        type: 'guest' as const,
      };

      await AsyncStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUserObj));
      await storeToken(guestTokenData);

      setUser(guestUserObj);
      setAuthMode('guest');
      setHasOfflineData(true);

    } catch (error) {
      console.error('Error creating guest session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInOnline = async (user: User, tokens: Tokens) => {
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

  /**
   * signIn: Called after a successful online Supabase login.
   * For offline-only sessions, use `continueAsGuest()` instead.
   */
  const signIn = async (user: User, tokens?: Tokens) => {
    if (tokens?.accessToken) {
      await signInOnline(user, tokens);
    }
    // If no real tokens, do nothing — callers should use continueAsGuest()
  };

  const signOut = async () => {
    try {
      setIsLoading(true);

      if (authMode === 'online') {
        await supabase.auth.signOut();
      }

      // Clear all local session data
      await removeStoredToken();
      await AsyncStorage.multiRemove(['offline_user', 'online_user', GUEST_USER_KEY]);

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
    isGuest,
    signIn,
    signInOnline,
    continueAsGuest,
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
