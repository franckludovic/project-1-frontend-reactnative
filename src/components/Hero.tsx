import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants';

const Hero: React.FC<{ onGetStarted?: () => void; onViewDemo?: () => void }> = ({ onGetStarted, onViewDemo }) => {
  return (
    <View style={styles.container}>
      <View style={styles.badge}><Text style={styles.badgeText}>Na Your App This, Usamm Bitch</Text></View>
      <Text style={styles.title}>Your Personal <Text style={styles.highlight}>Offline</Text>Travel Journal</Text>
      <Text style={styles.subtitle}>Save places, capture moments, and nsync your memories to the cloud neven when you're miles off the grid.</Text>

      <TouchableOpacity style={styles.cta} onPress={onGetStarted}><Text style={styles.ctaText}>Get Started</Text></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20, alignItems: 'center' },
  badge: { backgroundColor: '#EEF9F2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginBottom: 12 },
  badgeText: { color: '#18A66B', fontSize: 12 },
  title: { fontSize: 32, fontWeight: '700', textAlign: 'center', color: '#0A0A0A', lineHeight: 40 },
  highlight: { color: COLORS.orange },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 12, marginBottom: 20 },
  cta: { backgroundColor: COLORS.orange, paddingVertical: 14, paddingHorizontal: 36, borderRadius: 30, width: '70%', alignItems: 'center', marginBottom: 10 },
  ctaText: { color: '#fff', fontWeight: '600' },
  ghost: { borderWidth: 1, borderColor: '#E6E6E6', paddingVertical: 12, paddingHorizontal: 36, borderRadius: 30, width: '70%', alignItems: 'center' },
  ghostText: { color: '#333' },
});

export default Hero;
