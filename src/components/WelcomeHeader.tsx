import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { COLORS } from '../constants';

type Props = {
  userName: string;
  avatar?: ImageSourcePropType;
  avatarUrl?: string;
};

const WelcomeHeader: React.FC<Props> = ({ userName, avatar, avatarUrl }) => {
  const fallback = require('../assets/images/splash-icon.jpg');

  let source: any = avatar ?? fallback;
  if (!avatar && avatarUrl) source = { uri: avatarUrl };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting} numberOfLines={1}>
          Hello, {userName} <Text style={styles.wave}>👋</Text>
        </Text>
        <Text style={styles.subtitle}>Let's discover your next adventure.</Text>
      </View>
      <View style={styles.avatarBorder}>
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
  container: { 
    flexDirection: 'row', 
    paddingHorizontal: 24, 
    paddingVertical: 20, 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
  },
  content: { 
    flex: 1, 
    marginRight: 16 
  },
  greeting: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: COLORS.textMain, 
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  wave: { 
    fontSize: 24 
  },
  subtitle: { 
    fontSize: 14, 
    color: COLORS.textMuted, 
    lineHeight: 20,
    fontWeight: '500',
  },
  avatarBorder: { 
    width: 54, 
    height: 54, 
    borderRadius: 27, 
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImage: { 
    width: '100%', 
    height: '100%' 
  },
  avatarPlaceholder: { 
    width: '100%', 
    height: '100%', 
    backgroundColor: COLORS.primary, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#fff' 
  },
});

export default WelcomeHeader;
