import { View, Text, TextInput, Pressable } from "react-native";
import React from "react";
import { Stack, router } from "expo-router";

const Profile = () => {

  const handleSubmit = () => {
    router.replace("/(tabs)/")
  }

  return (
    <View className='h-full justify-center px-5'>
      <Stack.Screen options={{ headerTitle: "Profile", headerStyle: { backgroundColor: "#0F0F0F" }, headerTitleStyle: { color: "white" } }} />
      <View className="bg-[#191A19] pb-8 justify-center rounded-xl px-5 ">
        <View className="mt-5">
          <Text className="text-white text-xl " style={{ fontFamily: "Nunito" }}>Username</Text>
          <TextInput className="rounded-lg my-3 text-white p-2 bg-[#31363F]" placeholderTextColor="white" placeholder="Username" />
          <Text className="text-white text-xl" style={{ fontFamily: "Nunito" }}>Your Income</Text>
          <TextInput className=" rounded-lg my-3 text-white p-2 bg-[#31363F]" placeholderTextColor="white" placeholder="Income" inputMode="numeric" />
        </View>
        <Pressable className="p-3 bg-cardColor items-center rounded-lg mt-5" onPress={() => handleSubmit()}><Text className="text-white text-lg">Submit</Text></Pressable>
      </View>
    </View>
  );
};

export default Profile;
