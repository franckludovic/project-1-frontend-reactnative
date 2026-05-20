import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Alert, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { supabase } from '../config/supabaseClient';
import { loginUserOffline } from '../services/local/userService';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      let resolvedEmail = identifier.trim();

      // 1. If identifier doesn't look like an email, lookup email from username
      if (!resolvedEmail.includes('@')) {
        const { data: userRecord, error: lookupError } = await supabase
          .from('users')
          .select('email')
          .eq('username', resolvedEmail)
          .maybeSingle();

        if (lookupError || !userRecord) {
          throw new Error('Username not found or invalid');
        }
        resolvedEmail = userRecord.email;
      }

      // 2. Perform online login via Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      });

      if (error) throw error;

      if (data.session) {
        const sbUser = data.user;
        
        // Check if user exists in public.users to get their relational ID
        let publicUser: any = null;
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('firebase_uid', sbUser.id)
            .maybeSingle();
          publicUser = userData;
        } catch (dbErr) {
          console.log('Could not load public user profile during login:', dbErr);
        }

        const onlineUser = {
          id: sbUser.id,
          user_id: publicUser?.user_id || 0,
          email: sbUser.email,
          full_name: publicUser?.full_name || sbUser.user_metadata?.full_name || '',
          role: [publicUser?.role || 'user'],
        };

        const tokens = {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        };

        await signIn(onlineUser, tokens);
        router.replace('/home');
      }
    } catch (err: any) {
      console.log('Online login failed, trying offline:', err.message);
      try {
        // 3. Try offline login via local SQLite
        const user = await loginUserOffline(identifier.trim(), password);
        await signIn(user);
        router.replace('/home');
      } catch (offlineErr: any) {
        Alert.alert('Login Failed', offlineErr.message || 'Invalid username, email, or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    router.push('/signup');
  };

  const renderPasswordToggle = () => (
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7} style={styles.eyeBtn}>
      <Ionicons 
        name={showPassword ? "eye" : "eye-off"} 
        size={20} 
        color="#64748B" 
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Full screen background landscape image */}
      <Image 
        source={require('../assets/images/image 7.jpg')} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      />
      
      {/* Absolute overlay gradient fading seamlessly from solid white at top to transparent at the bottom */}
      <LinearGradient
        colors={[
          '#ffffff', 
          '#ffffff', 
          'rgba(255, 255, 255, 0.95)', 
          'rgba(255, 255, 255, 0.6)', 
          'transparent'
        ]}
        locations={[0, 0.5, 0.58, 0.72, 0.95]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled" 
          showsVerticalScrollIndicator={false}
        >
          {/* Main Content Area (transparent background to let gradient show through) */}
          <View style={styles.contentCard}>
            {/* Logo Container */}
            <View style={styles.logoContainer}>
              <Ionicons name="compass" size={32} color="#ffffff" />
            </View>

            <Text style={styles.title}>TravelBuddy</Text>
            <Text style={styles.subtitle}>
              Discover hidden gems and plan your next big adventure.
            </Text>

            <View style={styles.signupPromptRow}>
              <Text style={styles.promptText}>Don’t have an account? </Text>
              <TouchableOpacity onPress={handleRegisterRedirect} activeOpacity={0.7}>
                <Text style={styles.promptLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Inputs Form */}
            <View style={styles.form}>
              <TextInput
                label="Username"
                placeholder="wanderer_123"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                leftIcon="person-outline"
              />

              <TextInput
                label="Password"
                placeholder="Min. 8 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                leftIcon="lock-closed-outline"
                rightIcon={renderPasswordToggle()}
              />

              <Button
                title={loading ? 'Logging in...' : 'Log in'}
                onPress={handleLogin}
                disabled={loading}
                style={styles.loginButton}
              />
            </View>
          </View>

          {/* Social login section - styled to fit nicely over the gradient transition zone */}
          <View style={styles.socialSection}>
            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>OR Log in WITH</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.socialButtonsRow}>
              {/* Google Liquid Glass Button */}
              <TouchableOpacity 
                style={styles.socialBtn} 
                activeOpacity={0.8}
                onPress={() => Alert.alert('Google Auth', 'Sign in with Google is under development.')}
              >
                <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFillObject} />
                <View style={styles.socialBtnContent}>
                  <Ionicons name="logo-google" size={18} color="#EA4335" style={styles.socialIcon} />
                  <Text style={styles.socialText}>Google</Text>
                </View>
              </TouchableOpacity>

              {/* Apple Liquid Glass Button */}
              <TouchableOpacity 
                style={styles.socialBtn} 
                activeOpacity={0.8}
                onPress={() => Alert.alert('Apple Auth', 'Sign in with Apple is under development.')}
              >
                <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFillObject} />
                <View style={styles.socialBtnContent}>
                  <Ionicons name="logo-apple" size={18} color="#000000" style={styles.socialIcon} />
                  <Text style={styles.socialText}>Apple</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

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
  scrollContainer: {
    flexGrow: 1,
  },
  contentCard: {
    paddingHorizontal: 24,
    paddingTop: 36,
    alignItems: 'center',
  },
  logoContainer: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FF5A36',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...SHADOWS.light,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 30,
    fontWeight: '600',
    marginBottom: 20,
  },
  signupPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  loginButton: {
    marginTop: 8,
    backgroundColor: '#FF5A36',
    height: 52,
    borderRadius: 10,
    shadowColor: '#FF5A36',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  eyeBtn: {
    padding: 4,
  },
  socialSection: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  line: {
    flex: 1,
    height: 1.2,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  socialBtn: {
    width: '48%',
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    ...SHADOWS.light,
  },
  socialBtnContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    marginRight: 8,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  bottomSpacer: {
    height: 60,
  },
});

export default LoginScreen;
