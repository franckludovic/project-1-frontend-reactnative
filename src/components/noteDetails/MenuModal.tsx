import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  onAddImage: () => void;
  onDeleteImages: () => void;
  onDeleteNote: () => void;
}

const MenuModal: React.FC<MenuModalProps> = ({
  visible,
  onClose,
  onAddImage,
  onDeleteImages,
  onDeleteNote,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              onAddImage();
            }}
          >
            <MaterialIcons name="add-photo-alternate" size={24} color="#0f172a" />
            <Text style={styles.menuItemText}>Add Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              onDeleteImages();
            }}
          >
            <MaterialIcons name="delete-sweep" size={24} color="#dc2626" />
            <Text style={[styles.menuItemText, styles.deleteText]}>Delete Images</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              onDeleteNote();
            }}
          >
            <MaterialIcons name="delete" size={24} color="#dc2626" />
            <Text style={[styles.menuItemText, styles.deleteText]}>Delete Note</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#0f172a',
  },
  deleteText: {
    color: '#dc2626',
  },
});

export default MenuModal;
