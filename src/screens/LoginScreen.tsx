import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useNetworkState } from '../utils/networkUtils';
import { loginUserOffline } from '../services/userService';
import { post } from '../services/api';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import { COLORS } from '../constants';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Try online login first
      const res = await post('/auth/login', { email, password });
      const payload = res?.data ?? res;
      const user = payload?.user ?? payload;
      const tokens = {
        accessToken: payload?.accessToken || payload?.access_token,
        refreshToken: payload?.refreshToken || payload?.refresh_token,
      };
      await signIn(user, tokens);
      router.replace('/home');
    } catch (err: any) {
      console.log('Online login failed, trying offline:', err.message);
      try {
        // Try offline login
        const user = await loginUserOffline(email, password);
        await signIn(user);
        router.replace('/home');
      } catch (offlineErr: any) {
        Alert.alert('Login Failed', offlineErr.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineLogin = () => {
    router.push('/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title={loading ? 'Logging in...' : 'Login'}
            onPress={handleLogin}
            style={loading ? [styles.loginButton, { opacity: 0.6 }] : styles.loginButton}
          />

          <Button
            title="Continue Offline"
            onPress={handleOfflineLogin}
            variant="outline"
            style={styles.offlineButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0A0A0A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: COLORS.orange,
  },
  offlineButton: {
    marginTop: 12,
  },
});

export default LoginScreen;
