import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Animated,
  Alert,
  StyleSheet,
} from "react-native";
import { Link, Stack, router } from "expo-router";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import LoadingAnimation from "../../components/LoadingAnimation";
import { Entypo } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import TotalIncome from "../../components/TotalIncome";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { Button, Menu, NativeBaseProvider, Skeleton } from "native-base";

export default function Home() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userIncome, setUserIncome] = useState(null);
  const [userData, setUserData] = useState([]);

  const isFocused = useIsFocused();
  const { colors } = useTheme();

  const getUserRow = async (user) => {
    const { data, err } = await supabase
      .from("User Data")
      .select("*")
      .eq("email", user?.user_metadata?.email);
    setUserData(data);
  };

  const historyExpense = userData[0]?.expenses?.slice(0, 4);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        getUserRow(user);
      } else {
        Alert.alert("error accessing user");
      }
    });

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isFocused]);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogOut = async () => {
    const { error } = await supabase.auth.signOut();
    setMenuVisible(!menuVisible);
  };

  return (

    <SafeAreaView className="h-full ">
      <Stack.Screen
        options={{
          headerTitle: "CoinTrack",
          headerTitleStyle: {
            fontSize: 30,
            fontFamily: "Jost",
            color: colors.text,
          },
          headerStyle: {
            backgroundColor: colors.header,
          },
          headerRight: () => (
            <View className="right-5">
              <View className="flex-row">
                <Ionicons
                  name="notifications"
                  size={25}
                  color={colors.text}
                />
                <Menu
                  w="150"
                  trigger={(triggerProps) => {
                    return (
                      <Pressable
                        accessibilityLabel="More options menu"
                        {...triggerProps}
                        className="ml-3"
                      >
                        <Entypo
                          name="dots-three-vertical"
                          size={25}
                          color={colors.text}
                        />
                      </Pressable>
                    );
                  }}
                  placement="bottom right"
                >
                  <Menu.Item onPress={() => router.push("/")}>
                    Profile
                  </Menu.Item>
                  <Menu.Item onPress={() => router.push("/Expenses")}>
                    Support
                  </Menu.Item>
                  <Menu.Item onPress={handleLogOut}>
                    <Text className="text-red-400">Log out</Text>
                  </Menu.Item>
                </Menu>
                <Pressable onPress={() => toggleMenu()}>
                  {/* Additional Pressable */}
                </Pressable>
              </View>
            </View>
          ),
        }}
      />

      <ScrollView className="px-5 py-2">
        {loading ? (
          <>
            <Skeleton h="100px" mb="1" rounded="lg" startColor="coolGray.100" />
            <View className="flex-row justify-between">
              <Skeleton
                h="100px"
                w="156px"
                my="1"
                rounded="lg"
                startColor="coolGray.100"
              />
              <Skeleton
                h="100px"
                w="156px"
                my="1"
                rounded="lg"
                startColor="coolGray.100"
              />
            </View>
          </>
        ) : (
          <>
            <View className="w-full">
              <TotalIncome user={userData} />
            </View>
          </>
        )}
        {/* History */}
        {loading ? (
          <>
            <Skeleton h="250px" my="1" rounded="lg" startColor="coolGray.100" />
          </>
        ) : (
          <>
            <View className="rounded-xl bg-[#1C1C1C] justify-center p-2 mt-3 ">
              <View className="items-center justify-between flex-row mb-4 px-2 py-2 shadow-2xl">
                <Text
                  className="text-white text-2xl"
                  style={{ fontFamily: "Nunito" }}
                >
                  History
                </Text>
                <AntDesign
                  name="right"
                  size={14}
                  color="white"
                  style={{ marginRight: 10 }}
                />
              </View>
              <View className="mx-1 mb-2">
                {historyExpense?.map((item, index) => (
                  <View key={index} className="mb-2 p-3 bg-gray-800 rounded-xl">
                    <View className="flex-row justify-between">
                      <Text className="text-white text-lg">
                        {item.expenseName}
                      </Text>
                      <Text className="text-red-500 text-lg">
                        - ₹{item.expenseAmount}
                      </Text>
                    </View>
                    <Text className="text-gray-400">{item.expenseDate}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
        <View className="rounded-xl bg-[#1C1C1C] justify-center p-2 mt-3 mb-10">
          <View className="items-center justify-between flex-row mb-4 px-2 py-2">
            <Text className="text-white text-2xl" style={{ fontFamily: "Nunito" }}>
              Goals
            </Text>
            <AntDesign name="right" size={14} color="white" style={{ marginRight: 10 }} />
          </View>
          <View className="mx-2 mb-2">
            <View className="mb-2 py-1 gap-2">
              <Text className="text-white text-lg">Debt Repayment</Text>
              <View className="h-2 bg-gray-400 rounded-full overflow-hidden">
                <View className="bg-green-500 h-full w-3/4"></View>
              </View>
              <Text className="text-white text-sm mt-1">₹30,000 / ₹40,000</Text>
            </View>
            <View className="mb-2 py-1 gap-2">
              <Text className="text-white text-lg">Vacation</Text>
              <View className="h-2 bg-gray-400 rounded-full overflow-hidden">
                <View className="bg-green-500 h-full w-1/2"></View>
              </View>
              <Text className="text-white text-sm mt-1">₹25,000 / ₹50,000</Text>
            </View>
            <View className="mb-2 py-1 gap-2">
              <Text className="text-white text-lg">New Car</Text>
              <View className="h-2 bg-gray-400 rounded-full overflow-hidden">
                <View className="bg-green-500 h-full w-1/4"></View>
              </View>
              <Text className="text-white text-sm mt-1">₹50,000 / ₹2,00,000</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>

  );
}
