import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import FeatureCard from './FeatureCard';

const FeaturesList: React.FC = () => {
  return (
    <View style={styles.container}>
      <FeatureCard icon="📍" title="Offline GPS Tagging" description="Tag exact locations without needing a signal." />
      <FeatureCard icon="❤️" title="Save Favorites" description="Curate lists of your top spots." />
      <FeatureCard icon="📷" title="Photo Notes" description="Attach memories directly to your photos." />
      <FeatureCard icon="☁️" title="Cloud Backup" description="Auto-sync when you're back online." />
    </View>
  );
};

const styles = StyleSheet.create({ 
  container: { 
    paddingHorizontal: 24, 
    paddingVertical: 10,
    backgroundColor: COLORS.background,
  } 
});

export default FeaturesList;
