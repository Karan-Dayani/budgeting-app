import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomText from "../components/CustomText";

export function numberWithCommas(x) {
  return x?.toString()?.replace(/(\d)(?=(\d\d)+\d$)/g, "$1,");
}

export const getTotalExpense = (user) => {
  if (!user || !user[0] || !user[0].expenses || user[0].expenses.length === 0) return 0;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentDay = currentDate.getDate();

  const parseExpenseDate = (expenseDate) => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const [month, day, year] = expenseDate.split(" ");
    const monthIndex = monthNames.indexOf(month);
    return { monthIndex, day: parseInt(day), year: parseInt(year) };
  };

  return user[0].expenses.reduce((total, item) => {
    const { monthIndex, day, year } = parseExpenseDate(item.expenseDate);

    if (
      item.expenseType === "Non-Recurring" &&
      monthIndex === currentMonth &&
      year === currentYear
    ) {
      return total + item.expenseAmount;
    }

    if (item.expenseType === "Recurring") {
      if (currentDay >= day) {
        return total + item.expenseAmount;
      }
    }

    return total;
  }, 0);
};

export const getGoalSavings = (user) => {
  if (!user || !user[0] || !user[0].goals || user[0].goals.length === 0) return 0;
  return user[0].goals.reduce(
    (total, item) => total + item?.goalSavedMoney,
    0
  );
};

export const incomePercent = (income) => {
  return (income * 10) / 100;
};

export function Notification({ isVisible, text, bgColor }) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : -100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  const resolvedBgColor = bgColor === "green.500" ? "#22c55e" : (bgColor || "#22c55e");

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      <View
        style={{
          width: "100%",
          padding: 8,
          borderRadius: 4,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: insets.top + 8,
          backgroundColor: resolvedBgColor
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="checkmark" size={24} color="black" />
          <CustomText style={{ color: "black" }}>{text}</CustomText>
        </View>
      </View>
    </Animated.View>
  );
}
