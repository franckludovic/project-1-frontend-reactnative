import React, { createContext, useState, useContext } from 'react';

type Tokens = { accessToken?: string; refreshToken?: string } | null;
type User = { id?: string; user_id?: number; email?: string; full_name?: string; accessToken?: string; refreshToken?: string; role?: string[] } | string | null;

type AuthContextType = {
  user: User;
  tokens: Tokens;
  signIn: (user: User, tokens?: Tokens) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [tokens, setTokens] = useState<Tokens>(null);

  const signIn = (u: User, t?: Tokens) => {
    setUser(u);
    if (t) setTokens(t);
  };

  const signOut = () => {
    setUser(null);
    setTokens(null);
  };

  return <AuthContext.Provider value={{ user, tokens, signIn, signOut }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
