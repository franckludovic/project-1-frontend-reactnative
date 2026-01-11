import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface HeaderProps {
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  containerStyle?: any;
}

const Header: React.FC<HeaderProps> = ({
  leftContent,
  centerContent,
  rightContent,
  onLeftPress,
  onRightPress,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity style={styles.left} onPress={onLeftPress} disabled={!onLeftPress}>
        {leftContent || <View style={styles.logo} />}
      </TouchableOpacity>
      <View style={styles.center}>
        {centerContent}
      </View>
      <TouchableOpacity style={styles.right} onPress={onRightPress} disabled={!onRightPress}>
        {rightContent || <View style={styles.icon} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  left: { flexDirection: 'row', alignItems: 'center' },
  center: { flex: 1, alignItems: 'center' },
  logo: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F08A2D' },
  right: {},
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#111' },
});

export default Header;
