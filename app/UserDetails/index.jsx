import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, ImageBackground, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import { supabase } from "../../lib/supabase";
import CustomText from "../../components/CustomText";
import { useTheme } from "expo-router/react-navigation";
import { SafeAreaView } from "react-native-safe-area-context";

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
    setError("");
    const incomeStr = String(income);
    if (isNaN(incomeStr) || incomeStr.trim() === "" || Number(incomeStr) <= 0) {
      setError("Please enter a valid number for income.");
      setLoading(false);
      return false;
    }
    const incomeNum = Number(incomeStr);
    const email = user?.user_metadata?.email;

    if (!email) {
      setError("User email not found.");
      setLoading(false);
      return false;
    }

    try {
      // Check if the record already exists
      const { data: existing, error: checkError } = await supabase
        .from("User Data")
        .select("email")
        .eq("email", email);

      if (checkError) {
        console.error("Check user data error:", checkError);
      }

      let res;
      if (existing && existing.length > 0) {
        // Record exists, update it
        res = await supabase
          .from("User Data")
          .update({
            income: incomeNum,
            username: name,
            savings: incomeNum,
            expenses: [],
            goals: []
          })
          .eq("email", email);
      } else {
        // Record doesn't exist, insert it
        res = await supabase
          .from("User Data")
          .insert({
            email: email,
            income: incomeNum,
            username: name,
            savings: incomeNum,
            expenses: [],
            goals: []
          });
      }

      if (res.error) {
        console.error("Failed to update details:", res.error);
        setError("Failed to update details. Please try again.");
        setLoading(false);
        return false;
      }

      setLoading(false);
      return true;
    } catch (e) {
      console.error("Exception in addDetails:", e);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
      return false;
    }
  };

  const handleSubmit = async () => {
    const success = await addDetails();
    if (success) {
      router.replace("/(tabs)/Home");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/CoinTrackLogin.png")}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 px-5">
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View className=" justify-center rounded-3xl p-10 " style={{ backgroundColor: colors.expenseForm }}>
              <View className="justify-center items-center mb-10">
                <Image
                  source={require("../../assets/images/UserDetails.png")}
                  className="w-64 h-64"
                />
              </View>
              <View>
                <CustomText className="text-xl" style={{ color: colors.text }}>
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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Profile;
