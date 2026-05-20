import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert,
  Image,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { createUserOffline } from '../services/local/userService';
import { supabase } from '../config/supabaseClient';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Errors = {
  fullName?: string;
  username?: string;
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
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      newErrors.username = 'Only alphanumeric characters and underscores allowed';
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
    return Object.keys(newErrors).length === 0;
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

      const cleanUsername = username.trim().toLowerCase();

      try {
        // 1. Try online registration via Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              username: cleanUsername,
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          const sbUser = data.user!;
          
          const onlineUser = {
            id: sbUser.id,
            user_id: 0, 
            email: sbUser.email,
            full_name: fullName,
            username: cleanUsername,
            role: ['user'],
          };

          const tokens = {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
          };

          await auth.signIn(onlineUser, tokens);
          router.replace('/home');
        } else {
          Alert.alert(
            'Verification Required',
            'Please check your email address to complete registration!'
          );
          handleLogin();
        }
      } catch (err: any) {
        console.log('Online registration failed, trying offline:', err.message);
        try {
          // 2. Try offline registration via local SQLite
          await createUserOffline({
            full_name: fullName,
            email,
            username: cleanUsername,
            password,
            role: 'user',
          });

          await auth.signInOffline({ email, full_name: fullName, username: cleanUsername });
          router.replace('/home');
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

  const renderPasswordToggle = (visible: boolean, setVisible: (v: boolean) => void) => (
    <TouchableOpacity onPress={() => setVisible(!visible)} activeOpacity={0.7} style={styles.eyeBtn}>
      <Ionicons 
        name={visible ? "eye" : "eye-off"} 
        size={20} 
        color="#64748B" 
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Full screen background image */}
      <Image 
        source={require('../assets/images/image 7.jpg')} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      />
      
      {/* Absolute overlay gradient fading seamlessly */}
      <LinearGradient
        colors={[
          '#ffffff', 
          '#ffffff', 
          'rgba(255, 255, 255, 0.95)', 
          'rgba(255, 255, 255, 0.6)', 
          'transparent'
        ]}
        locations={[0, 0.25, 0.35, 0.5, 0.72]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scroll} 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
        >
          {/* Spacer to push content down */}
          <View style={styles.topSpacer} />

          {/* Main transparent content overlay card */}
          <View style={styles.contentCard}>
            <View style={styles.logoContainer}>
              <Ionicons name="compass" size={32} color="#ffffff" />
            </View>
            <Text style={styles.logo}>TravelBuddy</Text>
            <Text style={styles.tagline}>Create your wanderer account</Text>

            <View style={styles.loginPromptRow}>
              <Text style={styles.promptText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
                <Text style={styles.promptLink}>Log in</Text>
              </TouchableOpacity>
            </View>

            {/* Registration Form */}
            <View style={styles.form}>
              {/* Row 1: Full Name & Username */}
              <View style={styles.inputRow}>
                <TextInput
                  label="Full Name"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChangeText={setFullName}
                  error={errors.fullName}
                  leftIcon="person-outline"
                  containerStyle={styles.halfInputLeft}
                />
                <TextInput
                  label="Username"
                  placeholder="wanderer_123"
                  value={username}
                  onChangeText={setUsername}
                  error={errors.username}
                  autoCapitalize="none"
                  leftIcon="at-outline"
                  containerStyle={styles.halfInputRight}
                />
              </View>

              {/* Row 2: Email Address */}
              <TextInput
                label="Email Address"
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
              />

              {/* Row 3: Password & Confirm Password */}
              
                <TextInput
                  label="Password"
                  placeholder="Min. 8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  error={errors.password}
                  leftIcon="lock-closed-outline"
                  rightIcon={renderPasswordToggle(showPassword, setShowPassword)}
                  
                />
                <TextInput
                  label="Confirm Password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  error={errors.confirmPassword}
                  leftIcon="lock-closed-outline"
                  rightIcon={renderPasswordToggle(showConfirmPassword, setShowConfirmPassword)}
                />
              

              {/* Terms Agreement */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                  {agreedToTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
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
                disabled={loading}
                style={styles.signUpButton}
              />
            </View>
          </View>

          {/* Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  scroll: { 
    flexGrow: 1,
  },
  topSpacer: {
    height: 50,
  },
  contentCard: {
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  logoContainer: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FF5A36',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...SHADOWS.light,
  },
  logo: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#1E293B', 
    marginBottom: 6, 
    letterSpacing: -0.5,
  },
  tagline: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#64748B',
    marginBottom: 10,
  },
  loginPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  promptText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  promptLink: {
    fontSize: 14,
    color: '#FF5A36',
    fontWeight: '800',
  },
  form: { 
    width: '100%', 
  },
  eyeBtn: {
    padding: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingRight: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 7,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  checkboxChecked: {
    backgroundColor: '#FF5A36',
    borderColor: '#FF5A36',
  },
  termsText: { 
    fontSize: 12, 
    color: '#64748B', 
    flex: 1, 
    lineHeight: 18,
    fontWeight: '600',
  },
  termsLink: { 
    color: '#FF5A36', 
    fontWeight: '800',
  },
  signUpButton: { 
    marginTop: 8,
    backgroundColor: '#FF5A36',
    height: 52,
    borderRadius: 10,
    shadowColor: '#FF5A36',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  serverError: { 
    color: COLORS.redAlert, 
    textAlign: 'center', 
    marginBottom: 10, 
    fontWeight: '700', 
    fontSize: 12,
  },
  bottomSpacer: {
    height: 60,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfInputLeft: {
    width: '48%',
  },
  halfInputRight: {
    width: '48%',
  },
});

export default SignUpScreen;
