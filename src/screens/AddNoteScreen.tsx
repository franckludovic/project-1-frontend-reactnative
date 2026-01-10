import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import api from '../services/api';

// Components
import Header from '../components/AddNote/Header';
import TitleInput from '../components/AddNote/TitleInput';
import ActionButtons from '../components/AddNote/ActionButtons';
import PhotosSection from '../components/AddNote/PhotosSection';
import NotesInput from '../components/AddNote/NotesInput';
import SaveButton from '../components/AddNote/SaveButton';
import BottomNavigation from '../components/AddNote/BottomNavigation';

// Types
type Place = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  image_url?: string;
};

type Photo = { uri: string };

// Colors
const COLORS = {
  primary: '#13daec',
  primaryDark: '#0ea5b3',
  backgroundLight: '#f8f9fa',
  backgroundDark: '#102022',
  surfaceLight: '#ffffff',
  surfaceDark: '#1a2c2e',
  textMain: '#111718',
  textMuted: '#618689',
};

const AddNoteScreen: React.FC = () => {
  const { place: placeParam } = useLocalSearchParams<{ place: string }>();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<Location.LocationGeocodedAddress | null>(null);
  const [timestamp, setTimestamp] = useState<Date | null>(null);

  // Load place data from params
  useEffect(() => {
    if (!placeParam) {
      Alert.alert('Error', 'No place data provided');
      router.back();
      return;
    }

    try {
      const parsedPlace = JSON.parse(placeParam);
      setPlace(parsedPlace);

      const safePhotos: Photo[] = [];
      if (typeof parsedPlace.image_url === 'string') {
        safePhotos.push({ uri: parsedPlace.image_url });
      }
      setPhotos(safePhotos);

      setCoords({
        latitude: parsedPlace.latitude,
        longitude: parsedPlace.longitude,
      });

      setTimestamp(new Date());
      setLocationEnabled(true);

      // Try to get address from coordinates
      Location.reverseGeocodeAsync({
        latitude: parsedPlace.latitude,
        longitude: parsedPlace.longitude,
      }).then(geo => {
        if (geo.length > 0) setAddress(geo[0]);
      }).catch(() => {
        // Ignore geocoding errors
      });

      setLoading(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to load place data');
      router.back();
    }
  }, [placeParam]);

  // Image picking functions
  const openCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) return Alert.alert('Permission required');

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos(prev => [...prev, { uri: result.assets[0].uri }]);
      setTimestamp(new Date());
    }
  };

  const openGallery = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert('Permission required');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setPhotos(prev => [
        ...prev,
        ...result.assets.map(a => ({ uri: a.uri })),
      ]);
    }
  };

  // Location functions
  const toggleLocation = async () => {
    if (locationEnabled) {
      setLocationEnabled(false);
      setCoords(null);
      setAddress(null);
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission denied');

    const loc = await Location.getCurrentPositionAsync({});
    setCoords({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    setTimestamp(new Date());

    const geo = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });

    if (geo.length > 0) setAddress(geo[0]);
    setLocationEnabled(true);
  };

  // Save function
  const saveNote = async () => {
    if (!place) return;

    try {
      await api.post('/notes', {
        placeId: place.id,
        title,
        content: notes,
        photos: photos.map(p => p.uri),
        coords,
        timestamp,
      });

      Alert.alert('Saved', 'Note saved successfully');
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save note');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['rgba(19,218,236,0.1)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <Header onCancel={() => router.back()} />

      {/* Main Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title Input */}
          <TitleInput value={title} onChangeText={setTitle} />

          {/* Action Buttons */}
          <ActionButtons
            onLocationPress={toggleLocation}
            locationEnabled={locationEnabled}
            locationLabel={locationEnabled ? `${address?.city || ''}, ${address?.country || ''}` : ''}
          />

          {/* Photos Section */}
          <PhotosSection
            photos={photos}
            onAddPhoto={() => {
              Alert.alert(
                'Add Photo',
                'Choose an option',
                [
                  { text: 'Camera', onPress: openCamera },
                  { text: 'Gallery', onPress: openGallery },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
            onRemovePhoto={(index) => {
              setPhotos(prev => prev.filter((_, i) => i !== index));
            }}
          />

          {/* Notes Input */}
          <NotesInput value={notes} onChangeText={setNotes} />
       
        </View>
      </ScrollView>

      {/* Save Button */}
      <SaveButton onPress={saveNote} />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 256,
    pointerEvents: 'none',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
  },
  scrollView: {
    flex: 1,
    marginTop: 80,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
});

export default AddNoteScreen;
