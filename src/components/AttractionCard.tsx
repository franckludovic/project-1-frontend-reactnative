import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

type Props = {
  title: string;
  description: string;
  distance: string;
  icon: string;
  onPress?: () => void;
};

const AttractionCard: React.FC<Props> = ({ title, description, distance, icon, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={styles.distanceBadge}>
            <Ionicons name="navigate-outline" size={11} color={COLORS.primary} style={styles.distanceIcon} />
            <Text style={styles.distance}>{distance}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row', 
    marginHorizontal: 20, 
    marginBottom: 12, 
    padding: 14, 
    backgroundColor: COLORS.surfaceLight, 
    borderRadius: 16, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  iconContainer: { 
    width: 52, 
    height: 52, 
    backgroundColor: COLORS.primaryLight, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 14,
  },
  icon: { 
    fontSize: 24 
  },
  content: { 
    flex: 1 
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  title: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: COLORS.textMain,
    flex: 1,
    letterSpacing: -0.2,
  },
  distanceBadge: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  distanceIcon: { 
    marginRight: 3 
  },
  distance: { 
    fontSize: 10, 
    fontWeight: '800', 
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  description: { 
    fontSize: 12, 
    color: COLORS.textMuted,
    lineHeight: 16,
    fontWeight: '500',
  },
});

export default AttractionCard;
