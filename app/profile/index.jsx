import { View, Text, TextInput, Pressable } from "react-native";
import React, { useState } from "react";
import { Stack, router } from "expo-router";

const Profile = () => {
  const [name, setName] = useState("");
  const [income, setIncome] = useState(0);

  const handleSubmit = () => {
    router.replace("/(tabs)/");
  };

  return (
    <View className="h-full justify-center px-5">
      <Stack.Screen
        options={{
          headerTitle: "Profile",
          headerStyle: { backgroundColor: "#0F0F0F" },
          headerTitleStyle: { color: "white" },
        }}
      />
      <View className="bg-[#191A19] pb-8 justify-center rounded-xl px-5 ">
        <View className="mt-5">
          <Text
            className="text-white text-xl "
            style={{ fontFamily: "Nunito" }}
          >
            Username
          </Text>
          <TextInput
            value={name}
            onChange={(text) => setName(text)}
            className="rounded-lg my-3 text-white p-2 bg-[#31363F]"
            placeholderTextColor="white"
            placeholder="Username"
          />
          <Text className="text-white text-xl" style={{ fontFamily: "Nunito" }}>
            Your Income
          </Text>
          <TextInput
            value={income}
            onChange={(num) => setIncome(num)}
            className=" rounded-lg my-3 text-white p-2 bg-[#31363F]"
            placeholderTextColor="white"
            placeholder="Income"
            inputMode="numeric"
          />
        </View>
        <Pressable
          className="p-3 bg-cardColor items-center rounded-lg mt-5"
          onPress={() => handleSubmit()}
        >
          <Text className="text-white text-lg">Submit</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Profile;
