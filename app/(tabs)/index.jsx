import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

export default function Home() {
  return (
    <View>
      <Stack.Screen options={{ headerTitle: "Home" }} />
      <Text className="text-stone-50">Home</Text>
    </View>
  );
}
