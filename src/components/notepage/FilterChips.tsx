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
        {filters.map((filter) => {
          const isSelected = selectedFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.chip,
                isSelected ? styles.selectedChip : styles.unselectedChip,
              ]}
              onPress={() => onFilterChange(filter.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.selectedChipText : styles.unselectedChipText
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  scrollContent: {
    alignItems: 'center',
    paddingRight: 24,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    marginRight: 10,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  unselectedChip: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.borderLight,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  selectedChipText: {
    color: '#fff',
  },
  unselectedChipText: {
    color: COLORS.textMuted,
  },
});

export default FilterChips;
