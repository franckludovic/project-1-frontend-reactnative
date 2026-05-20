import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

const CTA: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ready to explore?</Text>
      <Text style={styles.subtitle}>Download TravelBuddy today to start mapping.</Text>
      
      <TouchableOpacity style={styles.storeButton} activeOpacity={0.9}>
        <Ionicons name="logo-apple" size={20} color={COLORS.primary} style={styles.btnIcon} />
        <Text style={styles.storeBtnText}>Download for iOS</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.storeButton, styles.secondaryBtn]} activeOpacity={0.9}>
        <Ionicons name="logo-google-playstore" size={18} color="#fff" style={styles.btnIcon} />
        <Text style={[styles.storeBtnText, styles.secondaryText]}>Download for Android</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    backgroundColor: COLORS.primary, 
    padding: 24, 
    marginHorizontal: 24,
    marginVertical: 14, 
    borderRadius: 24, 
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  title: { 
    fontSize: 22, 
    color: '#fff', 
    fontWeight: '800', 
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: { 
    color: 'rgba(255, 255, 255, 0.85)', 
    fontSize: 14,
    marginBottom: 20, 
    fontWeight: '500',
    textAlign: 'center',
  },
  storeButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 14, 
    marginBottom: 10, 
    width: '90%', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  secondaryBtn: { 
    backgroundColor: COLORS.primaryDark,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnIcon: { 
    marginRight: 10 
  },
  storeBtnText: { 
    color: COLORS.primary, 
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryText: { 
    color: '#fff' 
  },
});

export default CTA;
