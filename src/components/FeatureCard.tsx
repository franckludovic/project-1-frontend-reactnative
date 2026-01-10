import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => {
  return (
    <View style={styles.card}>
      <View style={styles.icon}><Text>{icon}</Text></View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginVertical: 8, width: '100%', elevation: 2 },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F7F7F7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  body: { flex: 1 },
  title: { fontWeight: '600', marginBottom: 6 },
  desc: { color: '#666', fontSize: 13 },
});

export default FeatureCard;
