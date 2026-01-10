import React, { useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, Image, TextInput, Alert, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import HomeScreen from '../../src/screens/HomeScreen';
import { COLORS } from '../../src/constants';
import { useAuth } from '../../src/context/AuthContext';
import { post } from '../../src/services/api';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeTabScreen() {
  const { tokens } = useAuth();
  const router = useRouter();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);

      // Fetch location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
        setTimestamp(new Date().toISOString());
        router.push({
          pathname: '/CreatePlace',
          params: {
            imageUri: result.assets[0].uri,
            latitude: location.coords.latitude.toString(),
            longitude: location.coords.longitude.toString(),
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        Alert.alert('Permission denied', 'Location permission is required to create places');
        return;
      }
    }
  };

  const handleAddPlace = () => {
    openCamera();
  };

  const createPlace = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the place');
      return;
    }

    if (!capturedImage) {
      Alert.alert('Error', 'No image captured');
      return;
    }

    if (!tokens?.accessToken) {
      Alert.alert('Error', 'You must be logged in to create places');
      return;
    }

    setIsLoading(true);

    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to create places');
        setIsLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});

      // For now, we'll use the local image URI. In a real app, you'd upload to a server first
      const placeData = {
        title: title.trim(),
        description: subtitle.trim(),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        image_url: capturedImage, // This would be the uploaded image URL in production
      };

      // Make API call to create place
      await post('places', placeData, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      Alert.alert('Success', 'Place created successfully!');
      resetModal();

    } catch (error) {
      console.error('Error creating place:', error);
      Alert.alert('Error', 'Failed to create place. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setShowPlaceModal(false);
    setCapturedImage(null);
    setTitle('');
    setSubtitle('');
    setLatitude(null);
    setLongitude(null);
    setTimestamp(null);
  };

  return (
    <HomeScreen userName="Traveler" onAddPlace={handleAddPlace} />
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111718',
    marginBottom: 20,
  },
  capturedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: '#111718',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: COLORS.orange,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timestampText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
});
