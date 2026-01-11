import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

type ContentSectionProps = {
  content: string;
};

const ContentSection: React.FC<ContentSectionProps> = ({ content }) => {
  // Split content by double line breaks to create paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return (
    <View style={styles.container}>
      {paragraphs.map((paragraph, index) => (
        <Text key={index} style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  paragraph: {
    fontSize: 18, // text-lg
    fontWeight: '400', // font-normal
    color: '#64748b', // text-slate-500
    lineHeight: 28, // leading-relaxed
    fontFamily: 'Noto Sans', // font-body
    marginBottom: 16, // Space between paragraphs
  },
});

export default ContentSection;
