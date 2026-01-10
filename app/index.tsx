import { useRouter } from 'expo-router';
import LandingPage from '../src/screens/LandingPage';

export default function Index() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleViewDemo = () => {
    router.push('/home');
  };

  return <LandingPage onGetStarted={handleGetStarted} onViewDemo={handleViewDemo} />;
}
