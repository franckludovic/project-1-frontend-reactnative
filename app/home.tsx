import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to (home)/index which is the home tab
    router.replace('/(home)');
  }, [router]);

  return null;
}
