import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';

const CommunityTipsSection: React.FC = () => {
  return (
    <>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitleLarge}>Community Tips</Text>
        <Text style={styles.newTipsText}>0 new</Text>
      </View>

      <View style={styles.tipsContainer}>
        <View style={styles.tipCard}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="people-outline" size={16} color={COLORS.textLight} />
          </View>
          <View style={styles.tipContent}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipName}>mamami</Text>
              <Text style={styles.tipTime}>N/A</Text>
            </View>
            <Text style={styles.tipText}>
              No community tips logged yet. Be the first to add a tip when synced online!
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
    marginBottom: 14,
  },
  sectionTitleLarge: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -0.3,
  },
  newTipsText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  tipsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    gap: 12,
    alignItems: 'flex-start',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tipContent: {
    flex: 1,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tipName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  tipTime: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  tipText: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default CommunityTipsSection;
