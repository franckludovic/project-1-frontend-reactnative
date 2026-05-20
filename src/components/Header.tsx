import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

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
      <TouchableOpacity 
        style={styles.left} 
        onPress={onLeftPress} 
        disabled={!onLeftPress}
        activeOpacity={0.7}
      >
        {leftContent || (
          <View style={styles.brandContainer}>
            <View style={styles.logoFrame}>
              <Ionicons name="compass" size={22} color="#fff" />
            </View>
            <Text style={styles.brandName}>TravelBuddy</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <View style={styles.center}>
        {centerContent}
      </View>
      
      <TouchableOpacity 
        style={styles.right} 
        onPress={onRightPress} 
        disabled={!onRightPress}
        activeOpacity={0.7}
      >
        {rightContent}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  left: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoFrame: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -0.3,
  },
  center: { 
    flex: 1, 
    alignItems: 'center' 
  },
  right: {
    minWidth: 36,
    alignItems: 'flex-end',
  },
});

export default Header;
