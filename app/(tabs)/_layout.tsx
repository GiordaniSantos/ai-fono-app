import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#19191b',
          borderTopWidth: 0,
          height: 70,
          paddingHorizontal: 40,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons
                name="home"
                size={22}
                color={focused ? '#FFFFFF' : '#6B7280'}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="tasks"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons
                name="clipboard-outline"
                size={22}
                color={focused ? '#FFFFFF' : '#6B7280'}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1A82FF',
  },
});