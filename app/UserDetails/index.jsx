import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, ImageBackground, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import { supabase } from "../../lib/supabase";
import CustomText from "../../components/CustomText";
import { useTheme } from "@react-navigation/native";

const Profile = () => {
  const [name, setName] = useState("");
  const [income, setIncome] = useState(0);
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { colors } = useTheme()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      } else {
        Alert.alert("error accessing user");
      }
    });
  }, []);

  const addDetails = async () => {
    setLoading(true);
    if (isNaN(income) || income.trim() === "" || income === "0") {
      setError("Please enter a valid number for income.");
      return;
    }
    const { data, err } = await supabase
      .from("User Data")
      .update({ income: income, username: name, savings: income })
      .eq("email", user?.user_metadata?.email);
    if (err) {
      setError("Failed to update details. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = () => {
    addDetails();
    router.replace("/(tabs)/Home");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/CoinTrackLogin.png")}
      style={{ flex: 1 }}
    >
      <View className="h-full justify-center px-5">
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View className=" justify-center rounded-3xl p-10 " style={{ backgroundColor: colors.expenseForm }}>
          <View className="justify-center items-center mb-10">
            <Image
              source={require("../../assets/images/UserDetails.png")}
              className="w-64 h-64"
            />
          </View>
          <View>
            <CustomText className=" text-xl" style={{ color: colors.text }}>
              Username
            </CustomText>
            <TextInput
              value={name}
              onChangeText={(value) => setName(value)}
              className="rounded-2xl my-3  py-2 px-3 "
              style={{ backgroundColor: colors.expenseInput, color: colors.text }}
              placeholderTextColor="gray"
              placeholder="Username"
            />
            <CustomText className=" text-xl" style={{ color: colors.text }} >
              Your Monthly Income
            </CustomText>
            <TextInput
              value={income}
              onChangeText={(value) => setIncome(value)}
              className="rounded-2xl my-3 text-white py-2 px-3"
              style={{ backgroundColor: colors.expenseInput, color: colors.text }}
              placeholderTextColor="gray"
              placeholder="0"
              inputMode="numeric"
              keyboardType="numeric"
            />
            {error ? (
              <CustomText className="text-red-500 mt-2">{error}</CustomText>
            ) : (
              <CustomText className="text-gray-400 mt-2">
                Please enter your monthly income. This helps us tailor your budget
                and savings goals.
              </CustomText>
            )}
          </View>
          <Pressable
            className="p-3 bg-[#41B3A2] items-center rounded-2xl mt-5"
            onPress={() => handleSubmit()}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <CustomText className="text-white text-lg">Submit</CustomText>
            )}
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Profile;
