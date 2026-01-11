import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ActionButtonsProps {
  onLocationPress: () => void;
  locationEnabled: boolean;
  locationLabel: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onLocationPress,
  locationEnabled,
  locationLabel,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.actionButton} onPress={onLocationPress}>
        <Icon name="my-location" size={20} color="#13daec" />
        <Text style={styles.actionButtonText}>
          {locationEnabled ? locationLabel : 'Add Location'}
        </Text>
      </TouchableOpacity>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111718',
  },
});

export default ActionButtons;
