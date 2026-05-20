import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants';

const reactLogo = require('../assets/images/image 2.jpg');

type Props = {
  title: string;
  location?: string;
  imageUrl?: string;
  onPress?: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  placeId?: number;
  synched?: boolean;
};

const PlaceCard: React.FC<Props> = ({
  title,
  location,
  imageUrl,
  onPress,
  onFavoritePress,
  isFavorite,
  synched,
}) => {
  const fallback = reactLogo;
  const source = imageUrl ? { uri: imageUrl } : fallback;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      <Image source={source} style={styles.image} />
      
      {/* Dynamic Linear Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(15, 23, 42, 0.85)']}
        style={styles.gradientOverlay}
      />

      {synched !== undefined && (
        <View style={[styles.syncBadge, synched ? styles.synchedBadge : styles.unsynchedBadge]}>
          <Text style={styles.syncBadgeText}>{synched ? 'Synced' : 'Offline'}</Text>
        </View>
      )}

      {onFavoritePress && (
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoritePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? COLORS.primary : COLORS.textMuted}
          />
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={12} color="#fff" style={styles.locationIcon} />
            <Text style={styles.location} numberOfLines={1}>{location}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 175,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 14,
    backgroundColor: COLORS.stone200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  image: { 
    ...StyleSheet.absoluteFillObject, 
    width: '100%', 
    height: '100%' 
  },
  gradientOverlay: { 
    ...StyleSheet.absoluteFillObject 
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  syncBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  synchedBadge: {
    backgroundColor: COLORS.emeraldGreen,
  },
  unsynchedBadge: {
    backgroundColor: COLORS.redAlert,
  },
  syncBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  content: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    padding: 14 
  },
  title: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#fff', 
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  locationContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  locationIcon: { 
    marginRight: 3 
  },
  location: { 
    fontSize: 11, 
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
});

export default PlaceCard;
