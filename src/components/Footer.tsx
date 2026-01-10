import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Footer: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.brand}><View style={styles.logo} /><Text style={styles.brandText}>TravelBuddy</Text></View>
      <Text style={styles.small}>Making every journey memorable, one pin at a time.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  brand: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logo: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F08A2D', marginRight: 8 },
  brandText: { fontWeight: '700' },
  small: { color: '#999', fontSize: 12 },
});

export default Footer;
