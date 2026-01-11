import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';

const { width } = Dimensions.get('window');

type Photo = {
  photo_id: number;
  photo_url: string;
  local_path: string | null;
  display_order: number;
};

type ImageCarouselProps = {
  photos: Photo[];
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({ photos }) => {
  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyImage} />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.carousel}
      contentContainerStyle={styles.carouselContent}
      snapToInterval={width * 0.85 + 16} // 85vw + gap
      decelerationRate="fast"
      snapToAlignment="center"
    >
      {photos.map((photo, index) => (
        <View key={photo.photo_id} style={styles.imageContainer}>
          <Image
            source={{ uri: photo.photo_url }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  carousel: {
    paddingVertical: 8,
  },
  carouselContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  imageContainer: {
    width: width * 0.85, // 85vw
    minWidth: 300, // sm:min-w-[300px]
    height: (width * 0.85) * 0.75, // aspect-[4/3] = 3/4 height
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  emptyImage: {
    width: width * 0.85,
    minWidth: 300,
    height: (width * 0.85) * 0.75,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
});

export default ImageCarousel;
