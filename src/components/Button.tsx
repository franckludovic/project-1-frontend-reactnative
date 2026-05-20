import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../constants';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

const Button: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  primary: {
    backgroundColor: COLORS.primary
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  secondary: {
    backgroundColor: COLORS.primaryLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: COLORS.stone200,
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  outlineText: {
    color: COLORS.textMain,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  text: {
    fontSize: 15,
    fontWeight: '700'
  },
});

export default Button;
