import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import CenteredView from '../components/CenteredView';
import { post } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Errors = {
  email?: string;
  password?: string;
};

type Props = {
  onSignUp?: () => void;
  onForgotPassword?: () => void;
};

const LoginScreen: React.FC<Props> = ({ onSignUp, onForgotPassword }) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);

  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (validateForm()) {
      setServerError(null);
      setLoading(true);
      post('/auth/login', { email, password })
        .then((res: any) => {
          // backend returns { success, message, data }
          const payload = res?.data ?? res;
          const user = payload?.user ?? payload;
          const tokens = {
            accessToken: payload?.accessToken || payload?.access_token,
            refreshToken: payload?.refreshToken || payload?.refresh_token,
          };
          auth.signIn(user, tokens);
          router.push('/home');
        })
        .catch((err: Error) => {
          setServerError(err.message || 'Login failed');
        })
        .finally(() => setLoading(false));
    }
  };

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
    } else {
      console.log('Navigate to sign up');
      // router.push('/signup');
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      console.log('Navigate to forgot password');
      // router.push('/forgot-password');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <CenteredView>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>TravelBuddy</Text>
              <Text style={styles.tagline}>Welcome Back</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                label="Email"
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
              />
              <TextInput
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                error={errors.password}
              />

              {/* Forgot Password Link */}
              <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}
              <Button
                title={loading ? 'Logging in...' : 'Login'}
                onPress={handleLogin}
                style={[
                  styles.loginButton,
                  loading && { opacity: 0.6 },
                ]}
              />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.line} />
              </View>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>By logging in, you agree to our</Text>
              <View style={styles.footerLinks}>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Terms of Service</Text>
                </TouchableOpacity>
                <Text style={styles.footerSeparator}> & </Text>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </CenteredView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40, paddingTop: 80 },
  container: { width: '100%', paddingHorizontal: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 28, fontWeight: '700', color: COLORS.orange, marginBottom: 8 },
  tagline: { fontSize: 18, fontWeight: '600', color: '#0A0A0A' },
  form: { width: '100%', marginBottom: 40 },
  forgotPasswordContainer: { alignItems: 'flex-end', marginBottom: 20 },
  forgotPasswordText: { fontSize: 14, color: COLORS.orange, fontWeight: '500' },
  loginButton: { marginTop: 8 },
  serverError: { color: '#b00020', textAlign: 'center', marginBottom: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: '#E6E6E6' },
  dividerText: { marginHorizontal: 12, color: '#999', fontSize: 14 },
  signUpContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signUpText: { fontSize: 14, color: '#666' },
  signUpLink: { fontSize: 14, color: COLORS.orange, fontWeight: '600' },
  footer: { alignItems: 'center', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E6E6E6' },
  footerText: { fontSize: 12, color: '#999', marginBottom: 6 },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerLink: { fontSize: 12, color: COLORS.orange, textDecorationLine: 'underline' },
  footerSeparator: { fontSize: 12, color: '#999', marginHorizontal: 4 },
});

export default LoginScreen;
