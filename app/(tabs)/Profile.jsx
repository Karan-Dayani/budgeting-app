import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { Stack } from "expo-router";
import CustomText from "../../components/CustomText";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";

const ProfilePage = () => {
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const [profileModal, setProfileModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");
  const [userName, setUserName] = useState("");
  const [income, setIncome] = useState(0);

  const handleChangeSubmit = async () => {
    const { data, error } = await supabase
      .from("User Data")
      .update({ username: userName, income: income })
      .eq("email", user?.user_metadata?.email)
      .select();
  };

  const handleLogOut = async () => {
    const { error } = await supabase.auth.signOut();
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      } else {
        Alert.alert("Error accessing user");
      }
    });
  }, []);

  async function fetchData() {
    const { data, error } = await supabase
      .from("User Data")
      .select("username,income")
      .eq("email", user?.user_metadata?.email);

    if (error) {
      console.error(error);
      Alert.alert("Error fetching data");
    } else {
      setUserName(data[0]?.username || "");
      setIncome(data[0]?.income || 0);
    }
  }

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <View>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="bg-[#41B3A2] h-36 justify-center mb-5">
        <View className="h-32 w-full absolute z-10 items-center top-16">
          <Image
            source={require("../../assets/images/defaultProfile.png")}
            alt="pfp"
            className="h-32 w-32"
          />
        </View>
      </View>
      <View className="px-10 ">
        <View className="items-center mt-8">
          <CustomText
            className="mt-4 text-2xl font-semibold "
            style={{ color: colors.text }}
          >
            {userName}
          </CustomText>
          <CustomText className="text-base " style={{ color: colors.text }}>
            {user?.user_metadata?.email}
          </CustomText>
        </View>

        <View className="mt-10">
          <TouchableOpacity
            className="p-4 rounded-lg flex-row justify-between items-center"
            style={{ backgroundColor: colors.inputBg }}
            onPress={() => {
              setProfileModal(true);
              fetchData();
            }}
          >
            <CustomText className="text-lg" style={{ color: colors.text }}>
              Edit Profile
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4 rounded-lg flex-row justify-between items-center mt-4"
            style={{ backgroundColor: colors.inputBg }}
          >
            <CustomText className="text-lg" style={{ color: colors.text }}>
              Support
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-red-500 p-4 rounded-lg flex-row justify-between items-center mt-4"
            onPress={() => handleLogOut()}
          >
            <CustomText className="text-lg " style={{ color: colors.text }}>
              Log Out
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModal}
        onRequestClose={() => {
          setProfileModal(!profileModal);
        }}
      >
        <View
          className="h-full justify-center px-5 "
          style={{ backgroundColor: colors.background }}
        >
          <View className="bg-[#191A19] pb-8 justify-center rounded-xl px-5 ">
            <View className="mt-5">
              <CustomText className="text-white text-xl">Username</CustomText>
              <TextInput
                className="rounded-lg my-3 text-white p-2 bg-[#31363F]"
                placeholderTextColor="white"
                value={userName}
                onChangeText={(text) => setUserName(text)}
              />
              <CustomText className="text-white text-xl">
                Your Monthly Income
              </CustomText>
              <TextInput
                className="rounded-lg my-3 text-white p-2 bg-[#31363F]"
                placeholderTextColor="white"
                value={String(income)}
                onChangeText={(text) => setIncome(text)}
                inputMode="numeric"
                keyboardType="numeric"
              />
            </View>
            <Pressable
              className="p-3 bg-[#41B3A2] items-center rounded-lg mt-5"
              onPress={() => {
                handleChangeSubmit();
                setProfileModal(!profileModal);
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <CustomText className="text-white text-lg">Submit</CustomText>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfilePage;
