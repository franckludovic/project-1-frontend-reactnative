import React, { useState } from 'react';
import { View, TextInput as RNTextInput, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants';

type Props = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  label?: string;
};

const TextInput: React.FC<Props> = ({ placeholder, value, onChangeText, secureTextEntry = false, error, label }) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[styles.input, focused && styles.inputFocused, error && styles.inputError]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor="#999"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#0A0A0A', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: '#F9F9F9',
  },
  inputFocused: { borderColor: COLORS.orange, backgroundColor: '#fff' },
  inputError: { borderColor: '#E74C3C' },
  errorText: { fontSize: 12, color: '#E74C3C', marginTop: 4 },
});

export default TextInput;
