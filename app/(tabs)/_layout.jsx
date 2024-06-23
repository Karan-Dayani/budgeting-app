import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
          title: "Home",
          tabBarStyle: {
            height: 60,
            paddingBottom: 2,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Goals"
        options={{
          title: "Goals",
          tabBarStyle: {
            height: 60,
            paddingBottom: 2,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          },
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name="finance" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Expenses"
        options={{
          title: "Expenses",
          tabBarStyle: {
            height: 60,
            paddingBottom: 2,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name="dollar" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
