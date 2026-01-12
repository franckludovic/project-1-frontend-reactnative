import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Colors extracted from the HTML Tailwind Config
const COLORS = {
  primary: '#fb923c',
  primaryDark: '#ea580c',
  backgroundLight: '#fafaf9',
  surfaceLight: '#ffffff',
  surfaceDark: '#292524',
  stone900: '#1c1917',
  stone600: '#57534e',
  stone400: '#a8a29e',
  stone200: '#e7e5e4',
  amber50: '#fffbeb',
  amber100: '#fef3c7',
  amber600: '#d97706',
  emerald50: '#ecfdf5',
  emerald100: '#d1fae5',
  emerald500: '#10b981',
  emerald600: '#059669',
  emerald700: '#047857',
};

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
      >
        <Icon name="edit" size={26} color={COLORS.primary} />
        <Text style={styles.actionBtnTextGray}>Add Note</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionBtnWhite} onPress={onPlanVisit}>
        <Icon name="event" size={26} color={COLORS.stone400} />
        <Text style={styles.actionBtnTextGray}>Plan a visit</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionBtnDark}>
        <Icon name="directions" size={26} color="#fff" />
        <Text style={styles.actionBtnTextWhite}>Directions</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 12,
  },
  actionBtnWhite: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.stone200,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionBtnDark: {
    flex: 1,
    backgroundColor: COLORS.stone900,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  actionBtnTextGray: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.stone600,
  },
  actionBtnTextWhite: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});

export default ActionButtons;
