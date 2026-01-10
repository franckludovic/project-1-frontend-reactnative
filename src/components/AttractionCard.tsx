import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

type Props = {
  title: string;
  description: string;
  distance: string;
  icon: string;
  onPress?: () => void;
};

const AttractionCard: React.FC<Props> = ({ title, description, distance, icon, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.distanceTag}>
          <Text style={styles.distanceIcon}>📍</Text>
          <Text style={styles.distance}>{distance} AWAY</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={1}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, padding: 12, backgroundColor: '#F9F9F9', borderRadius: 12, alignItems: 'center' },
  iconContainer: { width: 60, height: 60, backgroundColor: '#B8D4F1', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  icon: { fontSize: 28 },
  content: { flex: 1 },
  distanceTag: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  distanceIcon: { fontSize: 12, marginRight: 4 },
  distance: { fontSize: 11, fontWeight: '600', color: '#0084FF' },
  title: { fontSize: 16, fontWeight: '600', color: '#0A0A0A', marginBottom: 2 },
  description: { fontSize: 13, color: '#999' },
});

export default AttractionCard;
