import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import splashIcon from '../assets/images/splash-icon.jpg';

const Mockup: React.FC = () => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.phone}>
        <Image
          source={splashIcon}
          style={styles.phoneImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.badgeLeft}><Text>♥</Text></View>
      <View style={styles.badgeRight}><Text>💬</Text></View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginVertical: 20 },
  phone: { width: 260, height: 480, borderRadius: 28, backgroundColor: '#fff', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 8, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  phoneImage: { width: '100%', height: '100%' },
  badgeLeft: { position: 'absolute', left: -8, top: '40%', backgroundColor: '#fff', padding: 8, borderRadius: 20, elevation: 4 },
  badgeRight: { position: 'absolute', right: -8, top: '55%', backgroundColor: '#fff', padding: 8, borderRadius: 20, elevation: 4 },
});

export default Mockup;
