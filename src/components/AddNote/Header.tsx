import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {router } from 'expo-router';

interface HeaderProps {
  onReturn: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReturn }) => {
  return (
      <View style={styles.header}>
        <TouchableOpacity onPress={onReturn} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Note</Text>
        <TouchableOpacity style={styles.viewAllPill}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 20,
    backgroundColor: COLORS.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.stone200,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  viewAllPill: {
    backgroundColor: COLORS.primaryNote,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});

export default Header;
