import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants';

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
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      <Image source={source} style={styles.image} />
      
      {/* Premium Linear Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(15, 23, 42, 0.85)']}
        style={styles.gradientOverlay}
      />

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={13} color="rgba(255, 255, 255, 0.85)" style={styles.dateIcon} />
          <Text style={styles.date}>{date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { 
    width: 180, 
    height: 180, 
    borderRadius: 20, 
    overflow: 'hidden', 
    marginRight: 14, 
    backgroundColor: COLORS.stone200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
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
  content: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    padding: 14 
  },
  title: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: '#fff', 
    marginBottom: 6,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  dateContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  dateIcon: { 
    marginRight: 4 
  },
  date: { 
    fontSize: 11, 
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
});

export default TravelNoteCard;
