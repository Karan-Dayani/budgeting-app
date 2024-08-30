import { AntDesign } from "@expo/vector-icons";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { Skeleton } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  View,
  Animated,
  StatusBar
} from "react-native";
import AnimatedHeader from "../../components/AnimatedHeader";
import TotalIncome from "../../components/TotalIncome";
import { supabase } from "../../lib/supabase";
import CustomText from "../../components/CustomText";
import { useUser } from "../../components/globalState/UserContext";

export default function Home() {
  const { user } = useUser();
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);

  const isFocused = useIsFocused();
  const { colors } = useTheme();


  const getUserRow = async () => {
    const { data, error } = await supabase
      .from("User Data")
      .select("*")
      .eq("email", user?.user_metadata?.email);
    setUserData(data)
  };

  useEffect(() => {
    getUserRow()

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isFocused]);

  const historyExpense = userData[0]?.expenses?.slice(0, 4);
  const historyGoal = userData[0]?.goals?.slice(0, 4);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogOut = async () => {
    const { error } = await supabase.auth.signOut();
    setMenuVisible(!menuVisible);
  };

  const scrollY = useRef(new Animated.Value(0)).current;

  const blackBarOpacity = scrollY.interpolate({
    inputRange: [0, 65],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          headerShown: false,
          headerTitle: "CoinStack",
          headerTitleStyle: {
            color: colors.text,
            fontFamily: "Nunito",
            fontSize: 25,
          },
          headerStyle: {
            backgroundColor: colors.header,
            height: 90,
          },
        }}
      />

      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: StatusBar.currentHeight,
          backgroundColor: colors.background,
          opacity: blackBarOpacity,
          zIndex: 10,
        }}
      />

      <ScrollView
        className="px-5 py-2"
        onScroll={(e) => {
          scrollY.setValue(e.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
      >
        {/* Animated Header */}
        <Animated.View
        >
          <AnimatedHeader
            toggleMenu={toggleMenu}
            handleLogOut={handleLogOut}
          />
        </Animated.View>

        {/* Content sections */}
        {loading ? (
          <>
            <Skeleton h="100px" mb="1" rounded="20px" startColor="coolGray.300" />
            <View className="flex-row justify-between">
              <Skeleton h="100px" w="156px" my="1" rounded="20px" startColor="coolGray.300" />
              <Skeleton h="100px" w="156px" my="1" rounded="20px" startColor="coolGray.300" />
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
          <Skeleton h="250px" my="1" rounded="lg" startColor="coolGray.300" />
        ) : (
          <View className="rounded-xl bg-[#222831] justify-center p-2 mt-3">
            <View className="items-center justify-between flex-row mb-4 px-2 py-2 shadow-2xl">
              <CustomText className="text-white text-2xl">
                History
              </CustomText>
              <AntDesign name="right" size={14} color="white" style={{ marginRight: 10 }} />
            </View>
            <View className="mx-1 mb-2">
              {historyExpense?.map((item, index) => (
                <View key={index} className="mb-2 p-3 bg-gray-700 rounded-xl">
                  <View className="flex-row justify-between">
                    <CustomText className="text-white text-lg">
                      {item.expenseName}
                    </CustomText>
                    <CustomText className="text-red-500 text-lg">
                      - ₹{item.expenseAmount}
                    </CustomText>
                  </View>
                  <CustomText className="text-gray-400">{item.expenseDate}</CustomText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Goals */}
        {loading ? (
          <Skeleton h="250px" my="1" rounded="lg" startColor="coolGray.300" />
        ) : (
          <View className="rounded-xl bg-[#222831] justify-center p-2 mt-3 mb-32">
            <View className="items-center justify-between flex-row mb-4 px-2 py-2">
              <CustomText className="text-white text-2xl">
                Goals
              </CustomText>
              <AntDesign name="right" size={14} color="white" style={{ marginRight: 10 }} />
            </View>
            <View className="mx-2 mb-2">
              {historyGoal?.length > 0
                ?
                historyGoal?.map((item, i) => {
                  const percentage = (item.goalSavedMoney / item.goalTargetMoney) * 100;
                  return (
                    <View className="mb-2 py-1 gap-2" key={i}>
                      <CustomText className="text-white text-lg">{item?.goalName}</CustomText>
                      <View className="h-2 bg-gray-400 rounded-full overflow-hidden">
                        <View
                          className="bg-green-500 h-full"
                          style={{ width: `${percentage > 100 ? 100 : percentage}%` }}
                        ></View>
                      </View>
                      <CustomText className="text-white text-sm mt-1">
                        ₹{item?.goalSavedMoney} / ₹{item?.goalTargetMoney}
                      </CustomText>
                    </View>
                  );
                })
                :
                <CustomText className="text-white text-xl">No Goals added till yet</CustomText>
              }
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
