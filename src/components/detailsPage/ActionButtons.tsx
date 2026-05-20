import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';

type Place = {
  id: string;
  title: string;
  location: string;
  category: string;
  rating: number;
  image: any;
  latitude: number;
  longitude: number;
  subtitle?: string;
  synched?: number;
};

type ActionButtonsProps = {
  place: Place;
  onAddNote: () => void;
  onPlanVisit: () => void;
};

const ActionButtons: React.FC<ActionButtonsProps> = ({ place, onAddNote, onPlanVisit }) => {
  return (
    <View style={styles.actionRow}>
      <TouchableOpacity
        style={styles.actionBtnWhite}
        onPress={onAddNote}
        activeOpacity={0.8}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.actionBtnTextGray}>Add Note</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionBtnWhite} 
        onPress={onPlanVisit}
        activeOpacity={0.8}
      >
        <View style={[styles.iconCircle, { backgroundColor: COLORS.accentLight }]}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.accent} />
        </View>
        <Text style={styles.actionBtnTextGray}>Plan Visit</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionBtnDark}
        activeOpacity={0.85}
      >
        <Ionicons name="navigate" size={20} color="#fff" />
        <Text style={styles.actionBtnTextWhite}>Go There</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  actionBtnWhite: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDark: {
    flex: 1,
    backgroundColor: COLORS.textMain,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 4,
    shadowColor: COLORS.textMain,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  actionBtnTextGray: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  actionBtnTextWhite: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
});

export default ActionButtons;
