import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import MapView, { Marker, UrlTile } from 'react-native-maps';

type Place = {
  id: string;
  title: string;
  location: string;
  category: string;
  rating: number;
  image: any;
  latitude: number;
  longitude: number;
  subtitle?: string;
  synched?: number;
};

type AboutSectionProps = {
  place: Place;
};

const AboutSection: React.FC<AboutSectionProps> = ({ place }) => {
  const mapRegion = {
    latitude: place.latitude,
    longitude: place.longitude,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About this place</Text>
        <Text style={styles.descriptionText}>
          {place.subtitle || "No description provided for this destination."}
        </Text>

        {/* Coordinates Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <View style={styles.iconCircle}>
              <Ionicons name="location-sharp" size={16} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.infoLabel}>COORDINATES</Text>
              <Text style={styles.infoValue}>{place.latitude.toFixed(4)}° N, {place.longitude.toFixed(4)}° W</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.iconCircle}>
              <Ionicons name="time-sharp" size={16} color={COLORS.accent} />
            </View>
            <View>
              <Text style={styles.infoLabel}>STATUS</Text>
              <Text style={[styles.infoValue, { color: COLORS.emeraldGreen }]}>Visited</Text>
            </View>
          </View>
        </View>

        {/* Map Preview */}
        <View style={styles.mapContainer}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={mapRegion}
            zoomEnabled={false}
            scrollEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            mapType="none"
          >
            <UrlTile
              urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
            />
            <Marker
              coordinate={{ latitude: place.latitude, longitude: place.longitude }}
              pinColor={COLORS.primary}
            />
          </MapView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  card: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  descriptionText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 18,
    fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMain,
    marginTop: 2,
  },
  mapContainer: {
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    position: 'relative',
  },
});

export default AboutSection;
