import db from '../database/database';
import * as Crypto from 'expo-crypto';

export interface User {
  user_id?: number;
  firebase_uid?: string;
  full_name: string;
  email: string;
  role: string;
  password_hash?: string;
  created_at?: string;
  updated_at?: string;
}

export const createUser = (user: User): Promise<number> => {
  try {
    const result = db.runSync(
      `INSERT INTO users (firebase_uid, full_name, email, role, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user.firebase_uid, user.full_name, user.email, user.role, user.password_hash, user.created_at, user.updated_at]
    );
    return Promise.resolve(result.lastInsertRowId);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getUserById = (userId: number): User | null => {
  const result = db.getFirstSync<User>(
    `SELECT * FROM users WHERE user_id = ?`,
    [userId]
  );
  return result || null;
};

export const getUserByEmail = (email: string): User | null => {
  const result = db.getFirstSync<User>(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  );
  return result || null;
};

export const updateUser = (userId: number, user: Partial<User>): Promise<void> => {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    if (user.full_name) { fields.push('full_name = ?'); values.push(user.full_name); }
    if (user.email) { fields.push('email = ?'); values.push(user.email); }
    if (user.role) { fields.push('role = ?'); values.push(user.role); }
    if (user.password_hash) { fields.push('password_hash = ?'); values.push(user.password_hash); }
    if (user.updated_at) { fields.push('updated_at = ?'); values.push(user.updated_at); }
    values.push(userId);

    db.runSync(
      `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`,
      values
    );
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteUser = (userId: number): void => {
  db.runSync(
    `DELETE FROM users WHERE user_id = ?`,
    [userId]
  );
};

export const loginUserOffline = async (email: string, password: string): Promise<User> => {
  const user = getUserByEmail(email);
  if (!user || !user.password_hash) {
    throw new Error('Invalid email or password');
  }

  // Hash the input password and compare with stored hash
  const inputHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );

  if (inputHash !== user.password_hash) {
    throw new Error('Invalid email or password');
  }

  return { ...user, role: user.role };
};

export const createUserOffline = async (userData: { full_name: string; email: string; password: string; role: string }): Promise<number> => {
  // Check if user already exists
  const existingUser = getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Ensure password is a string
  if (typeof userData.password !== 'string') {
    throw new Error('Password must be a string');
  }

  // Hash the password using expo-crypto for React Native compatibility
  const passwordHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    userData.password
  );

  // Create user object
  const user: User = {
    full_name: userData.full_name,
    email: userData.email,
    role: userData.role || 'user',
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Insert into database
  return createUser(user);
};
