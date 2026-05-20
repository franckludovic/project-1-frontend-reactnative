import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { addFavorite, removeFavorite, getFavoritesByUserId, isFavorite } from '../services/local/favoriteService';
import PlaceCard from '../components/PlaceCard';
import Grid from '../components/Grid';
import Header from '../components/Header';
import { STATIC_BASE_URL } from '../config/config';
import { getPlacesByUserId } from '../services/local/placeService';
import { getPlacePhotos } from '../services/local/photoService';
import { reverseGeocode, getCurrentLocation } from '../utils/locationUtils';
import ImagePickerModal from '../components/ImagePickerModal';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, UrlTile } from 'react-native-maps';

type ViewMode = 'grid' | 'map';

const PlacesScreen: React.FC = () => {
  const { user } = useAuth();
  const userID = typeof user === "string" ? null : user?.user_id ?? null;

  const [activeTab, setActiveTab] = useState("Captured");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [places, setPlaces] = useState<any[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [plannedVisits, setPlannedVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFavoriteToggle = async (placeId: string, isCurrentlyFavorite: boolean) => {
    if (!userID) {
      Alert.alert('Error', 'You must be logged in to manage favorites.');
      return;
    }

    try {
      if (isCurrentlyFavorite) {
        const favArray = await getFavoritesByUserId(userID as number);
        const favorite = favArray.find((f: any) => f.place_id === parseInt(placeId));
        if (favorite && favorite.fav_id) {
          await removeFavorite(favorite.fav_id);
        }
      } else {
        await addFavorite({ user_id: userID as number, place_id: parseInt(placeId) });
      }

      setPlaces(prev =>
        prev.map(item =>
          item.id === placeId ? { ...item, isFavorite: !isCurrentlyFavorite } : item
        )
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update favorite.');
      setPlaces(prev =>
        prev.map(item =>
          item.id === placeId ? { ...item, isFavorite: isCurrentlyFavorite } : item
        )
      );
    }
  };

  const fetchData = async () => {
    if (!userID) return;

    try {
      const placesArray = await getPlacesByUserId(userID);

      const enriched = await Promise.all(
        placesArray.map(async (item: any) => {
          const reverseResult = await reverseGeocode(item.latitude, item.longitude);
          const isFavorited = await isFavorite(userID, item.place_id);

          let image_url = "https://picsum.photos/400";
          try {
            const photos = await getPlacePhotos(item.place_id);
            if (photos.length > 0) {
              const primaryPhoto = photos.find((photo: any) => photo.display_order === 0) || photos[0];
              if (primaryPhoto.photo_url) {
                image_url = primaryPhoto.photo_url.startsWith("http") || primaryPhoto.photo_url.startsWith("file://")
                  ? primaryPhoto.photo_url
                  : `${STATIC_BASE_URL}${primaryPhoto.photo_url}`;
              }
            }
          } catch (photoError) {
            console.log("Error fetching photos for place", item.place_id, photoError);
          }

          return {
            id: String(item.place_id),
            place_id: item.place_id,
            title: item.title,
            location: reverseResult.success ? reverseResult.readableName : `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`,
            rating: item.rating ?? 4.5,
            isFavorite: isFavorited,
            image_url: image_url,
            latitude: item.latitude,
            longitude: item.longitude,
            timestamp: item.created_at || new Date().toISOString(),
          };
        })
      );

      setPlaces(enriched);
    } catch (err: any) {
      console.log("Fetch error:", err?.message || err);
      Alert.alert('Error', 'Failed to load places');
    }
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [userID]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleToggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'map' : 'grid');
  };

  const handleAddPlace = () => {
    setIsImagePickerVisible(true);
  };

  const handleImageSelected = async (uri: string | string[]) => {
    try {
      setIsProcessing(true);
      const location = await getCurrentLocation();

      if (!location) {
        Alert.alert("Error", "Unable to get current location");
        return;
      }

      router.push({
        pathname: "/CreatePlace",
        params: {
          imageUri: Array.isArray(uri) ? uri[0] : uri,
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header centerContent={<Text style={styles.headerTitle}>My Places</Text>} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const tabs = ["Captured", "Nearby", "Planned"];

  const getCurrentData = () => {
    switch (activeTab) {
      case "Captured":
        return places;
      case "Nearby":
        return nearbyPlaces;
      case "Planned":
        return plannedVisits;
      default:
        return places;
      }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case "Captured":
        return { title: "No places captured yet", subtitle: "Tap the + button to journal your first destination" };
      case "Nearby":
        return { title: "No nearby places", subtitle: "Explored pins close to your location will show here" };
      case "Planned":
        return { title: "No planned visits", subtitle: "Queue up locations you want to check off next" };
      default:
        return { title: "No places yet", subtitle: "Start exploring to save your first memory" };
    }
  };

  const defaultCoords = {
    latitude: places[0]?.latitude || 6.1319,
    longitude: places[0]?.longitude || 1.2222,
    latitudeDelta: 10.0,
    longitudeDelta: 10.0,
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header centerContent={<Text style={styles.headerTitle}>My Places</Text>} />

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {viewMode === 'grid' ? (
        <Grid
          data={getCurrentData()}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <PlaceCard
                title={item.title}
                location={item.location}
                imageUrl={item.image_url}
                onPress={() =>
                  router.push({
                    pathname: "/place/[placeId]",
                    params: { placeId: String(item.place_id) },
                  })
                }
                onFavoritePress={() => handleFavoriteToggle(item.id, item.isFavorite)}
                isFavorite={item.isFavorite}
                placeId={item.place_id}
              />
            </View>
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[styles.gridContainer, { paddingBottom: 120 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconFrame}>
                <Ionicons name="compass-outline" size={40} color={COLORS.textLight} />
              </View>
              <Text style={styles.emptyText}>{getEmptyMessage().title}</Text>
              <Text style={styles.emptySubtext}>{getEmptyMessage().subtitle}</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={defaultCoords}
            mapType="none" // disables default Google/Apple mapping vectors to enforce OSM tiles
          >
            <UrlTile
              urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
            />
            {getCurrentData().map((item: any) => (
              <Marker
                key={item.id}
                coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                title={item.title}
                description={item.location}
                pinColor={COLORS.primary}
                onCalloutPress={() => {
                  router.push({
                    pathname: "/place/[placeId]",
                    params: { placeId: String(item.place_id) },
                  });
                }}
              />
            ))}
          </MapView>
        </View>
      )}

      {/* Floating Action Buttons */}
      <View style={styles.floatingButtonsContainer}>
        <TouchableOpacity 
          style={[styles.floatingButton, styles.mapToggleBtn]} 
          onPress={handleToggleViewMode}
          activeOpacity={0.85}
        >
          <Ionicons 
            name={viewMode === 'grid' ? 'map' : 'list'} 
            size={22} 
            color="#fff" 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.floatingButton} 
          onPress={handleAddPlace}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={isImagePickerVisible}
        onClose={() => setIsImagePickerVisible(false)}
        onImageSelected={handleImageSelected}
      />

      {/* Loader Overlay */}
      {isProcessing && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loaderText}>Fetching location details…</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -0.3,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconFrame: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textMain,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    fontWeight: '500',
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  gridItem: {
    flex: 1,
    marginHorizontal: 4,
    marginVertical: 8,
    maxWidth: (Dimensions.get('window').width - 40) / 2,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
    marginHorizontal: 3,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "700",
  },
  activeTabText: {
    color: "#fff",
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'column',
    gap: 12,
  },
  floatingButton: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  mapToggleBtn: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loaderText: {
    marginTop: 14,
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default PlacesScreen;
