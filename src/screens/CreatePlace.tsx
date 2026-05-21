import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput,
  TouchableOpacity, ScrollView, Image, Alert, Dimensions, FlatList,
  ImageBackground, Modal, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { createPlace } from '../services/local/placeService';
import { addPlacePhoto } from '../services/local/photoService';
import ImagePickerModal from '../components/ImagePickerModal';

const { width } = Dimensions.get('window');

const CreatePlaceScreen: React.FC = () => {
  const { imageUri, latitude, longitude, timestamp } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  // Tab bar height = ~60px content + bottom safe area + 10px paddingTop
  const TAB_BAR_HEIGHT = 70 + Math.max(insets.bottom, 12);
  // Footer: header row (12pt) + button (50px) + bottom padding
  const FOOTER_HEIGHT = 12 + 50 + Math.max(insets.bottom + 16, 24);

  // Permissions and GPS states
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [lat, setLat] = useState<number | null>(latitude ? parseFloat(latitude as string) : null);
  const [lng, setLng] = useState<number | null>(longitude ? parseFloat(longitude as string) : null);
  const [locationName, setLocationName] = useState<string>('Detecting location...');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>(imageUri ? [String(imageUri)] : []);
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);

  // Tags states
  const [availableTags, setAvailableTags] = useState<string[]>(['#nature', '#food', '#adventure']);
  const [selectedTags, setSelectedTags] = useState<string[]>(['#nature']);
  const [customTag, setCustomTag] = useState('');
  const [isCustomTagModalVisible, setIsCustomTagModalVisible] = useState(false);

  // Visibility state
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  // Request location permission & fetch coordinates
  const checkAndRequestLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasLocationPermission(true);
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLat(loc.coords.latitude);
        setLng(loc.coords.longitude);

        // Reverse Geocode
        const geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        if (geocode && geocode.length > 0) {
          const city = geocode[0].city || geocode[0].subregion || geocode[0].region || '';
          const country = geocode[0].country || '';
          setLocationName(city && country ? `${city}, ${country}` : city || country || 'Yaoundé, Cameroon');
        } else {
          setLocationName('Yaoundé, Cameroon');
        }
      } else {
        setHasLocationPermission(false);
      }
    } catch (error) {
      console.log('Error getting location:', error);
      setHasLocationPermission(false);
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    if (latitude && longitude) {
      setHasLocationPermission(true);
      const parsedLat = parseFloat(latitude as string);
      const parsedLng = parseFloat(longitude as string);
      setLat(parsedLat);
      setLng(parsedLng);
      setLocationName('Detecting location...');

      Location.reverseGeocodeAsync({
        latitude: parsedLat,
        longitude: parsedLng,
      }).then(geocode => {
        if (geocode && geocode.length > 0) {
          const city = geocode[0].city || geocode[0].subregion || geocode[0].region || '';
          const country = geocode[0].country || '';
          setLocationName(city && country ? `${city}, ${country}` : city || country || 'Yaoundé, Cameroon');
        } else {
          setLocationName('Yaoundé, Cameroon');
        }
      }).catch(() => {
        setLocationName('Yaoundé, Cameroon');
      });
    } else {
      checkAndRequestLocation();
    }
  }, [latitude, longitude]);

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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim()) {
      let formattedTag = customTag.trim().toLowerCase();
      if (!formattedTag.startsWith('#')) {
        formattedTag = `#${formattedTag}`;
      }
      if (!availableTags.includes(formattedTag)) {
        setAvailableTags(prev => [...prev, formattedTag]);
      }
      if (!selectedTags.includes(formattedTag)) {
        setSelectedTags(prev => [...prev, formattedTag]);
      }
      setCustomTag('');
      setIsCustomTagModalVisible(false);
    }
  };

  const savePlaceData = async (status: 'published' | 'draft') => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a title for this place.');
      return;
    }

    if (lat === null || lng === null) {
      Alert.alert('Location Required', 'Device location is needed to save a place.');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Error', 'You must be logged in to create a place.');
      return;
    }

    const placeData = {
      title: title.trim(),
      description: description.trim(),
      latitude: lat,
      longitude: lng,
      visibility: visibility,
      user_id: (user as any)?.user_id || 1,
      synched: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setIsLoading(true);
    try {
      const placeId = await createPlace(placeData);

      // Save photos
      for (let i = 0; i < images.length; i++) {
        await addPlacePhoto({
          place_id: placeId,
          photo_url: images[i],
          display_order: i,
          synched: 0,
          created_at: new Date().toISOString(),
        });
      }

      Alert.alert(
        'Success',
        status === 'published' ? 'Place published successfully!' : 'Place saved to drafts successfully!',
        [{ text: 'OK', onPress: () => router.push('/(home)') }]
      );
    } catch (err: any) {
      console.log('Database error:', err);
      Alert.alert('Error', err?.message || 'Failed to save place. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- No GPS Screen UI ---
  if (hasLocationPermission === false && !isLocating) {
    return (
      <View style={styles.noGpsContainer}>
        <ImageBackground
          source={require("../assets/images/image 3.jpg")}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0.92)",
              "#FAF8F6",
            ]}
            locations={[0, 0.42, 0.68, 0.85]}
            style={StyleSheet.absoluteFillObject}
          />
        </ImageBackground>

        {/* Custom Header in No GPS Screen to allow backing out */}
        <SafeAreaView style={styles.noGpsSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(home)')}>
              <Ionicons name="arrow-back" size={24} color="#AB3500" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Place</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.noGpsContent}>
            <View style={{ flex: 0.8 }} />
            <View style={styles.badgeOuterCircle}>
              <MaterialCommunityIcons
                name="map-marker-off-outline"
                size={80}
                color="#A22600"
              />
              <View style={styles.questionBadge}>
                <Text style={styles.questionText}>?</Text>
              </View>
            </View>
            <Text style={styles.noGpsTitle}>Where are you?</Text>
            <Text style={styles.noGpsDescription}>
              TravelBuddy needs location permission to create a new place, tag its coordinates, and auto-detect your city.
            </Text>
            <TouchableOpacity
              style={styles.enableButton}
              onPress={checkAndRequestLocation}
              activeOpacity={0.85}
            >
              <Ionicons
                name="location-sharp"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.enableButtonText}>Enable Location</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // --- Locating / Loader UI ---
  if (isLocating || hasLocationPermission === null) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF5A36" />
        <Text style={styles.locatingText}>Locating your wanderings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(home)')}>
          <Ionicons name="arrow-back" size={24} color="#AB3500" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Place</Text>
        <TouchableOpacity style={styles.publishHeaderButton} onPress={() => savePlaceData('published')}>
          <Text style={styles.publishHeaderText}>Publish</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: FOOTER_HEIGHT + TAB_BAR_HEIGHT + 16 }]}>
        {/* Media Section */}
        <Text style={styles.sectionTitle}>Media</Text>
        <View style={styles.mediaSection}>
          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item, index }) => (
              <View style={styles.imageContainer}>
                <Image source={{ uri: item }} style={styles.thumbnail} />
                <TouchableOpacity
                  style={styles.removeImageBadge}
                  onPress={() => removeImage(index)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            )}
            ListHeaderComponent={
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={() => setIsImagePickerVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="images-outline" size={26} color="#5C4E4D" />
              </TouchableOpacity>
            }
          />
        </View>

        {/* Details Card Container */}
        <View style={styles.detailsCard}>
          {/* Location Pill */}
          <View style={styles.locationPill}>
            <Ionicons name="location" size={14} color="#FF5A36" />
            <Text style={styles.locationPillText}>{locationName}</Text>
          </View>

          {/* Title input */}
          <Text style={styles.inputLabel}>
            Title <Text style={styles.asterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Give this place a name"
            placeholderTextColor="#98908E"
            value={title}
            onChangeText={setTitle}
          />

          {/* Description input */}
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={styles.textareaInput}
            placeholder="Share your experience or tips..."
            placeholderTextColor="#98908E"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Tags Section */}
        <Text style={styles.sectionTitle}>Tags</Text>
        <View style={styles.tagsContainer}>
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagPill,
                  isSelected ? styles.tagPillActive : styles.tagPillInactive
                ]}
                onPress={() => toggleTag(tag)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tagText,
                    isSelected ? styles.tagTextActive : styles.tagTextInactive
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={styles.addTagButton}
            onPress={() => setIsCustomTagModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.addTagButtonText}>+ Tag</Text>
          </TouchableOpacity>
        </View>

        {/* Visibility Section */}
        <Text style={styles.sectionTitle}>Visibility</Text>
        <View style={styles.visibilityCard}>
          <Text style={styles.visibilityTitle}>Visibility</Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                visibility === 'public' && styles.segmentButtonActive
              ]}
              onPress={() => setVisibility('public')}
              activeOpacity={0.9}
            >
              <Text style={[styles.segmentText, visibility === 'public' && styles.segmentTextActive]}>
                Public
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                visibility === 'private' && styles.segmentButtonActive
              ]}
              onPress={() => setVisibility('private')}
              activeOpacity={0.9}
            >
              <Text style={[styles.segmentText, visibility === 'private' && styles.segmentTextActive]}>
                Private
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.visibilityDescription}>
            {visibility === 'public'
              ? 'Anyone on TravelBuddy can discover this place.'
              : 'Only you will be able to view and manage this place.'}
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Buttons */}
      <View style={[styles.footer, { bottom: TAB_BAR_HEIGHT, paddingBottom: 16 }]}>
        <TouchableOpacity
          style={styles.publishFooterButton}
          onPress={() => savePlaceData('published')}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.publishFooterText}>Publish</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.draftFooterButton}
          onPress={() => savePlaceData('draft')}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          <Text style={styles.draftFooterText}>Save to Draft</Text>
        </TouchableOpacity>
      </View>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={isImagePickerVisible}
        onClose={() => setIsImagePickerVisible(false)}
        onImageSelected={handleImageSelected}
        allowMultiple={true}
      />

      {/* Custom Modal for Adding Tags */}
      <Modal
        visible={isCustomTagModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCustomTagModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Tag</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. historical, beach, hiking"
              value={customTag}
              onChangeText={setCustomTag}
              autoFocus
              maxLength={20}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setCustomTag('');
                  setIsCustomTagModalVisible(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={addCustomTag}
              >
                <Text style={styles.modalAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F6', // Beautiful soft warm cream/beige background matching mockup
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  locatingText: {
    marginTop: 14,
    fontSize: 16,
    color: '#5C4E4D',
    fontWeight: '500',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FAF8F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111718',
  },
  publishHeaderButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  publishHeaderText: {
    color: '#AB3500',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 16,
    // paddingBottom is set dynamically via inline style
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111718',
    marginBottom: 10,
    letterSpacing: -0.1,
  },
  mediaSection: {
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#EAE8E6',
  },
  removeImageBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FAF8F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F0EDE9',
    borderWidth: 1.5,
    borderColor: '#D8CECC',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.2,
    borderColor: '#F0ECE8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0EB', // soft peach tint matching location label in feed
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 4,
  },
  locationPillText: {
    color: '#FF5A36',
    fontSize: 12,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5C4E4D',
    marginBottom: 6,
  },
  asterisk: {
    color: '#FF3B30',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E6E0DD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111718',
    marginBottom: 16,
    backgroundColor: '#FAF9F8',
  },
  textareaInput: {
    borderWidth: 1,
    borderColor: '#E6E0DD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111718',
    minHeight: 90,
    textAlignVertical: 'top',
    backgroundColor: '#FAF9F8',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tagPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  tagPillActive: {
    backgroundColor: '#FF5A36', // solid orange active tag
  },
  tagPillInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3DCDA',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tagTextActive: {
    color: '#FFFFFF',
  },
  tagTextInactive: {
    color: '#AB3500', // tag labels color
  },
  addTagButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#AB3500',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  addTagButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#AB3500',
  },
  visibilityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.2,
    borderColor: '#F0ECE8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  visibilityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111718',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#EDECE9',
    borderRadius: 20,
    padding: 3,
    marginTop: 12,
    marginBottom: 10,
    height: 38,
  },
  segmentButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 17,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5C4E4D',
  },
  segmentTextActive: {
    color: '#111718',
  },
  visibilityDescription: {
    fontSize: 12,
    color: '#908684',
    lineHeight: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FAF8F6',
    borderTopWidth: 1,
    borderTopColor: '#F0ECE8',
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 12,
  },
  publishFooterButton: {
    flex: 1,
    backgroundColor: '#FF5A36',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5A36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  publishFooterText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  draftFooterButton: {
    flex: 1,
    backgroundColor: '#FFF5F2',
    borderWidth: 1.5,
    borderColor: '#FF5A36',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  draftFooterText: {
    color: '#FF5A36',
    fontSize: 15,
    fontWeight: '700',
  },

  /* --- No GPS Layout --- */
  noGpsContainer: {
    flex: 1,
    backgroundColor: "#FAF8F6",
  },
  noGpsSafeArea: {
    flex: 1,
  },
  noGpsContent: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 32,
    zIndex: 1,
  },
  badgeOuterCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  questionBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#FF5A36",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  questionText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
  noGpsTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1E1E1E",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  noGpsDescription: {
    fontSize: 14,
    color: "#5C4E4D",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 36,
    fontWeight: "500",
  },
  enableButton: {
    flexDirection: "row",
    backgroundColor: "#FF5A36",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#FF5A36",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  enableButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  /* --- Tag Modal --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: width * 0.8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111718',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E6E0DD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: '#111718',
    backgroundColor: '#FAF9F8',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: '#5C4E4D',
    fontSize: 15,
    fontWeight: '600',
  },
  modalAddButton: {
    backgroundColor: '#FF5A36',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalAddText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CreatePlaceScreen;
