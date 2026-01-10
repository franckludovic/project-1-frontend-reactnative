import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { COLORS } from '../constants';

type Props = {
  userName: string;
  // accept either a local image source or a remote uri string via avatarUrl
  avatar?: ImageSourcePropType;
  avatarUrl?: string;
};

const WelcomeHeader: React.FC<Props> = ({ userName, avatar, avatarUrl }) => {
  // fallback local avatar if none provided
  const fallback = require('../assets/images/splash-icon.jpg');

  let source: any = avatar ?? fallback;
  if (!avatar && avatarUrl) source = { uri: avatarUrl };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>
          Hello, {userName} <Text style={styles.wave}>👋</Text>
        </Text>
        <Text style={styles.subtitle}>Here are your saved journeys and favorite places.</Text>
      </View>
      <View style={styles.avatar}>
        {source ? (
          <Image source={source} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, marginTop: 40, alignItems: 'flex-start', justifyContent: 'space-between' },
  content: { flex: 1, marginRight: 12 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#0A0A0A', marginBottom: 6 },
  wave: { fontSize: 28 },
  subtitle: { fontSize: 14, color: '#666', lineHeight: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden' },
  avatarImage: { width: 60, height: 60 },
  avatarPlaceholder: { width: 60, height: 60, backgroundColor: COLORS.orange, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#fff' },
});

export default WelcomeHeader;
