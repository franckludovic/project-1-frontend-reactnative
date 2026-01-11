import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Animated,
  PanResponder,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { COLORS } from "../constants";
import { useAuth } from "../context/AuthContext";
import { get } from "../services/api";

const { height } = Dimensions.get("window");

const PlacesScreen: React.FC = () => {
  const { tokens, user } = useAuth();

  const [activeTab, setActiveTab] = useState("Saved");
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  /* Bottom sheet */
  const [bottomSheetTopValue, setBottomSheetTopValue] = useState(height * 0.15);
  const bottomSheetTop = useRef(new Animated.Value(height * 0.15)).current;
  const mapHeight = useRef(new Animated.Value(height * 0.15)).current;

  /* Reverse geocode */
  const getReadableLocation = async (lat: number, lng: number) => {
    try {
      const res = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      if (!res.length) return "Unknown location";

      const p = res[0];
      return `${p.city || p.region || "Unknown"}, ${p.country || ""}`;
    } catch {
      return "Unknown location";
    }
  };

  /* Fetch data */
  useEffect(() => {
    if (!tokens?.accessToken) return;

    const fetchData = async () => {
      try {
        // Favorites
        const favRes = await get("favorites", {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });

        const favArray = Array.isArray(favRes.data)
          ? favRes.data
          : favRes.data?.data ?? [];

        setSavedPlaces(
          favArray.map((item: any) => ({
            id: String(item.place_id),
            title: item.title,
            subtitle: item.description || "No description",
            image: { uri: item.image_url || "https://picsum.photos/400" },
            latitude: item.latitude || 0,
            longitude: item.longitude || 0,
            timestamp: item.created_at || new Date().toISOString(),
          }))
        );

        // My places
        const res = await get("places/me", {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });

        const placesArray = Array.isArray(res.data)
          ? res.data
          : res.data?.data ?? [];

        const enriched = await Promise.all(
          placesArray.slice(0, 10).map(async (item: any) => ({
            id: String(item.place_id),
            title: item.title,
            location: await getReadableLocation(item.latitude, item.longitude),
            rating: item.rating ?? 4.5,
            isFavorite: item.is_favorite ?? false,
            image: { uri: item.image_url || "https://picsum.photos/400" },
            latitude: item.latitude,
            longitude: item.longitude,
            timestamp: item.created_at || new Date().toISOString(),
          }))
        );

        setRecentlyViewed(enriched);
      } catch (err: any) {
        console.log("Fetch error:", err?.response?.data || err.message);
      }
    };

    fetchData();
  }, [tokens?.accessToken]);

  /* Bottom sheet drag */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const newTop = bottomSheetTopValue + g.dy;
        const clamped = Math.max(80, Math.min(newTop, height - 80));
        bottomSheetTop.setValue(clamped);
        mapHeight.setValue(clamped);
      },
      onPanResponderRelease: (_, g) => {
        const newTop = bottomSheetTopValue + g.dy;
        const target = newTop < height / 2 ? height * 0.15 : height - 80;
        setBottomSheetTopValue(target);

        Animated.spring(bottomSheetTop, {
          toValue: target,
          useNativeDriver: false,
        }).start();
        Animated.spring(mapHeight, {
          toValue: target,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  /* Camera */
  const openCamera = async () => {
    try {
      setIsProcessing(true);

      const camPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (!camPerm.granted) {
        Alert.alert("Permission required", "Camera permission is required");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled) return;

      const locPerm = await Location.requestForegroundPermissionsAsync();
      if (locPerm.status !== "granted") {
        Alert.alert("Permission required", "Location permission is required");
        return;
      }

      const location =
        (await Location.getLastKnownPositionAsync()) ||
        (await Location.getCurrentPositionAsync({}));

      router.push({
        pathname: "/CreatePlace",
        params: {
          imageUri: result.assets[0].uri,
          latitude: location.coords.latitude.toString(),
          longitude: location.coords.longitude.toString(),
          timestamp: new Date().toISOString(),
        },
      });

    } catch {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  const tabs = ["Saved", "Nearby", "Bucket List"];

  return (
    <SafeAreaView style={styles.container}>
      {/* Map */}
      <Animated.Image
        source={require("../assets/images/image 13 map.png")}
        style={[styles.mapImage, { height: mapHeight }]}
        resizeMode="cover"
      />

      {/* Bottom sheet */}
      <Animated.View style={[styles.bottomSheet, { top: bottomSheetTop }]}>
        <View style={styles.handle} {...panResponder.panHandlers} />

        {/* Tabs */}
        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Recently Viewed */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recently Viewed</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentlyViewed.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push({
                      pathname: "/place/[placeId]",
                      params: { placeId: JSON.stringify(item) },
                    })
                  }
                >
                  <ImageBackground source={item.image} style={styles.cardImage}>
                    {/* Favorite */}
                    <TouchableOpacity
                      style={styles.favoriteIcon}
                      onPress={() => console.log("Favorite:", item.id)}
                    >
                      <Icon
                        name={item.isFavorite ? "heart" : "heart-o"}
                        size={18}
                        color={item.isFavorite ? "red" : "#333"}
                      />
                    </TouchableOpacity>

                    {/* Rating */}
                    <View style={styles.ratingBottom}>
                      <Text style={styles.ratingText}>⭐ {item.rating}</Text>
                    </View>
                  </ImageBackground>

                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.locationText} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Saved */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Saved Places</Text>
            {savedPlaces.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.listItem}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/place/[placeId]",
                    params: { placeId: JSON.stringify(item) },
                  })
                }
              >
                <ImageBackground source={item.image} style={styles.listImage} />
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>{item.title}</Text>
                  <Text style={styles.listSubtitle}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Camera */}
      <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
        <Icon name="camera" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Loader */}
      {isProcessing && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loaderText}>Preparing place…</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    transform: [{ scale: 1.03 }],
  },
  bottomSheet: {
    position: "absolute",
    top: height * 0.15, // Takes more screen space
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  mapImage: {
    width: "100%",
    height: 120,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111418",
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  horizontalScroll: {
    marginBottom: 8,
  },
  card: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  cardImage: {
    height: 128,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
    color: "#fff",
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111418",
  },
  cardLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationIcon: { fontSize: 14, color: "#617589" },
  locationText: {
    fontSize: 14,
    color: "#617589",
    marginLeft: 4,
  },
  listItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  listImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111418",
  },
  listSubtitle: {
    fontSize: 14,
    color: "#617589",
    marginTop: 2,
  },
  listMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
    backgroundColor: "rgba(10,132,255,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  distanceText: {
    fontSize: 12,
    color: "#617589",
  },
  directionsButton: {
    padding: 8,
  },
  directionsIcon: { fontSize: 20, color: "#999" },
  cameraButton: {
    position: "absolute",
    bottom: 100,
    right: 16,
    width: 60,
    height: 60,
    backgroundColor: "#007AFF",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loaderText: { marginTop: 12, color: "#fff", fontSize: 16, fontWeight: "500" },
  favoriteIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 16,
  },
  ratingBottom: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});

export default PlacesScreen;
