import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Colors extracted from the HTML Tailwind Config
const COLORS = {
  primary: '#fb923c',
  primaryDark: '#ea580c',
  backgroundLight: '#fafaf9',
  surfaceLight: '#ffffff',
  surfaceDark: '#292524',
  stone900: '#1c1917',
  stone600: '#57534e',
  stone400: '#a8a29e',
  stone200: '#e7e5e4',
  amber50: '#fffbeb',
  amber100: '#fef3c7',
  amber600: '#d97706',
  emerald50: '#ecfdf5',
  emerald100: '#d1fae5',
  emerald500: '#10b981',
  emerald600: '#059669',
  emerald700: '#047857',
};

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
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About this place</Text>
        <Text style={styles.descriptionText}>
          {place.subtitle || "No description available."}
        </Text>

        {/* Coordinates Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <View style={styles.iconCircle}>
              <Icon name="near-me" size={18} color={COLORS.stone600} />
            </View>
            <View>
              <Text style={styles.infoLabel}>COORDINATES</Text>
              <Text style={styles.infoValue}>{place.latitude}° N, {place.longitude}° W</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.iconCircle}>
              <Icon name="schedule" size={18} color={COLORS.stone600} />
            </View>
            <View>
              <Text style={styles.infoLabel}>STATUS</Text>
              <Text style={[styles.infoValue, { color: COLORS.emerald600 }]}>Open Now</Text>
            </View>
          </View>
        </View>

        {/* Map Preview */}
        <View style={styles.mapContainer}>
          <ImageBackground
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbR3lbYtux5NJN37woD7XKvk0eFNhj7YeA_sOYmlOwtz7wLg9lJ8EYUaDFEZ8fwW59otcPxgaDz8ZV3ClerU6Z_4Noz2wmVSR-uLnm0urDf2ZIdS2ysk4jw5ejIywjzRF9XjSNnsIwClAJ1HLyOuh0u0ANtK5wIsqo_EBjrGZgeVbjNlk8y3oNnhFFVXDBYrlZtBAIxyIjQTwWqFD-RDBLwlZ_sdeP_dVIPsL6vRGbb2d9x7I-A2ryuqH6UDyH5yGrVUsx_m6dD9hL',
            }}
            style={styles.mapImage}
            imageStyle={{ opacity: 0.8 }}
          >
            <View style={styles.mapPin}>
              <Icon name="location-pin" size={14} color="#fff" />
            </View>
            <TouchableOpacity style={styles.viewMapBtn}>
              <Text style={styles.viewMapText}>View Full Map</Text>
            </TouchableOpacity>
          </ImageBackground>
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
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.stone200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.stone900,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.stone600,
    lineHeight: 22,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.stone400,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.stone600,
  },
  mapContainer: {
    height: 128,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.stone200,
  },
  mapImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  viewMapBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewMapText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.stone900,
  },
});

export default AboutSection;
