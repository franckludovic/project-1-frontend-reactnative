import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
const splashIcon = require('../assets/images/splash-icon.jpg');

const Mockup: React.FC = () => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.phoneOuter}>
        <View style={styles.phoneInner}>
          <Image
            source={splashIcon}
            style={styles.phoneImage}
            resizeMode="cover"
          />
        </View>
      </View>
      
      {/* Floating Badges */}
      <View style={[styles.badge, styles.badgeLeft]}>
        <Ionicons name="heart" size={18} color={COLORS.primary} />
      </View>
      <View style={[styles.badge, styles.badgeRight]}>
        <Ionicons name="location" size={18} color={COLORS.accent} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { 
    alignItems: 'center', 
    marginVertical: 32,
    position: 'relative',
    backgroundColor: COLORS.background,
  },
  phoneOuter: {
    width: 250,
    height: 480,
    borderRadius: 36,
    padding: 8,
    backgroundColor: '#0F172A', // dark bezel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  phoneInner: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  phoneImage: { 
    width: '100%', 
    height: '100%' 
  },
  badge: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.05)',
  },
  badgeLeft: { 
    left: 20, 
    top: '35%', 
  },
  badgeRight: { 
    right: 20, 
    top: '50%', 
  },
});

export default Mockup;
