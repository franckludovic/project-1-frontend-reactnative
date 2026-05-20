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
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import ImageCarousel from '../noteDetails/ImageCarousel';

const { width, height } = Dimensions.get('window');

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

  const renderTopBar = () => (
    <SafeAreaView style={styles.topBarSafe}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.glassButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.glassButton} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.glassButton} onPress={toggleFavorite} activeOpacity={0.8}>
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite ? COLORS.redAlert : "#fff"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  const renderHeroContent = () => (
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
              <Ionicons name="star" size={14} color={COLORS.amberGold} style={styles.starIcon} />
              <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      )}
      <Text style={styles.heroTitle}>{place.title}</Text>
      {place.location && (
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" style={styles.locIcon} />
          <Text style={styles.heroSubtitle} numberOfLines={2}>
            {place.location}
          </Text>
        </View>
      )}
    </View>
  );

  if (photos.length > 0) {
    return (
      <View style={styles.carouselContainer}>
        <ImageCarousel photos={photos} />
        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.8)']}
          style={StyleSheet.absoluteFillObject}
        />
        {renderTopBar()}
        {renderHeroContent()}
      </View>
    );
  }

  return (
    <View style={styles.heroContainer}>
      <ImageBackground
        source={{ uri: place.image_url || "https://picsum.photos/800/600" }}
        style={styles.heroImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.4)', 'transparent', 'rgba(15, 23, 42, 0.85)']}
          style={StyleSheet.absoluteFillObject}
        />
        {renderTopBar()}
        {renderHeroContent()}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    height: height * 0.45,
    width: '100%',
  },
  carouselContainer: {
    height: height * 0.45,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  topBarSafe: {
    zIndex: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  glassButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 70, // Adjust to overlap correctly with sheet details
    left: 24,
    right: 24,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  tagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  starIcon: {
    marginRight: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locIcon: {
    marginTop: 1,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    lineHeight: 18,
    maxWidth: '92%',
  },
});

export default HeroSection;
