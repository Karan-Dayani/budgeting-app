import { AntDesign } from "@expo/vector-icons";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { Skeleton } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
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
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const isFocused = useIsFocused();
  const { colors } = useTheme();

  const fadeInOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.timing(fadeInOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.timing(translateY, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const getUserRow = async () => {
    const { data, error } = await supabase
      .from("User Data")
      .select("*")
      .eq("email", user?.user_metadata?.email);
    setUserData(data);

    let barData = data[0]?.expenses?.filter(
      (expense) => expense.expenseType === "Non-Recurring"
    );

    if (data?.length > 0) {
      processExpenses(barData);
    }
  };

  useEffect(() => {
    getUserRow();

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
    extrapolate: "clamp",
  });

  const processExpenses = (expenses) => {
    const months = Array(12).fill(0);

    const monthMap = {
      January: 0,
      Jan: 0,
      February: 1,
      Feb: 1,
      March: 2,
      Mar: 2,
      April: 3,
      Apr: 3,
      May: 4,
      June: 5,
      Jun: 5,
      July: 6,
      Jul: 6,
      August: 7,
      Aug: 7,
      September: 8,
      Sep: 8,
      October: 9,
      Oct: 9,
      November: 10,
      Nov: 10,
      December: 11,
      Dec: 11,
    };

    expenses?.forEach((expense) => {
      let date;
      if (typeof expense.expenseDate === "string") {
        const parts = expense.expenseDate.split(" ");
        const [monthStr, day, year] = parts;

        const normalizedMonthStr =
          monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase();
        const month = monthMap[normalizedMonthStr];

        if (month !== undefined) {
          date = new Date(year, month, day);
        }
      }

      if (date instanceof Date && !isNaN(date)) {
        const month = date.getMonth();
        months[month] += expense.expenseAmount;
      } else {
        console.log("Invalid date:", expense.expenseDate);
      }
    });

    const currentMonth = new Date().getMonth();

    const lastFourMonths = [
      (currentMonth - 3 + 12) % 12,
      (currentMonth - 2 + 12) % 12,
      (currentMonth - 1 + 12) % 12,
      currentMonth,
    ];

    const monthlyExpenses = lastFourMonths.map((monthIndex) =>
      Math.round(months[monthIndex])
    );
    setMonthlyExpenses(monthlyExpenses);
  };

  const chartConfig = {
    backgroundGradientFrom: colors.chartBg,
    backgroundGradientTo: colors.chartBg,
    decimalPlaces: 0,
    color: () => "#41B3A2",
    labelColor: (opacity = 1) => colors.text,
    strokeWidth: 3,
    propsForBackgroundLines: {
      stroke: "transparent",
    },
    fillShadowGradient: "#41B3A2",
    fillShadowGradientOpacity: 0.7,
  };

  const generateLabels = () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const currentMonth = new Date().getMonth();

    const startMonth = (currentMonth - 3 + 12) % 12;

    const labels = [];
    for (let i = 0; i < 4; i++) {
      labels.push(monthNames[(startMonth + i) % 12]);
    }

    return labels;
  };

  const data = {
    labels: generateLabels(),
    datasets: [
      {
        data: monthlyExpenses.slice(-4),
        color: (opacity = 1) => `#41B3A2`,
        strokeWidth: 1,
      },
    ],
  };


  const checkDataLength = data?.datasets[0]?.data.filter((x) => x > 0).length

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
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: StatusBar.currentHeight,
          backgroundColor: colors.background,
          opacity: fadeInOpacity,
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
        <Animated.View>
          <AnimatedHeader
            toggleMenu={toggleMenu}
            handleLogOut={handleLogOut}
            user={userData}
          />
        </Animated.View>
        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [{ translateY }],
          }}
        >
          {/* Content sections */}
          {loading ? (
            <>
              <Skeleton
                h="100px"
                mb="1"
                rounded="20px"
                startColor="coolGray.300"
              />
              <View className="flex-row justify-between">
                <Skeleton
                  h="100px"
                  w="156px"
                  my="1"
                  rounded="20px"
                  startColor="coolGray.300"
                />
                <Skeleton
                  h="100px"
                  w="156px"
                  my="1"
                  rounded="20px"
                  startColor="coolGray.300"
                />
              </View>
            </>
          ) : (
            <>
              <Animated.View className="w-full">
                <TotalIncome user={userData} />
              </Animated.View>
            </>
          )}
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [{ translateY }],
          }}
        >
          <View className="w-full items-center">
            {loading ? (
              <Skeleton
                h="250px"
                my="1"
                rounded="3xl"
                startColor="coolGray.300"
              />
            ) : (
              <>
                <View
                  className="w-full p-5 rounded-3xl mt-3 h-[22rem]"
                  style={{ backgroundColor: colors.chartBg }}
                >
                  <CustomText
                    className="text-2xl mb-8"
                    style={{ color: colors.text }}
                  >
                    Monthly Expense Chart
                  </CustomText>
                  <View className={`${checkDataLength > 0 ? "items-center justify-center" : "justify-center"}`}>
                    {checkDataLength ?
                      <BarChart
                        data={data}
                        width={Dimensions.get("window").width - 30}
                        height={240}
                        chartConfig={chartConfig}
                        bezier
                        style={{ paddingLeft: 60, paddingRight: 90 }}
                        yAxisLabel="₹ "
                        fromZero
                      />
                      :
                      <CustomText className=" text-xl" style={{ color: colors.text }}>
                        No Expense added till yet
                      </CustomText>
                    }
                  </View>
                </View>
              </>
            )}
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [{ translateY }],
          }}
        >
          {/* History */}
          {loading ? (
            <Skeleton
              h="250px"
              my="1"
              rounded="3xl"
              startColor="coolGray.300"
            />
          ) : (
            <View
              className="rounded-3xl justify-center p-3 mt-3"
              style={{ backgroundColor: colors.chartBg }}
            >
              <View className="items-center justify-between flex-row mb-4 px-2 py-2 shadow-2xl">
                <CustomText className="text-2xl" style={{ color: colors.text }}>
                  History
                </CustomText>

                <AntDesign name="right" size={14} color={colors.text} />
              </View>
              <View className="mx-1 mb-2">
                {historyExpense?.length > 0 ? (
                  historyExpense?.map((item, index) => (
                    <View
                      key={index}
                      className="mb-3 p-4 rounded-3xl"
                      style={{ backgroundColor: colors.homeCardItem }}
                    >
                      <View className="flex-row justify-between">
                        <CustomText
                          className=" text-lg"
                          style={{ color: colors.text }}
                        >
                          {item.expenseName}
                        </CustomText>
                        <CustomText className="text-red-500 text-lg">
                          - ₹{item.expenseAmount}
                        </CustomText>
                      </View>
                      <CustomText className="text-gray-400">
                        {item.expenseDate}
                      </CustomText>
                    </View>
                  ))
                ) : (
                  <CustomText className=" text-xl" style={{ color: colors.text }}>
                    No Expense added till yet
                  </CustomText>
                )}
              </View>
            </View>
          )}

          {/* Goals */}
          {loading ? (
            <Skeleton
              h="250px"
              my="1"
              rounded="3xl"
              startColor="coolGray.300"
            />
          ) : (
            <View
              className="rounded-3xl  justify-center p-3 mt-3 mb-32"
              style={{ backgroundColor: colors.chartBg }}
            >
              <View className="items-center justify-between flex-row mb-4 px-2 py-2">
                <CustomText className="text-2xl" style={{ color: colors.text }}>
                  Goals
                </CustomText>
                <AntDesign
                  name="right"
                  size={14}
                  color="white"
                  style={{ marginRight: 10 }}
                />
              </View>
              <View className="mx-2 mb-2">
                {historyGoal?.length > 0 ? (
                  historyGoal?.map((item, i) => {
                    return (
                      <View
                        key={i}
                        className="mb-3 p-4 rounded-3xl bg-gray-700 "
                        style={{ backgroundColor: colors.homeCardItem }}
                      >
                        <View className="flex-row justify-between">
                          <View className="justify-center">
                            <CustomText
                              className="text-xl w-40 "
                              style={{ color: colors.text }}
                            >
                              {item.goalName}
                            </CustomText>
                            <CustomText
                              className="text-md mt-2 "
                              style={{ color: colors.text }}
                            >
                              ₹{numberWithCommas(Number(item.goalSavedMoney))} /
                              ₹{numberWithCommas(Number(item.goalTargetMoney))}
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
                ) : (
                  <CustomText className=" text-xl" style={{ color: colors.text }}>
                    No Goals added till yet
                  </CustomText>
                )}
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
