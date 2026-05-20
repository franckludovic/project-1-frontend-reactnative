import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView 
      intensity={90} 
      tint="light" 
      style={[
        styles.tabBarContainer, 
        { paddingBottom: Math.max(insets.bottom, 12) }
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Determine icon name and label based on route
        let iconName = '';
        let label = '';

        if (route.name === 'places') {
          label = 'Explore';
          iconName = isFocused ? 'compass' : 'compass-outline';
        } else if (route.name === 'index') {
          label = 'Home';
          iconName = isFocused ? 'home' : 'home-outline';
        } else if (route.name === 'create') {
          label = 'Create';
          iconName = 'add';
        } else if (route.name === 'favorite') {
          label = 'Saved';
          iconName = isFocused ? 'bookmark' : 'bookmark-outline';
        } else if (route.name === 'notes') {
          label = 'Profile';
          iconName = isFocused ? 'person' : 'person-outline';
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.8}
          >
            <View style={[
              styles.iconWrapper,
              isFocused && styles.activeIconWrapper
            ]}>
              <Ionicons 
                name={iconName as any} 
                size={20} 
                color={isFocused ? '#FFFFFF' : '#5C4E4D'} 
              />
            </View>
            <Text style={[
              styles.tabLabel,
              isFocused ? styles.activeTabLabel : styles.inactiveTabLabel
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </BlurView>
  );
}

export default function HomeTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="places"
        options={{
          title: 'Explore',
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
        }}
      />
      <Tabs.Screen
        name="favorite"
        options={{
          title: 'Saved',
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderTopWidth: 1.2,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    overflow: 'hidden',
  },
  activeIconWrapper: {
    backgroundColor: '#A22600', // Deep red-orange circle matching mockup
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  activeTabLabel: {
    color: '#A22600',
  },
  inactiveTabLabel: {
    color: '#5C4E4D',
  },
});
