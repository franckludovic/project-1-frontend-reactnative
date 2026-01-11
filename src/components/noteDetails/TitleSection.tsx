import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

type TitleSectionProps = {
  title: string;
};

const TitleSection: React.FC<TitleSectionProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36, 
    fontWeight: '700', 
    color: '#0f172a', 
    lineHeight: 40,
    fontFamily: 'Plus Jakarta Sans', // font-display
  },
});

export default TitleSection;
