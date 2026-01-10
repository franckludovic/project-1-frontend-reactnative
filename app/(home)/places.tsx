import { Stack } from 'expo-router';
import PlacesScreen from '../../src/screens/PlacesScreen';

export default function PlacesTabScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PlacesScreen userName="Traveler" />
    </>
  );
}
