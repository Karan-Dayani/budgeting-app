import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { FontAwesome } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.icon,
        headerShown: true,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarStyle: {
            height: 70,
            paddingBottom: 8,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: "#3D2C8D",
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Expenses"
        options={{
          title: "Expenses",
          tabBarStyle: {
            height: 70,
            paddingBottom: 8,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: "#3D2C8D",
          },
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name="dollar" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
