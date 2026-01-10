import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

const CTA: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ready to explore?</Text>
      <Text style={styles.subtitle}>Download TravelBuddy today.</Text>
      <TouchableOpacity style={styles.primary}><Text style={styles.primaryText}>iOS  App Store</Text></TouchableOpacity>
      <TouchableOpacity style={styles.secondary}><Text style={styles.secondaryText}>Play Store</Text></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.orange, padding: 20, margin: 20, borderRadius: 18, alignItems: 'center' },
  title: { fontSize: 20, color: '#fff', fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#fff', marginBottom: 12 },
  primary: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, marginBottom: 10, width: '80%', alignItems: 'center' },
  primaryText: { color: COLORS.orange, fontWeight: '600' },
  secondary: { backgroundColor: '#C46F1A', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, width: '80%', alignItems: 'center' },
  secondaryText: { color: '#fff', fontWeight: '600' },
});

export default CTA;
