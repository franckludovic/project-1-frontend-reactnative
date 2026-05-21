import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FeedItem from "../components/feed/FeedItem";
import ImagePickerModal from "../components/ImagePickerModal";
import { STATIC_BASE_URL } from "../config/config";
import { COLORS } from "../constants";
import { useAuth } from "../context/AuthContext";
import {
  addFavorite,
  getFavoritesByUserId,
  isFavorite,
  removeFavorite,
} from "../services/local/favoriteService";
import { getPlacePhotos } from "../services/local/photoService";
import { getPlaceVideos } from "../services/local/videoService";
import { getPlacesByUserId, getAllPlaces } from "../services/local/placeService";
import {
  calculateDistance,
  getCurrentLocation,
  reverseGeocode,
} from "../utils/locationUtils";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const LOCAL_ASSETS: Record<string, any> = {
  "image 1.jpg": require("../assets/images/image 1.jpg"),
  "image 2.jpg": require("../assets/images/image 2.jpg"),
  "image 3.jpg": require("../assets/images/image 3.jpg"),
  "image 4.jpg": require("../assets/images/image 4.jpg"),
  "image 5.jpg": require("../assets/images/image 5.jpg"),
  "image 6.jpg": require("../assets/images/image 6.jpg"),
  "image 7.jpg": require("../assets/images/image 7.jpg"),
  "image 8.jpg": require("../assets/images/image 8.jpg"),
  "image 9.jpg": require("../assets/images/image 9.jpg"),
  "image 10.jpg": require("../assets/images/image 10.jpg"),
  "image 11.jpg": require("../assets/images/image 11.jpg"),
  "image 12.jpg": require("../assets/images/image 12.jpg"),
  "test_video_4.mp4": require("../assets/images/test_video_4.mp4"),
};

const ExploreFeedScreen: React.FC = () => {
  const { user } = useAuth();
  const userID = typeof user === "string" ? null : (user?.user_id ?? null);

  const [feedData, setFeedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNoGps, setShowNoGps] = useState(false);
  const [bypassLocation, setBypassLocation] = useState(false);
  const [currentActiveIndex, setCurrentActiveIndex] = useState(0);

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentActiveIndex(viewableItems[0].index);
    }
  });

  const handleFavoriteToggle = async (
    placeId: string,
    isCurrentlyFavorite: boolean,
  ) => {
    if (!userID) {
      Alert.alert("Error", "You must be logged in to manage favorites.");
      return;
    }

    try {
      if (isCurrentlyFavorite) {
        const favArray = await getFavoritesByUserId(userID as number);
        const favorite = favArray.find(
          (f: any) => f.place_id === parseInt(placeId),
        );
        if (favorite && favorite.fav_id) {
          await removeFavorite(favorite.fav_id);
        }
      } else {
        await addFavorite({
          user_id: userID as number,
          place_id: parseInt(placeId),
        });
      }

      setFeedData((prev) =>
        prev.map((item) =>
          item.id === placeId
            ? { ...item, isFavorite: !isCurrentlyFavorite }
            : item,
        ),
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update favorite.");
    }
  };

  const fetchData = async () => {
    try {
      // For the Explore feed, we should probably fetch all public places.
      // If we want only user's places, we'd use getPlacesByUserId. Let's get all to make it a true feed.
      // But for now, since it's "My Places" but exploring, let's just get all places in local DB.
      const placesArray = await getAllPlaces();

      let userLocation: any = null;
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === "granted") {
          userLocation = await getCurrentLocation();
        }
      } catch (err) {}

      const enriched = await Promise.all(
        placesArray.map(async (item: any) => {
          let distanceStr = "Unknown distance";
          if (userLocation) {
            const dist = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              item.latitude,
              item.longitude,
            );
            distanceStr = dist < 1 ? `${(dist * 1000).toFixed(0)} m away` : `${dist.toFixed(1)} km away`;
          } else {
            const reverseResult = await reverseGeocode(item.latitude, item.longitude);
            if (reverseResult.success) {
              distanceStr = reverseResult.readableName;
            }
          }

          let isFavorited = false;
          if (userID) {
            isFavorited = await isFavorite(userID, item.place_id);
          }

          let mediaUrls: string[] = ["https://picsum.photos/400"];
          let mediaType: 'image' | 'video' | 'carousel' = 'image';

          // Try to get video first
          try {
            const videos = await getPlaceVideos(item.place_id);
            if (videos && videos.length > 0) {
              const primaryVideo = videos.find((v: any) => v.display_order === 0) || videos[0];
              if (primaryVideo.video_url) {
                if (LOCAL_ASSETS[primaryVideo.video_url]) {
                  mediaUrls = [LOCAL_ASSETS[primaryVideo.video_url]];
                } else {
                  mediaUrls = [primaryVideo.video_url.startsWith("http") || primaryVideo.video_url.startsWith("file://")
                      ? primaryVideo.video_url
                      : `${STATIC_BASE_URL}${primaryVideo.video_url}`];
                }
                mediaType = 'video';
              }
            }
          } catch (e) { console.log(e); }

          // If no video, get photos
          if (mediaType === 'image') {
            try {
              const photos = await getPlacePhotos(item.place_id);
              if (photos && photos.length > 0) {
                mediaUrls = photos.map((p: any) => {
                  if (LOCAL_ASSETS[p.photo_url]) return LOCAL_ASSETS[p.photo_url];
                  return p.photo_url.startsWith("http") || p.photo_url.startsWith("file://")
                    ? p.photo_url
                    : `${STATIC_BASE_URL}${p.photo_url}`;
                });
                mediaType = mediaUrls.length > 1 ? 'carousel' : 'image';
              }
            } catch (photoError) {
              console.log("Error fetching photos for place", item.place_id, photoError);
            }
          }

          return {
            id: String(item.place_id),
            place_id: item.place_id,
            title: item.title,
            description: item.description || "Beautiful spot to check out!",
            distance: distanceStr,
            tags: ["#travel", "#explore"], // Mock tags for now
            author: {
              name: "Traveler", // In a real app, fetch from user table
              avatarUrl: "https://i.pravatar.cc/150?u=" + item.user_id,
            },
            mediaUrls,
            mediaType,
            likes: Math.floor(Math.random() * 100), // Mock data
            comments: Math.floor(Math.random() * 20), // Mock data
            saves: Math.floor(Math.random() * 50), // Mock data
            isFavorite: isFavorited,
          };
        }),
      );

      setFeedData(enriched);
    } catch (err: any) {
      console.log("Fetch error:", err?.message || err);
      Alert.alert("Error", "Failed to load places");
    }
  };

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (status !== "granted" || !servicesEnabled) {
        setShowNoGps(true);
      } else {
        setShowNoGps(false);
      }
    } catch (error) {
      console.log("Error checking location permission:", error);
      setShowNoGps(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData().finally(() => setLoading(false));
      checkLocationPermission();
    }, [userID])
  );

  const handleEnableLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (status === "granted" && servicesEnabled) {
        setShowNoGps(false);
        setBypassLocation(false);
        setLoading(true);
        await fetchData();
        setLoading(false);
      } else {
        Alert.alert(
          "Location Required",
          "Please enable location services and grant permissions in your device settings to show nearby places.",
        );
      }
    } catch (error) {
      Alert.alert("Error", "Could not request location permission.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
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
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (showNoGps && !bypassLocation) {
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
              "#FFFFFF",
            ]}
            locations={[0, 0.42, 0.68, 0.85]}
            style={StyleSheet.absoluteFillObject}
          />
        </ImageBackground>

        <View style={styles.noGpsContent}>
          <View style={{ flex: 1.3 }} />
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
            TravelBuddy needs your location to show nearby places and hidden
            gems around you.
          </Text>
          <TouchableOpacity
            style={styles.enableButton}
            onPress={handleEnableLocation}
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
          <TouchableOpacity
            onPress={() => setBypassLocation(true)}
            activeOpacity={0.7}
            style={styles.browseButton}
          >
            <Text style={styles.browseButtonText}>Browse without location</Text>
          </TouchableOpacity>
          <View style={{ flex: 0.5 }} />
        </View>
      </View>
    );
  }

  if (feedData.length === 0) {
    return (
      <View style={styles.noSpotsContainer}>
        <ImageBackground
          source={require("../assets/images/image 7.jpg")}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0.92)",
              "#FFFFFF",
            ]}
            locations={[0, 0.42, 0.68, 0.85]}
            style={StyleSheet.absoluteFillObject}
          />
        </ImageBackground>

        <SafeAreaView style={styles.noSpotsHeader} edges={["top"]}>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.75}>
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0.45)",
                "rgba(255, 255, 255, 0.12)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIconBtnGradient}
            >
              <Ionicons name="search" size={20} color="#1E1E1E" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.noSpotsLogo}>TravelBuddy</Text>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.75}>
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0.45)",
                "rgba(255, 255, 255, 0.12)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIconBtnGradient}
            >
              <Ionicons name="menu" size={20} color="#1E1E1E" />
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.noSpotsContent}>
          <View style={{ flex: 1.1 }} />
          <View style={styles.glassBadge}>
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0.45)",
                "rgba(255, 255, 255, 0.08)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.glassBadgeGradient}
            >
              <Ionicons name="location" size={76} color="#E05638" />
            </LinearGradient>
          </View>
          <Text style={styles.noSpotsTitle}>No spots here yet</Text>
          <Text style={styles.noSpotsDescription}>
            Be the first to share an amazing place nearby!
          </Text>
          <TouchableOpacity
            style={styles.shareFirstButton}
            onPress={handleAddPlace}
            activeOpacity={0.85}
          >
            <Text style={styles.shareFirstButtonText}>
              Share the First Spot
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 0.6 }} />
        </View>

        <ImagePickerModal
          visible={isImagePickerVisible}
          onClose={() => setIsImagePickerVisible(false)}
          onImageSelected={handleImageSelected}
        />
        {isProcessing && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loaderText}>Fetching location details…</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Feed List */}
      <FlatList
        data={feedData}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <FeedItem
            item={item}
            isActive={index === currentActiveIndex}
            onLike={() => handleFavoriteToggle(item.id, item.isFavorite)}
            onComment={() => {
              router.push({
                pathname: "/place/[placeId]",
                params: { placeId: String(item.place_id) },
              });
            }}
            onSave={() => Alert.alert("Saved", "Place saved to your lists.")}
            onShare={() => Alert.alert("Share", "Sharing place...")}
            onProfile={() => Alert.alert("Profile", "Author profile...")}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={"white"}
            progressViewOffset={50}
          />
        }
      />

      {/* Glass Header Top Bar */}
      <SafeAreaView style={styles.feedHeader} edges={["top"]}>
        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.75}>
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.45)",
              "rgba(255, 255, 255, 0.12)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIconBtnGradient}
          >
            <Ionicons name="search" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={[styles.noSpotsLogo, { color: 'white' }]}>TravelBuddy</Text>
        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.75}>
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.45)",
              "rgba(255, 255, 255, 0.12)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIconBtnGradient}
          >
            <Ionicons name="menu" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>

      <ImagePickerModal
        visible={isImagePickerVisible}
        onClose={() => setIsImagePickerVisible(false)}
        onImageSelected={handleImageSelected}
      />

      {isProcessing && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loaderText}>Fetching location details…</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  feedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10,
  },
  /* --- Empty/No Spots Styles --- */
  noSpotsContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  noSpotsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10,
  },
  noSpotsLogo: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1E1E1E",
    letterSpacing: -0.5,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  headerIconBtnGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noSpotsContent: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 32,
    zIndex: 1,
  },
  glassBadge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 32,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  glassBadgeGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noSpotsTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E1E1E",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  noSpotsDescription: {
    fontSize: 15,
    color: "#4A4A4A",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
    fontWeight: "500",
  },
  shareFirstButton: {
    backgroundColor: "#FF5A36",
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 30,
    shadowColor: "#FF5A36",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  shareFirstButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  /* --- Loader --- */
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loaderText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  /* --- No GPS Styles --- */
  noGpsContainer: {
    flex: 1,
    backgroundColor: "#fff",
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
    backgroundColor: "rgba(255,255,255,0.8)",
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
    fontSize: 28,
    fontWeight: "800",
    color: "#1E1E1E",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  noGpsDescription: {
    fontSize: 15,
    color: "#4A4A4A",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 36,
    fontWeight: "500",
  },
  enableButton: {
    flexDirection: "row",
    backgroundColor: "#FF5A36",
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#FF5A36",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  enableButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  browseButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  browseButtonText: {
    color: "#FF5A36",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default ExploreFeedScreen;
