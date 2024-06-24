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
import { useIsFocused } from "@react-navigation/native";

export default function Home() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userIncome, setUserIncome] = useState(null);
  const [userData, setUserData] = useState([]);

  const isFocused = useIsFocused();

  const opacity = useRef(new Animated.Value(0.5)).current;

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

    Animated.timing(opacity, {
      toValue: 1,
      useNativeDriver: true,
      duration: 500,
    }).start();

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isFocused]);

  // console.log(user?.user_metadata?.email);

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
            color: "white",
          },
          headerStyle: {
            backgroundColor: "#0F0F0F",
          },
          headerRight: () => (
            <View className="right-5">
              <Pressable onPress={() => toggleMenu()}>
                {/* <Ionicons
                  name="person-circle-outline"
                  size={30}
                  color="white"
                /> */}
                <Entypo name="dots-three-vertical" size={25} color="white" />
              </Pressable>
              {menuVisible ? (
                <Animated.View
                  className=" bg-gray-600 rounded-md w-40 p-2 absolute right-3 top-9 "
                  style={{ opacity }}
                >
                  <Link
                    href={"/profile"}
                    className="text-white my-2 text-lg"
                    onPress={() => toggleMenu()}
                  >
                    Profile
                  </Link>
                  <Link
                    href={"/Expenses"}
                    className="text-white my-2 text-lg "
                    onPress={() => toggleMenu()}
                  >
                    Support
                  </Link>
                  <Pressable onPress={() => handleLogOut()}>
                    <Text className="text-red-400 my-2 text-lg">Log out</Text>
                  </Pressable>
                </Animated.View>
              ) : (
                <></>
              )}
            </View>
          ),
        }}
      />

      <ScrollView
        className="px-5 py-2
      \
      "
      >
        {loading ? (
          <>
            <LoadingAnimation style={{ height: 96, borderRadius: 15 }} />
            <View className="flex-row justify-between ">
              <LoadingAnimation style={{ height: 96, width: 156, borderRadius: 15 }} />
              <LoadingAnimation style={{ height: 96, width: 156, borderRadius: 15 }} />
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
            <LoadingAnimation style={{ height: 250, borderRadius: 15 }} />
          </>
        ) : (
          <>
            <Animated.View className="rounded-xl bg-[#1C1C1C] justify-center p-2 mt-3 ">
              <View className="items-center justify-between flex-row mb-4 px-2 py-2">
                <Text
                  className="text-white text-2xl "
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
              <View className="mx-2 mb-2">
                {historyExpense?.map((itme, index) => (
                  <View
                    className="mb-2 py-1 flex-row justify-between"
                    key={index}
                  >
                    <Text className="text-white text-lg">
                      {itme.expenseName}
                    </Text>
                    <Text className="text-red-500 text-lg">
                      - {itme.expenseAmount}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </>
        )}

        <Animated.View className="rounded-xl bg-[#1C1C1C] justify-center p-2 mt-3 mb-10">
          <View className="items-center justify-between flex-row mb-4 px-2 py-2">
            <Text
              className="text-white text-2xl"
              style={{ fontFamily: "Nunito" }}
            >
              Goals
            </Text>
            <AntDesign
              name="right"
              size={14}
              color="white"
              style={{ marginRight: 10 }}
            />
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
              <Text className="text-white text-sm mt-1">
                ₹50,000 / ₹2,00,000
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
