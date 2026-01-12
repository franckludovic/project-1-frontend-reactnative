import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageSourcePropType, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
const reactLogo = require('../assets/images/image 2.jpg');

type Props = {
  title: string;
  location?: string;
  imageSource?: ImageSourcePropType;
  imageUrl?: string;
  onPress?: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  placeId?: number;
  synched?: boolean;
};

const PlaceCard: React.FC<Props> = ({ title, location, imageSource, imageUrl, onPress, onFavoritePress, isFavorite, placeId, synched }) => {
  const fallback = reactLogo;
  const source: any = imageSource ?? (imageUrl ? { uri: imageUrl } : fallback);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Image source={source} style={styles.image} />
      <View style={styles.overlay} />
      {synched !== undefined && (
        <View style={[styles.syncBadge, synched ? styles.synchedBadge : styles.unsynchedBadge]}>
          <Text style={styles.syncBadgeText}>{synched ? 'synched' : 'Unsynched'}</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={onFavoritePress}
        activeOpacity={0.7}
      >
        <Icon name={isFavorite ? 'heart' : 'heart-o'} size={20} color={isFavorite ? '#FF6B6B' : '#666'} />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {location && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location}>{location}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { width: 175, height: 175, borderRadius: 12, overflow: 'hidden', marginRight: 12, backgroundColor: '#F6F6F6' },
  image: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  favoriteButton: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 16, padding: 4 },
  disabledButton: { opacity: 0.5 },
  favoriteIcon: { fontSize: 16 },
  syncBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 12,
  },
  synchedBadge: {
    backgroundColor: '#10b981', // green
    width: 70,
    alignItems: 'center',
  },
  unsynchedBadge: {
    backgroundColor: '#f50b1fff', // red
    width: 80,
    alignItems: 'center',
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  content: { flex: 1, justifyContent: 'flex-end', padding: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 8 },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  locationIcon: { fontSize: 14, marginRight: 4 },
  location: { fontSize: 12, color: '#fff' },
});

export default PlaceCard;
