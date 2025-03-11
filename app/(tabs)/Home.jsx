import { useIsFocused } from "@react-navigation/native";
import { Stack } from "expo-router";
import { Skeleton, useTheme } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  View
} from "react-native";
import AnimatedHeader from "../../components/AnimatedHeader";
import { useUser } from "../../components/globalState/UserContext";
import HistoryExpense from "../../components/home/HistoryExpense";
import HistoryGoals from "../../components/home/HistoryGoals";
import MonthChart from "../../components/home/MonthChart";
import TotalIncome from "../../components/TotalIncome";
import { supabase } from "../../lib/supabase";

export default function Home() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);
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
    try {
      const { data, error } = await supabase
        .from("User Data")
        .select("*")
        .eq("email", user?.user_metadata?.email);

      if (error) {
        console.error("Error fetching user data:", error);
      } else {
        setUserData(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) getUserRow();
  }, [isFocused]);


  return (
    <View className="flex-1" style={{
      backgroundColor: colors.background
    }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar backgroundColor={colors.header} />
      <ScrollView
        className="px-5 py-2"
        scrollEventThrottle={16}
      >
        <Animated.View>
          <AnimatedHeader
            user={userData}
          />
        </Animated.View>
        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [{ translateY }],
          }}
        >
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

          {loading ? (
            <Skeleton
              h="250px"
              my="1"
              rounded="3xl"
              startColor="coolGray.300"
            />
          ) : (
            <>
              <MonthChart colors={colors} userData={userData} />
            </>
          )}

        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [{ translateY }],
          }}
        >
          {loading ? (
            <Skeleton
              h="250px"
              my="1"
              rounded="3xl"
              startColor="coolGray.300"
            />
          ) : (
            <HistoryExpense
              colors={colors}
              userData={userData}
            />
          )}

          {loading ? (
            <Skeleton
              h="250px"
              my="1"
              rounded="3xl"
              startColor="coolGray.300"
            />
          ) : (
            <HistoryGoals
              colors={colors}
              userData={userData}
            />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
