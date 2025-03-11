import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native";
import TabBar from "../../components/TabBar";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.tint,
        tabBarInactiveTintColor: Colors.dark.icon,
        headerShown: false,

      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
        }}
      />

      <Tabs.Screen
        name="Expenses"
        options={{
          title: "Expenses",

        }}
      />

      <Tabs.Screen
        name="Goals"
        options={{
          title: "Goals",
        }}
      />
    </Tabs>
  );
}
