import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '../Button';

interface EditButtonProps {
  onSave: () => void;
  onCancel: () => void;
  isUpdating: boolean;
}

const EditButton: React.FC<EditButtonProps> = ({
  onSave,
  onCancel,
  isUpdating,
}) => {
  return (
    <View style={styles.container}>
      <Button
        title={isUpdating ? 'Updating...' : 'Save Changes'}
        onPress={onSave}
        disabled={isUpdating}
        style={styles.saveButton}
      />
      <Button
        title="Cancel"
        onPress={onCancel}
        variant="secondary"
        style={styles.cancelButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
  },
  saveButton: {
    marginBottom: 0,
  },
  cancelButton: {
    marginBottom: 0,
  },
});

export default EditButton;
