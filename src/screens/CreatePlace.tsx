import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput,
  TouchableOpacity, ScrollView, Image, Alert, Dimensions, FlatList
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { createPlace } from '../services/placeService';
import { addPlacePhoto } from '../services/photoService';
import ImagePickerModal from '../components/ImagePickerModal';

const { width } = Dimensions.get('window');

const CreatePlaceScreen: React.FC = () => {

  const { imageUri, latitude, longitude, timestamp } = useLocalSearchParams();
  const navigation = useNavigation();
  const { tokens, user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>(imageUri ? [String(imageUri)] : []);
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);


  const formatLocationTime = () => {
    if (!lat || !lng || !timestamp) return '';
    const d = new Date(timestamp as string);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)} • ${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} ${d.toLocaleDateString()}`;
  };

  const lat = latitude !== undefined ? parseFloat(latitude as string) : null;
  const lng = longitude !== undefined ? parseFloat(longitude as string) : null;

  const handleImageSelected = (uri: string | string[]) => {
    if (Array.isArray(uri)) {
      setImages(prev => [...prev, ...uri]);
    } else {
      setImages(prev => [...prev, uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

const savePlace = async () => {

  if (!title.trim()) {
    Alert.alert('Error', 'Please enter a title for the place');
    return;
  }

  if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
    Alert.alert('Error', 'Invalid or missing location data');
    return;
  }

  if (!user) {
    Alert.alert('Error', 'You must be logged in to create places');
    return;
  }

  const placeData = {
    title: title.trim(),
    description: description.trim(),
    latitude: lat,
    longitude: lng,
    user_id: (user as any)?.user_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  console.log(
    'Creating place in local database:',
    JSON.stringify(placeData, null, 2)
  );

  setIsLoading(true);

  try {
    const result = await createPlace(placeData);

    console.log('Place created with ID:', result);

    // Save all photos
    for (let i = 0; i < images.length; i++) {
      await addPlacePhoto({
        place_id: result,
        photo_url: images[i],
        display_order: i,
        synched: 0,
        created_at: new Date().toISOString(),
      });
    }

    Alert.alert('Success', 'Place created successfully!');
    navigation.goBack();

  } catch (err: any) {
    console.log('Database ERROR:', err?.message || err);

    Alert.alert(
      'Error',
      err?.message ||
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
          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item, index }) => (
              <View style={styles.imageContainer}>
                <Image source={{ uri: item }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Icon name="times" size={16} color="white" />
                </TouchableOpacity>
              </View>
            )}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={() => setIsImagePickerVisible(true)}
              >
                <Icon name="plus" size={24} color={COLORS.primary} />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            }
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

      <ImagePickerModal
        visible={isImagePickerVisible}
        onClose={() => setIsImagePickerVisible(false)}
        onImageSelected={handleImageSelected}
        allowMultiple={true}
      />
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
    marginBottom: 30,
    paddingVertical: 15
  },
  image: {
    width: 300,
    height: 250,
    borderRadius: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  addImageButton: {
    width: 300,
    height: 250,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,123,255,0.1)',
  },
  addImageText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
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
