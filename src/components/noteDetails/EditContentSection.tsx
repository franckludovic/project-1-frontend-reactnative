import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
} from 'react-native';

interface EditContentSectionProps {
  value: string;
  onChangeText: (text: string) => void;
}

const EditContentSection: React.FC<EditContentSectionProps> = ({
  value,
  onChangeText,
}) => {
  return (
    <View style={styles.contentContainer}>
      <TextInput
        style={styles.contentInput}
        value={value}
        onChangeText={onChangeText}
        multiline
        placeholder="Enter your note content..."
        textAlignVertical="top"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  contentInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
});

export default EditContentSection;
