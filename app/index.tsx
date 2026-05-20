import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import LandingPage from '../src/screens/LandingPage';

export default function Index() {
  const router = useRouter();
  const { authMode, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (authMode === 'online' || authMode === 'offline') {
        router.replace('/home');
      }
    }
  }, [authMode, isLoading]);

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleViewDemo = () => {
    router.push('/home');
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#FF5A36" />
      </View>
    );
  }

  return <LandingPage onGetStarted={handleGetStarted} onViewDemo={handleViewDemo} />;
}
