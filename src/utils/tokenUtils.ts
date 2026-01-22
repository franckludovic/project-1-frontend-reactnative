import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Token types
export type TokenType = 'pseudo' | 'real';

// Token data structure
export interface TokenData {
  token: string;
  type: TokenType;
  userId?: number;
  userData?: any;
  createdAt: string;
  expiresAt?: string;
}

// Generate a pseudo-token for offline authentication
export const generatePseudoToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Secure storage keys
const TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

// Store token securely
export const storeToken = async (tokenData: TokenData): Promise<void> => {
  try {
    const tokenString = JSON.stringify(tokenData);
    await SecureStore.setItemAsync(TOKEN_KEY, tokenString);
  } catch (error) {
    console.error('Failed to store token:', error);
    throw error;
  }
};

// Retrieve token from secure storage
export const getStoredToken = async (): Promise<TokenData | null> => {
  try {
    const tokenString = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!tokenString) return null;

    const tokenData: TokenData = JSON.parse(tokenString);

    // Check if real token is expired
    if (tokenData.type === 'real' && tokenData.expiresAt) {
      const now = new Date();
      const expiry = new Date(tokenData.expiresAt);
      if (now > expiry) {
        // Token expired, remove it
        await removeStoredToken();
        return null;
      }
    }

    return tokenData;
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
};

// Remove stored token
export const removeStoredToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};

// Store user data separately for offline access
export const storeUserData = async (userData: any): Promise<void> => {
  try {
    const userString = JSON.stringify(userData);
    await SecureStore.setItemAsync(USER_DATA_KEY, userString);
  } catch (error) {
    console.error('Failed to store user data:', error);
    throw error;
  }
};

// Retrieve user data
export const getStoredUserData = async (): Promise<any | null> => {
  try {
    const userString = await SecureStore.getItemAsync(USER_DATA_KEY);
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('Failed to retrieve user data:', error);
    return null;
  }
};

// Check if user is authenticated (has any valid token)
export const isAuthenticated = async (): Promise<boolean> => {
  const tokenData = await getStoredToken();
  return tokenData !== null;
};

// Check if user has real online authentication
export const hasRealToken = async (): Promise<boolean> => {
  const tokenData = await getStoredToken();
  return tokenData?.type === 'real';
};

// Get current token (for API calls)
export const getCurrentToken = async (): Promise<string | null> => {
  const tokenData = await getStoredToken();
  return tokenData?.token || null;
};

// Get current user ID
export const getCurrentUserId = async (): Promise<number | null> => {
  const tokenData = await getStoredToken();
  return tokenData?.userId || null;
};

// Create pseudo token data
export const createPseudoTokenData = (userData?: any): TokenData => {
  return {
    token: generatePseudoToken(),
    type: 'pseudo',
    userData,
    createdAt: new Date().toISOString(),
  };
};

// Create real token data
export const createRealTokenData = (
  token: string,
  userId: number,
  userData: any,
  expiresAt?: string
): TokenData => {
  return {
    token,
    type: 'real',
    userId,
    userData,
    createdAt: new Date().toISOString(),
    expiresAt,
  };
};
