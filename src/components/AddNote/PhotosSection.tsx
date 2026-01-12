import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Photo = { uri: string };

interface PhotosSectionProps {
  photos: Photo[];
  onAddPhoto: () => void;
  onRemovePhoto: (index: number) => void;
  coords?: { latitude: number; longitude: number } | null;
  timestamp?: Date | null;
}

const PhotosSection: React.FC<PhotosSectionProps> = ({ photos, onAddPhoto, onRemovePhoto, coords, timestamp }) => {
  const formatTimestamp = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Photos</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <TouchableOpacity style={styles.addButton} onPress={onAddPhoto}>
          <View style={styles.addIconContainer}>
            <Icon name="camera-alt" size={20} color="#13daec" />
          </View>
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>

        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={photo} style={styles.photo} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemovePhoto(index)}
            >
              <Icon name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number' && timestamp && (
        <View style={styles.pillContainer}>
          <TouchableOpacity style={styles.pillButton}>
            <Text style={styles.pillText}>
              Lat: {coords.latitude.toFixed(4)}, Lon: {coords.longitude.toFixed(4)} | {formatTimestamp(timestamp)}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111718',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  seeAllText: {
    fontSize: 14,
    color: '#13daec',
    fontWeight: '500',
  },
  scroll: {
    marginBottom: 8,
  },
  addButton: {
    width: 96,
    height: 128,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  addIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  photoContainer: {
    width: 128,
    height: 128,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  pillButton: {
    backgroundColor: '#13daec',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
});

export default PhotosSection;
