import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: COLORS.surfaceLight, 
    padding: 16, 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 6, 
    width: '100%', 
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  iconContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 12, 
    backgroundColor: COLORS.primaryLight, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 14 
  },
  iconText: { 
    fontSize: 20 
  },
  body: { 
    flex: 1 
  },
  title: { 
    fontWeight: '800', 
    color: COLORS.textMain,
    fontSize: 15,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  desc: { 
    color: COLORS.textMuted, 
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default FeatureCard;
