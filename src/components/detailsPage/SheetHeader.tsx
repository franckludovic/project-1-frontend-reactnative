import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

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

type SheetHeaderProps = {
  place: Place;
};

const SheetHeader: React.FC<SheetHeaderProps> = ({ place }) => {
  return (
    <View style={styles.sheetHeader}>
      <View style={styles.dragHandle} />
      <View style={styles.statusBadge}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>{place.synched === 1 ? 'synched' : 'Not synched'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
    position: 'relative',
    height: 40,
  },
  dragHandle: {
    width: 48,
    height: 6,
    backgroundColor: COLORS.stone200,
    borderRadius: 3,
  },
  statusBadge: {
    position: 'absolute',
    right: 24,
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emerald50,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.emerald100,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald500,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.emerald700,
  },
});

export default SheetHeader;
