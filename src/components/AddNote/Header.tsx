import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface HeaderProps {
  onCancel: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCancel }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onCancel}>
        <Text style={styles.cancelButton}>Cancel</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>New Memory</Text>
      <TouchableOpacity>
        <Text style={styles.viewAllButton}>View All Notes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(248,249,250,0.8)',
    backdropFilter: 'blur(12px)',
  },
  cancelButton: {
    fontSize: 16,
    color: '#618689',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111718',
  },
  viewAllButton: {
    fontSize: 14,
    color: '#13daec',
    fontWeight: 'bold',
  },
});

export default Header;
