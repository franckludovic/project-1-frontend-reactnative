import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

type Props = {
  icon: string;
  label: string;
};

const SyncStatus: React.FC<Props> = ({ icon, label }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#F0F9F4', borderRadius: 8, marginHorizontal: 20, marginBottom: 16 },
  iconContainer: { marginRight: 10 },
  icon: { fontSize: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#18A66B' },
});

export default SyncStatus;
