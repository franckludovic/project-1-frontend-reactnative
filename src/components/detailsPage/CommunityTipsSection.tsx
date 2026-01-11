import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

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

const CommunityTipsSection: React.FC = () => {
  return (
    <>
      {/* --- COMMUNITY TIPS --- */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitleLarge}>Community Tips</Text>
        <Text style={styles.newTipsText}>12 new</Text>
      </View>

      <View style={styles.tipsContainer}>
        {/* Tip 1 */}
        <View style={styles.tipCard}>
          <View style={{ flex: 1 }}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipName}>mamami</Text>
              <Text style={styles.tipTime}>N/A</Text>
            </View>
            <Text style={styles.tipText}>
              None for now
            </Text>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitleLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.stone900,
  },
  newTipsText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.stone400,
  },
  tipsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.stone200,
    gap: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tipName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.stone900,
  },
  tipTime: {
    fontSize: 10,
    color: COLORS.stone400,
  },
  tipText: {
    fontSize: 12,
    color: COLORS.stone600,
    lineHeight: 18,
  },
});

export default CommunityTipsSection;
