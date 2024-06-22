import { View, Text, TextInput, Pressable, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import { getUser } from "../api";
import { supabase } from "../../lib/supabase";

const Profile = () => {
  const [name, setName] = useState("");
  const [income, setIncome] = useState(0);
  const [user, setUser] = useState()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      } else {
        Alert.alert("error accessing user");
      }
    });
  }, [])

  const addDetails = async () => {
    setLoading(true)
    if (isNaN(income) || income.trim() === "") {
      setError("Please enter a valid number for income.");
      return;
    }
    const { data, err } = await supabase
      .from("User Data")
      .update({ income: income, username: name })
      .eq("email", user?.user_metadata?.email)
    if (err) {
      setError("Failed to update details. Please try again.");
    }
    setLoading(false)
  };


  const handleSubmit = () => {
    addDetails()
    router.replace("/(tabs)/")
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
          <Text className="text-white text-xl" style={{ fontFamily: "Nunito" }}>
            Username
          </Text>
          <TextInput
            value={name}
            onChangeText={(value) => setName(value)}
            className="rounded-lg my-3 text-white p-2 bg-[#31363F]"
            placeholderTextColor="white"
            placeholder="Username"
          />
          <Text className="text-white text-xl" style={{ fontFamily: "Nunito" }}>
            Your Monthly Income
          </Text>
          <TextInput
            value={income}
            onChangeText={(value) => setIncome(value)}
            className="rounded-lg my-3 text-white p-2 bg-[#31363F]"
            placeholderTextColor="white"
            placeholder="0"
            inputMode="numeric"
            keyboardType="numeric"
          />
          {error ? (
            <Text className="text-red-500 mt-2">{error}</Text>
          ) : (
            <Text className="text-gray-400 mt-2">
              Please enter your monthly income. This helps us tailor your budget and savings goals.
            </Text>
          )}
        </View>
        <Pressable
          className="p-3 bg-cardColor items-center rounded-lg mt-5"
          onPress={() => handleSubmit()}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg">Submit</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default Profile;
