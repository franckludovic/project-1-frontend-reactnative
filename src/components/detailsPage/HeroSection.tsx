import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImageCarousel from '../noteDetails/ImageCarousel';

const { width, height } = Dimensions.get('window');

// Colors extracted from the HTML Tailwind Config
const COLORS = {
  primary: '#fb923c',
  primaryDark: '#ea580c',
  backgroundLight: '#fafaf9',
  surfaceLight: '#ffffff',
  surfaceDark: '#292524',
  stone900: '#1c1917',
  stone600: '#57534e',
  stone400: '#a8a29e',
  stone200: '#e7e5e4',
  amber50: '#fffbeb',
  amber100: '#fef3c7',
  amber600: '#d97706',
  emerald50: '#ecfdf5',
  emerald100: '#d1fae5',
  emerald500: '#10b981',
  emerald600: '#059669',
  emerald700: '#047857',
};

type Place = {
  place_id?: number;
  id?: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  synched?: number;
  created_at?: string;
  updated_at?: string;
  user_id?: number;
  // Legacy fields for backward compatibility
  location?: string;
  category?: string;
  rating?: number;
  image_url?: string;
  subtitle?: string;
};

type PlacePhoto = {
  photo_id?: number;
  place_id: number;
  photo_url?: string;
  local_path?: string | null;
  display_order?: number;
};

type HeroSectionProps = {
  place: Place;
  photos?: PlacePhoto[];
};

const HeroSection: React.FC<HeroSectionProps> = ({ place, photos = [] }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // If there are photos, use the ImageCarousel
  if (photos.length > 0) {
    return (
      <View style={styles.carouselContainer}>
        <ImageCarousel photos={photos} />
        <View style={styles.carouselOverlay} />

        {/* Top Bar (Back & Share) */}
        <SafeAreaView style={styles.topBarSafe}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.glassButton} onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.rightIcons}>
              <TouchableOpacity style={styles.glassButton}>
                <Icon name="ios-share" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.glassButton} onPress={toggleFavorite}>
                <Icon name={isFavorite ? "favorite" : "favorite-border"} size={20} color={isFavorite ? "#ff6b6b" : "#fff"} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        {/* Bottom Hero Content */}
        <View style={styles.heroContent}>
          {(place.category || place.rating) && (
            <View style={styles.tagsRow}>
              {place.category && (
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{place.category}</Text>
                </View>
              )}
              {place.rating && (
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color="#fbbf24" />
                  <Text style={styles.ratingText}>{place.rating}</Text>
                </View>
              )}
            </View>
          )}
          <Text style={styles.heroTitle}>{place.title}</Text>
          {place.location && (
            <Text style={styles.heroSubtitle} numberOfLines={2}>
              {place.location}
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Default single image view
  return (
    <View style={styles.heroContainer}>
      <ImageBackground
        source={{ uri: place.image_url || "https://picsum.photos/400" }}
        style={styles.heroImage}
        resizeMode="cover"
      >

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.3)']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.heroOverlay}
        />

        {/* Top Bar (Back & Share) */}
        <SafeAreaView style={styles.topBarSafe}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.glassButton} onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.rightIcons}>
              <TouchableOpacity style={styles.glassButton}>
                <Icon name="ios-share" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.glassButton} onPress={toggleFavorite}>
                <Icon name={isFavorite ? "favorite" : "favorite-border"} size={20} color={isFavorite ? "#ff6b6b" : "#fff"} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        {/* Bottom Hero Content */}
        <View style={styles.heroContent}>
          {(place.category || place.rating) && (
            <View style={styles.tagsRow}>
              {place.category && (
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{place.category}</Text>
                </View>
              )}
              {place.rating && (
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color="#fbbf24" />
                  <Text style={styles.ratingText}>{place.rating}</Text>
                </View>
              )}
            </View>
          )}
          <Text style={styles.heroTitle}>{place.title}</Text>
          {place.location && (
            <Text style={styles.heroSubtitle} numberOfLines={2}>
              {place.location}
            </Text>
          )}
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    height: height * 0.4,
    width: '100%',
  },
  carouselContainer: {
    height: height * 0.4,
    width: '100%',
    position: 'relative',
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topBarSafe: {
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'android' ? 20 : 0,
  },
  rightIcons: {
    flexDirection: 'column',
    gap: 8,
  },
  glassButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 70, // Pushed up slightly to accommodate sheet overlap
    left: 24,
    right: 24,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tagBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#e7e5e4',
    fontWeight: '500',
    lineHeight: 20,
    maxWidth: '90%',
  },
});

export default HeroSection;
