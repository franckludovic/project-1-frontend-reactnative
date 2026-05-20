import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
const partialReactLogo = require('../assets/images/image 1.jpg');

type Props = {
  title: string;
  location: string;
  rating: number;
  imageSource?: ImageSourcePropType;
  imageUrl?: string;
  savedDate: string;
  onPress?: () => void;
};

const FavoritePlaceCard: React.FC<Props> = ({ title, location, rating, imageSource, imageUrl, savedDate, onPress }) => {
  const fallback = partialReactLogo;
  const source: any = imageSource ?? (imageUrl ? { uri: imageUrl } : fallback);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Image source={source} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={COLORS.textLight} style={styles.locationIcon} />
          <Text style={styles.location} numberOfLines={1}>{location}</Text>
        </View>
        <Text style={styles.savedDate}>Saved {savedDate}</Text>
      </View>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={14} color={COLORS.amberGold} />
        <Text style={styles.rating}>{rating.toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row', 
    marginHorizontal: 20, 
    marginBottom: 12, 
    padding: 12, 
    backgroundColor: COLORS.surfaceLight, 
    borderRadius: 16, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  image: { 
    width: 64, 
    height: 64, 
    borderRadius: 12, 
    marginRight: 12,
    backgroundColor: COLORS.stone200,
  },
  content: { 
    flex: 1 
  },
  title: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: COLORS.textMain, 
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    marginRight: 3,
  },
  location: { 
    fontSize: 12, 
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  savedDate: { 
    fontSize: 11, 
    color: COLORS.textLight,
    fontWeight: '500',
  },
  ratingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.amberLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  rating: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: COLORS.amberGold 
  },
});

export default FavoritePlaceCard;
