import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import CenteredView from '../components/CenteredView';
import { post } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNetworkState } from '../utils/networkUtils';
import { createUserOffline } from '../services/userService';

type Errors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type Props = {
  onLogin?: () => void;
};

const SignUpScreen: React.FC<Props> = ({ onLogin }) => {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const auth = useAuth();
  const { isConnected } = useNetworkState();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && agreedToTerms;
  };

  const handleSignUp = async () => {
    if (loading) return;
    if (!agreedToTerms) {
      setServerError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (validateForm()) {
      setServerError(null);
      setLoading(true);

      try {
        // Try online registration first
        const res = await post('/auth/register', { full_name: fullName, email, password, role: 'user' });
        const payload = res?.data ?? res;
        const user = payload?.user ?? payload;
        const tokens = {
          accessToken: payload?.accessToken || payload?.access_token,
          refreshToken: payload?.refreshToken || payload?.refresh_token,
        };
        auth.signIn(user, tokens);
        router.push('/home');
      } catch (err: any) {
        // If online fails, try offline registration
        console.log('Online registration failed, trying offline:', err.message);
        try {
          await createUserOffline({ full_name: fullName, email, password, role: 'user' });
          await auth.signInOffline({ email, full_name: fullName });
          router.push('/home');
        } catch (offlineErr: any) {
          setServerError(offlineErr.message || 'Registration failed');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      router.back();
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
              <Text style={styles.tagline}>Create Your Account</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                label="Full Name"
                placeholder="Lichtteinvigh"
                value={fullName}
                onChangeText={setFullName}
                error={errors.fullName}
              />
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
                secureTextEntry
                error={errors.password}
              />
              <TextInput
                label="Confirm Password"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                error={errors.confirmPassword}
              />

              {/* Terms Agreement */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
              >
                <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                  {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Sign Up Button */}
              {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}
              <Button
                title={loading ? 'Creating...' : 'Create Account'}
                onPress={handleSignUp}
                style={[
                  styles.signUpButton,
                  (loading || !agreedToTerms) && { opacity: 0.6 },
                ]}
              />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.line} />
              </View>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={handleLogin}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                We'll help you capture and sync your travel memories.
              </Text>
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingRight: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E6E6E6',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  termsText: { fontSize: 13, color: '#666', flex: 1, lineHeight: 18 },
  termsLink: { color: COLORS.orange, fontWeight: '600', textDecorationLine: 'underline' },
  signUpButton: { marginTop: 8 },
  serverError: { color: '#b00020', textAlign: 'center', marginBottom: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: '#E6E6E6' },
  dividerText: { marginHorizontal: 12, color: '#999', fontSize: 14 },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 14, color: '#666' },
  loginLink: { fontSize: 14, color: COLORS.orange, fontWeight: '600' },
  footer: { alignItems: 'center', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E6E6E6' },
  footerText: { fontSize: 12, color: '#999', textAlign: 'center' },
});

export default SignUpScreen;
