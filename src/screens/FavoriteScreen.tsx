import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../constants/index';
import { useAuth } from '../context/AuthContext';
import * as Location from "expo-location";
import api from '../services/api';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/notepage/FilterChips';
import { router } from 'expo-router';
import FavoritesList from '../components/favorites/FavoritesList';

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
  const { tokens } = useAuth();
  const [favorites, setFavorites] = useState<EnrichedFavorite[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FavoriteFilter>('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    if (!tokens?.accessToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/favorites', {
        headers: { 'Authorization': `Bearer ${tokens.accessToken}` }
      });

      const enriched: EnrichedFavorite[] = await Promise.all(
        response.data.slice(0, 10).map(async (item: FavoriteItem) => ({
          ...item,
          location: await getReadableLocation(item.latitude, item.longitude),
          imageSource: { uri: item.image_url || "https://picsum.photos/400" },
        }))
      );

      setFavorites(enriched);
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
      await api.delete(`/favorites/${favId}`, {
        headers: { 'Authorization': `Bearer ${tokens?.accessToken}` }
      });
      setFavorites(prev => prev.filter(fav => fav.fav_id !== favId));
    } catch (error) {
      console.error('Failed to remove favorite', error);
      Alert.alert('Error', 'Failed to remove favorite');
    }
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
              id: fav.place_id,       // ✅ place_id for navigation
              favId: fav.fav_id,      // ✅ fav_id for deletion
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

