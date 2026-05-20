import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

const Footer: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <View style={styles.logoFrame}>
          <Ionicons name="compass" size={14} color="#fff" />
        </View>
        <Text style={styles.brandText}>TravelBuddy</Text>
      </View>
      <Text style={styles.small}>Making every journey memorable, one pin at a time.</Text>
      <Text style={styles.copyright}>&copy; {new Date().getFullYear()} TravelBuddy. All rights reserved.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    alignItems: 'center', 
    paddingVertical: 32,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.05)',
    marginTop: 20,
  },
  brand: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8,
    gap: 6,
  },
  logoFrame: { 
    width: 22, 
    height: 22, 
    borderRadius: 6, 
    backgroundColor: COLORS.primary, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  brandText: { 
    fontWeight: '800',
    color: COLORS.textMain,
    fontSize: 13,
    letterSpacing: -0.2,
  },
  small: { 
    color: COLORS.textMuted, 
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  copyright: {
    color: COLORS.textLight,
    fontSize: 10,
    fontWeight: '500',
  },
});

export default Footer;
