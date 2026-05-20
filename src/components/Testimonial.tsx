import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
const avatarIcon = require('../assets/avatar/avatar 1.jpg');

const Testimonial: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Ionicons key={s} name="star" size={14} color={COLORS.amberGold} style={styles.star} />
        ))}
      </View>
      <Text style={styles.quote}>
        “The only app I trust when I'm completely off the grid. It just works, and the journal feature is simply beautiful.”
      </Text>
      <View style={styles.person}>
        <Image source={avatarIcon} style={styles.avatar} />
        <View>
          <Text style={styles.name}>Lichtner</Text>
          <Text style={styles.role}>Adventure Finder</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: COLORS.surfaceLight, 
    padding: 20, 
    borderRadius: 18, 
    marginHorizontal: 24, 
    marginVertical: 14, 
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  starsRow: { 
    flexDirection: 'row', 
    marginBottom: 10 
  },
  star: { 
    marginRight: 2 
  },
  quote: { 
    color: COLORS.textMain, 
    fontSize: 14, 
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  person: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    marginRight: 12,
    backgroundColor: COLORS.stone200,
  },
  name: { 
    fontWeight: '800',
    color: COLORS.textMain,
    fontSize: 14,
  },
  role: { 
    color: COLORS.textMuted, 
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Testimonial;
