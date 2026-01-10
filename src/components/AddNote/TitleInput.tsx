import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

interface TitleInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

const TitleInput: React.FC<TitleInputProps> = ({ value, onChangeText }) => {
  return (
    <TextInput
      style={styles.input}
      placeholder="Title of your story..."
      value={value}
      onChangeText={onChangeText}
      multiline={false}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111718',
    paddingVertical: 16,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
});

export default TitleInput;
