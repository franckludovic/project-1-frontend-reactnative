import React, { useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, Image, TextInput, Alert, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import HomeScreen from '../../src/screens/HomeScreen';
import { COLORS } from '../../src/constants';
import { useAuth } from '../../src/context/AuthContext';
import { post } from '../../src/services/api';
import { getPlacesByUserId } from '../../src/services/local/placeService';
import { getPlannedVisitsByUserId } from '../../src/services/local/plannedVisitService';
import { getFavoritesByUserId } from '../../src/services/local/favoriteService';

const { width } = Dimensions.get('window');

export default function HomeTabScreen() {
  const { tokens, user } = useAuth();
  const router = useRouter();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const [stats, setStats] = useState({
    posts: 0,
    planned: 0,
    saved: 0,
    synced: '0/0',
  });

  useFocusEffect(
    React.useCallback(() => {
      const loadStats = async () => {
        if (!user) return;
        const userId = typeof user === 'object' ? (user.user_id || user.id) : user;
        if (!userId) return;

        try {
          const places = await getPlacesByUserId(Number(userId));
          const planned = await getPlannedVisitsByUserId(Number(userId));
          const favorites = await getFavoritesByUserId(Number(userId));

          const totalPlaces = places.length;
          const syncedPlaces = places.filter((p: any) => p.synched === 1).length;

          setStats({
            posts: totalPlaces,
            planned: planned.length,
            saved: favorites.length,
            synced: `${syncedPlaces}/${totalPlaces}`,
          });
        } catch (error) {
          console.error('Error loading stats:', error);
        }
      };

      loadStats();
    }, [user])
  );

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

  return (
    <HomeScreen 
      userName={user && typeof user === 'object' ? (user.full_name || user.username || 'Traveler') : 'Traveler'} 
      onAddPlace={handleAddPlace} 
      stats={stats}
    />
  );
}
