import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import Button from './Button';

type Props = {
  onGetStarted?: () => void;
  onViewDemo?: () => void;
};

const Hero: React.FC<Props> = ({ onGetStarted, onViewDemo }) => {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>✨ Discover & Sync Anywhere</Text>
      </View>
      <Text style={styles.title}>
        Your Personal <Text style={styles.highlight}>Offline</Text> Travel Journal
      </Text>
      <Text style={styles.subtitle}>
        Save places, capture moments, and sync your memories to the cloud even when you're miles off the grid.
      </Text>

      <Button
        title="Get Started"
        onPress={onGetStarted ?? (() => {})}
        style={styles.ctaButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    paddingHorizontal: 24, 
    paddingTop: 24, 
    paddingBottom: 24, 
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  badge: { 
    backgroundColor: COLORS.emeraldLight, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  badgeText: { 
    color: COLORS.emeraldGreen, 
    fontSize: 12, 
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: { 
    fontSize: 34, 
    fontWeight: '800', 
    textAlign: 'center', 
    color: COLORS.textMain, 
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  highlight: { 
    color: COLORS.primary 
  },
  subtitle: { 
    fontSize: 15, 
    color: COLORS.textMuted, 
    textAlign: 'center', 
    marginTop: 14, 
    marginBottom: 28,
    lineHeight: 22,
    fontWeight: '500',
  },
  ctaButton: { 
    width: '80%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
});

export default Hero;
