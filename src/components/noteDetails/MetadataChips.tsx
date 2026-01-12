import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type MetadataChipsProps = {
  location: string;
  date: string;
};

const MetadataChips: React.FC<MetadataChipsProps> = ({ location, date }) => {
  return (
    <View style={styles.container}>
      {/* Location Chip */}
      <TouchableOpacity style={styles.locationChip}>
        <MaterialIcons name="location-on" size={18} color="#ee9d2b" />
        <Text style={styles.locationText}>{location}</Text>
      </TouchableOpacity>

      {/* Date Chip */}
      <View style={styles.dateChip}>
        <MaterialIcons name="calendar-today" size={18} color="#64748b" />
        <Text style={styles.dateText}>{date}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 16,
    flexWrap: 'wrap',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(238, 157, 43, 0.1)', // bg-primary/10
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minHeight: 36,
  },
  locationText: {
    color: '#ee9d2b', // text-primary
    fontSize: 13,
    fontWeight: '700',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#f1f5f9', // bg-slate-100
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // dark:border-white/10
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minHeight: 36,
  },
  dateText: {
    color: '#475569', // text-slate-600
    fontSize: 13,
    fontWeight: '500',
  },
});

export default MetadataChips;
