import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import CustomText from "../../components/CustomText";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";
import { Skeleton } from "native-base";
import { ActivityIndicator } from "react-native";
import CustomSuccessAlert from "../../components/modals/CustomSuccessAlert";

const ProfilePage = () => {
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const [profileModal, setProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState("");
  const [userName, setUserName] = useState("");
  const [oldIncome, setOldIncome] = useState(0);
  const [income, setIncome] = useState(0);
  const [logOutModal, setLogOutModal] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const handleChangeSubmit = async () => {
    const incomeNumber = Number(income);

    if (oldIncome !== income) {
      if (isNaN(incomeNumber) || incomeNumber <= 0) {
        Alert.alert("Please enter a valid number for income.");
        return;
      } else {
        const { data, error: updateError } = await supabase
          .from("User Data")
          .update({
            username: userName,
            income: incomeNumber,
            savings: incomeNumber,
            expenses: [],
            goals: [],
          })
          .eq("email", user?.user_metadata?.email)
          .select();
        if (updateError) {
          Alert.alert("Error updating profile", updateError.message);
        } else {
          setAlertVisible(true);
        }
        setProfileModal(false);
        setLoading(true);
      }
    } else {
      if (isNaN(incomeNumber) || incomeNumber <= 0) {
        Alert.alert("Please enter a valid number for income.");
        return;
      } else {
        const { data, error: updateError } = await supabase
          .from("User Data")
          .update({ username: userName })
          .eq("email", user?.user_metadata?.email)
          .select();
        if (updateError) {
          Alert.alert("Error updating profile", updateError.message);
        } else {
          setAlertVisible(true);
        }
        setProfileModal(false);
        setLoading(true);
      }
    }

    setLoading(false);
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
      setOldIncome(data[0]?.income || 0);
    }
  }

  useEffect(() => {
    if (user) {
      fetchData();
    }
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [user]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="bg-[#41B3A2] h-36 justify-center mb-5">
        <View className="h-32 w-full absolute z-10 items-center top-16">
          <Image
            source={require("../../assets/images/defaultProfile.png")}
            alt="pfp"
            className="h-32 w-32"
          />
        </View>
      </View>

      <View className="px-6 ">
        {loading ? (
          // <View className="items-center mt-8">
          //   <Skeleton h="3" w="120" rounded="full" marginY="5" />
          //   <Skeleton h="3" rounded="full" />
          // </View>
          <View className="items-center mt-8">
            <ActivityIndicator size={20} color={colors.text} />
          </View>
        ) : (
          <View className="items-center mt-8">
            <CustomText
              className="mt-4 text-2xl font-bold"
              style={{ color: colors.text }}
            >
              {userName}
            </CustomText>
            <CustomText className="text-base" style={{ color: colors.text }}>
              {user?.user_metadata?.email}
            </CustomText>
          </View>
        )}

        <View className="mt-12">
          <TouchableOpacity
            className="p-4 rounded-full flex-row justify-between items-center shadow-md"
            style={{ backgroundColor: colors.inputBg }}
            onPress={() => {
              setProfileModal(true);
              fetchData();
            }}
          >
            <CustomText className="text-lg " style={{ color: colors.text }}>
              Edit Profile
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4 rounded-full flex-row justify-between items-center mt-4 shadow-md"
            style={{ backgroundColor: colors.inputBg }}
          >
            <CustomText className="text-lg " style={{ color: colors.text }}>
              Support
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4 rounded-full flex-row justify-between items-center mt-4 bg-red-500 shadow-md"
            onPress={() => setLogOutModal(true)}
          >
            <CustomText className="text-lg text-white ">Log Out</CustomText>
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
          className="h-full justify-center px-10 "
          style={{ backgroundColor: `${colors.background}dd` }}
        >
          <View className="bg-[#191A19] pb-8 justify-center rounded-2xl px-6 shadow-lg">
            <View className="mt-5">
              <CustomText className="text-white text-xl font-semibold">
                Username
              </CustomText>
              <TextInput
                className="rounded-full my-3 text-white p-4 bg-[#31363F] text-lg"
                placeholderTextColor="white"
                value={userName}
                onChangeText={(text) => setUserName(text)}
              />
              <CustomText className="text-white text-xl font-semibold">
                Monthly Income
              </CustomText>
              <TextInput
                className="rounded-full my-3 text-white p-4 bg-[#31363F] text-lg"
                placeholderTextColor="white"
                value={String(income)}
                onChangeText={(text) => setIncome(text)}
                inputMode="numeric"
                keyboardType="numeric"
              />
            </View>
            <CustomText className="text-gray-400 text-sm mt-4 text-center">
              Update your details by removing the old information and entering
              the new data.
            </CustomText>
            <Pressable
              className="p-4 bg-[#41B3A2] items-center rounded-full mt-6 shadow-md"
              onPress={() => {
                handleChangeSubmit();
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <CustomText className="text-white text-lg">Submit</CustomText>
              )}
            </Pressable>
            <Pressable
              className="p-4 bg-red-500 items-center rounded-full mt-4 shadow-md"
              onPress={() => setProfileModal(false)}
            >
              <CustomText className="text-white text-lg">Cancel</CustomText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={logOutModal}
        onRequestClose={() => {
          setLogOutModal(!logOutModal);
        }}
      >
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: `${colors.background}dd` }}
        >
          <View
            className="p-6 rounded-2xl w-4/5 shadow-lg"
            style={{ backgroundColor: colors.inputBg }}
          >
            <CustomText
              className="text-xl mb-4 font-semibold text-center"
              style={{ color: colors.text }}
            >
              Are you sure you want to log out?
            </CustomText>
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 p-4 bg-red-500 items-center rounded-full shadow-md"
                onPress={() => setLogOutModal(false)}
              >
                <CustomText className="text-white text-lg">No</CustomText>
              </Pressable>
              <Pressable
                className="flex-1 p-4 bg-blue-500 items-center rounded-full shadow-md"
                onPress={handleLogOut}
              >
                <CustomText className="text-white text-lg">Yes</CustomText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <View className="flex-1">
        <CustomSuccessAlert
          visible={alertVisible}
          mainMessage="Profile Updated"
          message="Your profile updated successfully!"
          onClose={() => setAlertVisible(false)}
        />
      </View>
    </View>
  );
};

export default ProfilePage;
