import React, { useState } from 'react';
import { View, TextInput as RNTextInput, StyleSheet, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

type Props = TextInputProps & {
  error?: string;
  label?: string;
  leftIcon?: string;
  rightIcon?: React.ReactNode;
  containerStyle?: any;
};

const TextInput: React.FC<Props> = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false, 
  error, 
  label, 
  leftIcon,
  rightIcon,
  containerStyle,
  ...rest 
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper,
        focused && styles.inputFocused, 
        error ? styles.inputError : null
      ]}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon as any} 
            size={20} 
            color={error ? COLORS.redAlert : (focused ? COLORS.primary : COLORS.textLight)} 
            style={styles.leftIcon} 
          />
        )}
        
        <RNTextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={COLORS.textLight}
          autoCorrect={false}
          {...rest}
        />

        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    marginBottom: 12,
    width: '100%',
  },
  label: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: COLORS.textMuted, 
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.borderLight || '#E2E8F0',
    borderRadius: SIZES.radius || 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    height: 48,
    width: '100%',
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: COLORS.textMain,
    fontWeight: '600',
  },
  rightIconContainer: {
    marginLeft: 10,
  },
  inputFocused: { 
    borderColor: COLORS.primary, 
    backgroundColor: '#fff',
  },
  inputError: { 
    borderColor: COLORS.redAlert,
    backgroundColor: COLORS.redLight,
  },
  errorText: { 
    fontSize: 11, 
    fontWeight: '700',
    color: COLORS.redAlert, 
    marginTop: 6,
    marginLeft: 4,
  },
});

export default TextInput;
