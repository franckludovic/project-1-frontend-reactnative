import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import avatarIcon from '../assets/avatar/avatar 1.jpg';

const Testimonial: React.FC = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.stars}>★★★★★</Text>
      <Text style={styles.quote}>“The only app I trust when I'm completely off the grid. It just works, and the journal feature is simply beautiful.”</Text>
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
  card: { backgroundColor: '#fff', padding: 18, borderRadius: 14, marginHorizontal: 20, marginVertical: 18, elevation: 2 },
  stars: { color: '#F08A2D', marginBottom: 8 },
  quote: { color: '#333', fontSize: 14, marginBottom: 12 },
  person: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 10 },
  name: { fontWeight: '600' },
  role: { color: '#777', fontSize: 12 },
});

export default Testimonial;
