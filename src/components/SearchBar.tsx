import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

const SearchBar: React.FC<Props> = ({ value, onChangeText, placeholder = "Search by place, date, or tags..." }) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textLight} />
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
        />
        {value.length > 0 && (
          <Ionicons 
            name="close-circle" 
            size={18} 
            color={COLORS.textLight} 
            onPress={() => onChangeText('')}
            style={styles.clearIcon}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: '100%',
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  iconContainer: {
    paddingLeft: 16,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textMain,
    paddingVertical: 0,
    fontWeight: '500',
  },
  clearIcon: {
    paddingHorizontal: 12,
  },
});

export default SearchBar;
