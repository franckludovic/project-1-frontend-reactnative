import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BottomNavigation: React.FC = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navItem}>
        <Icon name="home" size={20} color="#618689" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem}>
        <Icon name="map" size={20} color="#618689" />
        <Text style={styles.navText}>Map</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItemActive}>
        <View style={styles.activeIndicator} />
        <Icon name="description" size={24} color="#13daec" />
        <Text style={styles.navTextActive}>Notes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJF8j3UDvbCreKiUHSw6FrU4av1Jjw0otmqg9VDJ2wP8aQd6Iwwt5t4BQQWbi2XGngRA_w9Ng1Wqh81Z5FRuPSVEqjg9vmBwgZKRgHHkn0Z2U2R41ms7bcszSyN9lNcYK5g0AhY4pEYmV4mK23iabjDhMOdlHBkaaGe-tmChsVvMKrp8KrCLjZ64krLnUMbRbIAJkw4DL4v2Fp2YMw3_UcgNG7NhkPMawMfjblavNOM31XbcuIXYlDhUPHqh3kIYDWIR64tYhlsETW',
            }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.navText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navItemActive: {
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    width: 32,
    height: 4,
    backgroundColor: '#13daec',
    borderRadius: 2,
    shadowColor: '#13daec',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  navText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#618689',
  },
  navTextActive: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#13daec',
  },
  avatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});

export default BottomNavigation;
