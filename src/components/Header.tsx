import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Header: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.logo} />
      </View>
      <View style={styles.right}>
        <TouchableOpacity style={styles.icon} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  left: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F08A2D' },
  right: {},
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#111' },
});

export default Header;
