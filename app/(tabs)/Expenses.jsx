import { View, Text, ScrollView } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ExpensesPage() {
  return (
    <View className="w-full bg-bgColor h-full">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerStyle: { backgroundColor: "#191A19" },
        }}
      />
      <ScrollView className="">
        <View className="items-center ">
          <View className="w-80 h-20 rounded-xl bg-[#413F42] mb-4"></View>
          <View className="w-80 h-20 rounded-xl bg-[#413F42] mb-4"></View>
          <View className="w-80 h-20 rounded-xl bg-[#413F42] mb-4"></View>
          <View className="w-80 h-20 rounded-xl bg-[#413F42] mb-4"></View>
        </View>
      </ScrollView>
    </View>
  );
}
