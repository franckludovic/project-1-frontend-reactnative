import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
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
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Image source={source} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.location}>{location}</Text>
        <Text style={styles.savedDate}>{savedDate}</Text>
      </View>
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingIcon}>⭐</Text>
        <Text style={styles.rating}>{rating.toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, padding: 12, backgroundColor: '#F9F9F9', borderRadius: 12, alignItems: 'center' },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#0A0A0A', marginBottom: 4 },
  location: { fontSize: 12, color: '#999', marginBottom: 2 },
  savedDate: { fontSize: 11, color: '#CCC' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingIcon: { fontSize: 14 },
  rating: { fontSize: 14, fontWeight: '600', color: '#F39C12' },
});

export default FavoritePlaceCard;
