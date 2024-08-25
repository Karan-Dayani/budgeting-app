import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";

const Profile = () => {
  const { colors } = useTheme();
  return (
    <View className="px-5 flex-1">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerShadowVisible: false,
          headerTitleStyle: {
            color: colors.text,
            fontSize: 25,
          },
          headerStyle: { backgroundColor: colors.header, height: 50 },
        }}
      />
      <Text></Text>
    </View>
  );
};

export default Profile;
