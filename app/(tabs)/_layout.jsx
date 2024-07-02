import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.tint,
        tabBarInactiveTintColor: Colors.dark.icon,

        headerShown: true,
        headerShadowVisible: false,

      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: ({ focused }) => (focused ? <Text className="text-white text-[12px] mb-2">Home</Text> : null),
          tabBarStyle: {
            height: 70,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              style={{ marginTop: focused ? 10 : 0 }}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Expenses"
        options={{
          tabBarLabel: ({ focused }) => (focused ? <Text className="text-white text-[12px] mb-2">Expenses</Text> : null),
          tabBarStyle: {
            height: 70,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          },
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name="dollar" size={24} style={{ marginTop: focused ? 10 : 0 }} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Goals"
        options={{
          tabBarLabel: ({ focused }) => (focused ? <Text className="text-white text-[12px] mb-2">Goals</Text> : null),
          tabBarStyle: {
            height: 70,
            paddingBottom: 2,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          },
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name="finance" style={{ marginTop: focused ? 10 : 0 }} size={24} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
