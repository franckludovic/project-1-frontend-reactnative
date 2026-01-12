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
import { COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { createNote, CreateNoteData } from '../services/noteApi';

// Components
import TitleInput from '../components/AddNote/TitleInput';
import ActionButtons from '../components/AddNote/ActionButtons';
import PhotosSection from '../components/AddNote/PhotosSection';
import NotesInput from '../components/AddNote/NotesInput';
import SaveButton from '../components/AddNote/SaveButton';
import Header from '../components/Header';



// Types
type Place = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  image_url?: string;
};

type Photo = { uri: string };

const AddNoteScreen: React.FC = () => {
  const { user, tokens } = useAuth();
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
      if (parsedPlace.image) {
        if (typeof parsedPlace.image === 'string') {
          safePhotos.push({ uri: parsedPlace.image });
        } else if (parsedPlace.image.uri) {
          safePhotos.push({ uri: parsedPlace.image.uri });
        }
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
    if (!place || !user || !tokens?.accessToken) return;

    try {
      const userId = typeof user === 'object' ? (user.user_id || user.id) : user;
      if (!userId) {
        Alert.alert('Error', 'User ID not found');
        return;
      }

      const noteData: CreateNoteData = {
        user_id: Number(userId),
        place_id: parseInt(place.id, 10),
        title: title,
        content: notes,
        latitude: coords?.latitude || place.latitude,
        longitude: coords?.longitude || place.longitude,
        photos: photos.map((photo, index) => ({
          photo_url: photo.uri,
          local_path: null, // For now, not handling local paths
          display_order: index
        }))
      };

      await createNote(noteData, tokens.accessToken);

      Alert.alert('Saved', 'Note saved successfully');
      router.back();
    } catch (err) {
      console.error('Save note error:', err);
      Alert.alert('Error', 'Failed to save note');
    }

  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primaryNote} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <Header
        leftContent={
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
        }
        centerContent={
          <Text style={styles.headerTitle}>New Note</Text>
        }
        rightContent={
          <TouchableOpacity style={styles.viewAllPill}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        }
        containerStyle={{
          marginTop: 20,
          backgroundColor: COLORS.surfaceLight,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.stone200,
        }}
      />

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
            coords={coords}
            timestamp={timestamp}
          />

          {/* Notes Input */}
          <NotesInput value={notes} onChangeText={setNotes} />

        </View>
      </ScrollView>

      {/* Save Button */}
      <SaveButton onPress={saveNote} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
    backgroundColor: COLORS.backgroundLight,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 20,
    backgroundColor: COLORS.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.stone200,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  viewAllPill: {
    backgroundColor: COLORS.primaryNote,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    marginTop: 0,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
});

export default AddNoteScreen;
