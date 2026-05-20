import React, { useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export default function CreateTabScreen() {
  const router = useRouter();

  useEffect(() => {
    const launchWorkflow = async () => {
      try {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert('Permission required', 'Camera permission is required to take photos');
          router.replace('/(home)');
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

        if (result.canceled) {
          router.replace('/(home)');
          return;
        }

        // Fetch location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location permission is required to create places');
          router.replace('/(home)');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        
        router.replace({
          pathname: '/CreatePlace',
          params: {
            imageUri: result.assets[0].uri,
            latitude: location.coords.latitude.toString(),
            longitude: location.coords.longitude.toString(),
            timestamp: new Date().toISOString(),
          },
        });
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to start camera');
        router.replace('/(home)');
      }
    };

    launchWorkflow();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDFBF7' }}>
      <ActivityIndicator size="large" color="#FF5A36" />
    </View>
  );
}
