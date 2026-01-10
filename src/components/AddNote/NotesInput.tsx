import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

interface NotesInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

const NotesInput: React.FC<NotesInputProps> = ({ value, onChangeText }) => {
  return (
    <TextInput
      style={styles.input}
      placeholder="What made this moment special? Capture the feelings, the sounds, and the sights..."
      multiline
      value={value}
      onChangeText={onChangeText}
      textAlignVertical="top"
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    height: 256,
    fontSize: 16,
    color: '#111718',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
});

export default NotesInput;
