import { AntDesign } from "@expo/vector-icons";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { Skeleton } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  View
} from "react-native";
import {
  PieChart
} from "react-native-chart-kit";
import CircularProgress from "react-native-circular-progress-indicator";
import AnimatedHeader from "../../components/AnimatedHeader";
import CustomText from "../../components/CustomText";
import { useUser } from "../../components/globalState/UserContext";
import TotalIncome from "../../components/TotalIncome";
import { supabase } from "../../lib/supabase";
import { numberWithCommas } from "../utils";

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

  const data = [
    {
      name: "Seoul",
      population: 21500000,
      color: "rgba(131, 167, 234, 1)",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "Toronto",
      population: 2800000,
      color: "#F00",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "Beijing",
      population: 527612,
      color: "red",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "New York",
      population: 8538000,
      color: "#ffffff",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "Moscow",
      population: 11920000,
      color: "rgb(0, 0, 255)",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    }
  ];

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
            user={userData}
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
        <View className="w-full items-center justify-center bg-[#191A19] rounded-3xl mt-2 h-52">
          <PieChart
            data={data}
            width={278}
            height={200}
            chartConfig={{
              backgroundColor: "#e26a00",
              backgroundGradientFrom: "#fb8c00",
              backgroundGradientTo: "#ffa726",
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726"
              }
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        </View>

        {/* History */}
        {loading ? (
          <Skeleton h="250px" my="1" rounded="3xl" startColor="coolGray.300" />
        ) : (
          <View className="rounded-3xl bg-[#222831] justify-center p-3 mt-3">
            <View className="items-center justify-between flex-row mb-4 px-2 py-2 shadow-2xl">
              <CustomText className="text-white text-2xl">
                Spendings
              </CustomText>

              <AntDesign name="right" size={14} color="white" />

            </View>
            <View className="mx-1 mb-2">
              {historyExpense?.length > 0
                ?
                historyExpense?.map((item, index) => (
                  <View key={index} className="mb-3 p-4 bg-gray-700 rounded-3xl">
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

                ))
                :
                <CustomText className="text-white text-xl">No Expense added till yet</CustomText>
              }
            </View>
          </View>
        )}

        {/* Goals */}
        {loading ? (
          <Skeleton h="250px" my="1" rounded="3xl" startColor="coolGray.300" />
        ) : (
          <View className="rounded-3xl bg-[#222831] justify-center p-3 mt-3 mb-32">
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

                  return (
                    <View key={i} className="mb-3 p-4 bg-gray-700 rounded-3xl ">
                      <View className="flex-row justify-between">
                        <View className="justify-center">
                          <CustomText
                            className="text-xl w-40 text-white"

                          >
                            {item.goalName}
                          </CustomText>
                          <CustomText
                            className="text-md mt-2 text-white"

                          >
                            ₹{numberWithCommas(Number(item.goalSavedMoney))}{" "}
                            / ₹
                            {numberWithCommas(Number(item.goalTargetMoney))}
                          </CustomText>
                        </View>
                        <View className="">
                          <CircularProgress
                            value={Math.round(
                              (item.goalSavedMoney / item.goalTargetMoney) *
                              100
                            )}
                            radius={35}
                            valueSuffix={"%"}
                          />
                        </View>
                      </View>
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
