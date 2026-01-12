import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants';

type FilterType = 'all' | 'synched' | 'unsynched';

type Props = {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
};

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All Notes' },
  { key: 'synched', label: 'Synched' },
  { key: 'unsynched', label: 'Unsynched' },
];

const FilterChips: React.FC<Props> = ({ selectedFilter, onFilterChange }) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.chip,
              selectedFilter === filter.key && styles.selectedChip,
            ]}
            onPress={() => onFilterChange(filter.key)}
            activeOpacity={0.7}
          >
            <Text
              style={selectedFilter === filter.key ? styles.selectedChipText : styles.chipText}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  scrollContent: {
    alignItems: 'center',
    paddingRight: 20,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    marginRight: 12,
  },
  selectedChip: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
    shadowColor: COLORS.orange,
    shadowOpacity: 0.25,
    elevation: 3,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  selectedChipText: {
    color: 'white',
  },
});

export default FilterChips;
