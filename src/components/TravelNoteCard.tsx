import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
const reactLogo = require('../assets/images/image 2.jpg');

type Props = {
  title: string;
  date: string;
  imageSource?: ImageSourcePropType;
  imageUrl?: string;
  onPress?: () => void;
};

const TravelNoteCard: React.FC<Props> = ({ title, date, imageSource, imageUrl, onPress }) => {
  const fallback = reactLogo;
  const source: any = imageSource ?? (imageUrl ? { uri: imageUrl } : fallback);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Image source={source} style={styles.image} />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.dateContainer}>
          <Text style={styles.dateIcon}>📅</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { width: 200, height: 180, borderRadius: 12, overflow: 'hidden', marginRight: 12, backgroundColor: '#F6F6F6' },
  image: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  content: { flex: 1, justifyContent: 'flex-end', padding: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 8 },
  dateContainer: { flexDirection: 'row', alignItems: 'center' },
  dateIcon: { fontSize: 14, marginRight: 4 },
  date: { fontSize: 12, color: '#fff' },
});

export default TravelNoteCard;
