import { Stack } from 'expo-router';
import ExploreFeedScreen from '../../src/screens/ExploreFeedScreen';

export default function PlacesTabScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ExploreFeedScreen userName="Traveler" />
    </>
  );
}
