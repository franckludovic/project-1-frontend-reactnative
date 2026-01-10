import { useRouter } from 'expo-router';
import LoginScreen from '../src/screens/LoginScreen';

export default function Login() {
  const router = useRouter();

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen when created
    console.log('Navigate to forgot password');
  };

  return <LoginScreen onSignUp={handleSignUp} />;
}
