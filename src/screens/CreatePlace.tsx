import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput,
  TouchableOpacity, ScrollView, Image, Alert, Dimensions
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { post } from '../services/api';

const { width } = Dimensions.get('window');

const CreatePlaceScreen: React.FC = () => {

  const { imageUri, latitude, longitude, timestamp } = useLocalSearchParams();
  const navigation = useNavigation();
  const { tokens, user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const formatLocationTime = () => {
    if (!lat || !lng || !timestamp) return '';
    const d = new Date(timestamp as string);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)} • ${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} ${d.toLocaleDateString()}`;
  };

  const lat = latitude !== undefined ? parseFloat(latitude as string) : null;
  const lng = longitude !== undefined ? parseFloat(longitude as string) : null;

const savePlace = async () => {

  if (!title.trim()) {
    Alert.alert('Error', 'Please enter a title for the place');
    return;
  }

  if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
    Alert.alert('Error', 'Invalid or missing location data');
    return;
  }

  if (!tokens?.accessToken) {
    Alert.alert('Error', 'You must be logged in to create places');
    return;
  }

  const payload = {
    title: title.trim(),
    description: description.trim(),
    latitude: lat,
    longitude: lng,
    image_url: imageUri ? String(imageUri) : 'https://picsum.photos/400',
    user_id: (user as any)?.id
  };

  console.log(
    'Sending JSON payload:',
    JSON.stringify(payload, null, 2)
  );

  setIsLoading(true);

  try {
    const res = await post(
      'places',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );

    console.log('Place created:', res?.data);

    Alert.alert('Success', 'Place created successfully!');
    navigation.goBack();

  } catch (err: any) {
    console.log('API ERROR:', err?.response || err);

    Alert.alert(
      'Error',
      err?.response?.data?.message ||
      'Failed to create place. Please try again.'
    );

  } finally {
    setIsLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        <View style={styles.imageSection}>
          <Image
            source={{ uri: (imageUri as string) || 'https://picsum.photos/400' }}
            style={styles.image}
          />
        </View>

        <View style={styles.locationPill}>
          <Icon name="map-marker" size={16} color={COLORS.primary} />
          <Text style={styles.locationPillText}>{formatLocationTime()}</Text>
        </View>

        <View style={styles.titleContainer}>
          <TextInput
            style={styles.titleInput}
            placeholder="Place title..."
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.descriptionSection}>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Description (optional)..."
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={255}
          />
        </View>

        <View style={styles.saveButtonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={savePlace} disabled={isLoading}>
              <Icon name="save" size={20} color="white" />
              <Text style={styles.saveButtonText}>{isLoading ? 'Saving your place...' : 'Save Place'}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111718',
  },
  disabledText: {
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageSection: {
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 16,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 24,
  },
  locationPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    flex: 1,
    textAlign: 'center',
  },
  titleContainer: {
    marginBottom: 24,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111718',
    padding: 0,
    borderWidth: 0,
  },
  descriptionSection: {
    marginBottom: 100,
  },
  descriptionInput: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    height: 150,
    fontSize: 16,
    color: '#111718',
    textAlignVertical: 'top',
  },
   saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: 'rgba(248,249,250,0.9)',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position:'absolute',
    bottom:0,
    width:width - 40,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default CreatePlaceScreen;
