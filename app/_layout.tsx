import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider } from '../src/context/AuthContext';
import { initDb } from '../src/database/database';

export default function RootLayout() {
  useEffect(() => {
    initDb(); 
  }, []);

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(home)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="place"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AddNote"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="note"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
