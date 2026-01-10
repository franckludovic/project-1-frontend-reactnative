import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../constants';

type Props = {
  userName?: string;
};

const FavoriteScreen: React.FC<Props> = ({ userName = 'Traveler' }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>❤️</Text>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.placeholder}>Favorites screen coming soon...</Text>
        <Text style={styles.description}>View your favorite places and saved memories.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#0A0A0A', marginBottom: 8 },
  placeholder: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 20 },
});

export default FavoriteScreen;
