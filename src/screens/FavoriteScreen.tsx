import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert, ScrollView, RefreshControl } from 'react-native';
import { COLORS } from '../constants/index';
import { useAuth } from '../context/AuthContext';
import * as Location from "expo-location";
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/notepage/FilterChips';
import { router } from 'expo-router';
import FavoritesList from '../components/favorites/FavoritesList';
import { STATIC_BASE_URL } from '../config/config';
import { getFavoritesByUserId, removeFavorite } from '../services/favoriteService';
import { getPlacesByUserId } from '../services/placeService';

type FavoriteItem = {
  fav_id: number;
  user_id: number;
  place_id: number;
  synched: number;
  created_at: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  place_created_at: string;
};

type EnrichedFavorite = FavoriteItem & {
  location: string;
  rating: number;
  imageSource: { uri: string };
};

const getReadableLocation = async (lat: number, lng: number) => {
  try {
    const res = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (!res.length) return "Unknown location";
    const p = res[0];
    return `${p.city || p.region || "Unknown"}, ${p.country || ""}`;
  } catch {
    return "Unknown location";
  }
};

type FavoriteFilter = 'all' | 'synched' | 'unsynched';

const FavoritesPage: React.FC = () => {
  const { tokens, user } = useAuth();
  const [favorites, setFavorites] = useState<EnrichedFavorite[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FavoriteFilter>('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const userId = (user as any)?.user_id;
      const favoritesData = await getFavoritesByUserId(userId);
      const placesData = await getPlacesByUserId(userId);

      // Create a map of places for quick lookup
      const placesMap = new Map(placesData.map(place => [place.place_id, place]));

      const enriched: EnrichedFavorite[] = await Promise.all(
        favoritesData.slice(0, 10).map(async (favorite) => {
          const place = placesMap.get(favorite.place_id);
          if (!place) return null;

          let normalizedUrl: string;

          if (place.image_url) {
            if (place.image_url.startsWith("http") || place.image_url.startsWith("file://")) {
              normalizedUrl = place.image_url;
            } else {
              // Ensure leading slash when concatenating
              normalizedUrl = `${STATIC_BASE_URL}${place.image_url.startsWith("/") ? "" : "/"}${place.image_url}`;
            }
          } else {
            normalizedUrl = "https://picsum.photos/400";
          }

          console.log("Favorite image URL:", normalizedUrl);

          return {
            fav_id: favorite.fav_id,
            user_id: favorite.user_id,
            place_id: favorite.place_id,
            synched: favorite.synched || 0,
            created_at: favorite.created_at || new Date().toISOString(),
            title: place.title,
            description: place.description || '',
            latitude: place.latitude,
            longitude: place.longitude,
            image_url: place.image_url,
            place_created_at: place.created_at || new Date().toISOString(),
            location: await getReadableLocation(place.latitude, place.longitude),
            imageSource: { uri: normalizedUrl },
          } as EnrichedFavorite;
        })
      );

      setFavorites(enriched.filter(fav => fav !== null) as EnrichedFavorite[]);
    } catch (error) {
      console.error('Failed to load favorites', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleFilterChange = (filter: FavoriteFilter) => {
    setSelectedFilter(filter);
  };

  const filteredFavorites = favorites.filter(fav => {
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!fav.title.toLowerCase().includes(query) &&
        !fav.location.toLowerCase().includes(query) &&
        !fav.description.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Apply filter
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'synched') return fav.synched === 1;
    if (selectedFilter === 'unsynched') return fav.synched === 0;
    return true;
  });

  const handleToggleFavorite = async (favId: number) => {
    try {
      await removeFavorite(favId);
      setFavorites(prev => prev.filter(fav => fav.fav_id !== favId));
    } catch (error) {
      console.error('Failed to remove favorite', error);
      Alert.alert('Error', 'Failed to remove favorite');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header centerContent={<Text style={styles.headerTitle}>My Favorites</Text>} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.orange} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header centerContent={<Text style={styles.headerTitle}>My Favorites</Text>} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <View style={styles.content}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FilterChips selectedFilter={selectedFilter} onFilterChange={handleFilterChange} />
          {filteredFavorites.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {favorites.length === 0 ? 'No favorites yet' : 'No favorites match this filter'}
              </Text>
              <Text style={styles.emptySubtext}>
                {favorites.length === 0
                  ? 'Add some places to your favorites to see them here'
                  : 'Try changing the filter to see more favorites'}
              </Text>
            </View>
          ) : (
            <FavoritesList
              favorites={filteredFavorites.map(fav => ({
                id: fav.place_id,
                favId: fav.fav_id,
                title: fav.title,
                location: fav.location,
                date: formatDate(fav.created_at),
                imageSource: fav.imageSource,
                isFavorite: true,
                synched: fav.synched === 1,
              }))}
              onToggleFavorite={handleToggleFavorite}
              onPress={(placeId) =>
                router.push({
                  pathname: "/place/[placeId]",
                  params: { placeId: String(placeId) }, // ✅ pass place_id
                })
              }
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default FavoritesPage;

