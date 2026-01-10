import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
};

const Button: React.FC<Props> = ({ title, onPress, variant = 'primary', style }) => {
  return (
    <TouchableOpacity style={[styles.button, styles[variant], style]} onPress={onPress}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: COLORS.orange },
  primaryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  secondary: { backgroundColor: '#E8E8E8' },
  secondaryText: { color: '#0A0A0A', fontWeight: '600', fontSize: 14 },
  outline: { borderWidth: 1, borderColor: '#E6E6E6', backgroundColor: 'transparent' },
  outlineText: { color: '#333', fontWeight: '600', fontSize: 14 },
  text: { fontSize: 14, fontWeight: '600' },
});

export default Button;
