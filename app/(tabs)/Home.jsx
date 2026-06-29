import { useIsFocused } from "expo-router/react-navigation";
import { Stack } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
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

const Skeleton = ({ h, w, my, mb, rounded }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        height: typeof h === "string" && h.endsWith("px") ? parseInt(h) : h,
        width: typeof w === "string" && w.endsWith("px") ? parseInt(w) : w || "100%",
        marginTop: my ? (my === "1" ? 4 : 8) : undefined,
        marginBottom: mb ? (mb === "1" ? 4 : 8) : my ? (my === "1" ? 4 : 8) : undefined,
        borderRadius: rounded === "3xl" ? 24 : rounded === "20px" ? 20 : 8,
        backgroundColor: colors.inputBg || "#E5E7EB",
      }}
    />
  );
};

export default function Home() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);
  const isFocused = useIsFocused();
  const { colors, dark } = useTheme();
  const fadeInOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (isFocused) {
      fadeInOpacity.setValue(0);
      translateY.setValue(10);
      Animated.parallel([
        Animated.timing(fadeInOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      fadeInOpacity.setValue(0);
      translateY.setValue(10);
    }
  }, [isFocused]);

  const getUserRow = async () => {
    try {
      const [userResponse, transResponse, goalsResponse] = await Promise.all([
        supabase
          .from("User Data")
          .select("*")
          .eq("email", user?.user_metadata?.email),
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user?.id)
          .order("transaction_date", { ascending: false }),
        supabase
          .from("goals")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false })
      ]);

      if (userResponse.error) throw userResponse.error;
      if (transResponse.error) throw transResponse.error;
      if (goalsResponse.error) throw goalsResponse.error;

      const formattedTrans = (transResponse.data || []).map((tx) => {
        let formattedDate = "";
        if (tx.transaction_date) {
          const dateParts = tx.transaction_date.split("-");
          if (dateParts.length === 3) {
            const yearInt = parseInt(dateParts[0], 10);
            const monthInt = parseInt(dateParts[1], 10) - 1;
            const dayInt = parseInt(dateParts[2], 10);
            const d = new Date(yearInt, monthInt, dayInt);
            formattedDate = d.toDateString().slice(4);
          } else {
            formattedDate = new Date(tx.transaction_date).toDateString().slice(4);
          }
        } else {
          formattedDate = new Date().toDateString().slice(4);
        }
        return {
          ...tx,
          expenseId: tx.id,
          expenseName: tx.expense_name,
          expenseAmount: tx.amount,
          paymentMode: tx.payment_mode,
          expenseDate: formattedDate,
          expenseCategory: tx.category,
          expenseType: tx.expense_type,
        };
      });

      const formattedGoals = (goalsResponse.data || []).map((g) => ({
        goalId: g.id,
        goalName: g.goal_name,
        goalTargetMoney: Number(g.target_amount),
        goalSavedMoney: Number(g.saved_amount),
        deadline: g.deadline,
        createdAt: g.created_at,
      }));

      if (userResponse.data && userResponse.data[0]) {
        userResponse.data[0].expenses = formattedTrans;
        userResponse.data[0].goals = formattedGoals;
      }
      setUserData(userResponse.data);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused && user) {
      getUserRow();
    }
  }, [isFocused, user]);


  return (
    <View className="flex-1 mb-5" style={{
      backgroundColor: colors.background
    }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar
        barStyle={dark ? "light-content" : "dark-content"}
        backgroundColor={colors.header}
      />
      <ScrollView
        className="px-5 py-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
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
               <MonthChart colors={colors} dark={dark} userData={userData} />
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
              dark={dark}
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
              dark={dark}
              userData={userData}
            />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
