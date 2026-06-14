import { Ionicons } from "@expo/vector-icons";
import { Box, HStack } from "native-base";
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
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

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : -100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

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
      <Box
        w="100%"
        p="2"
        borderRadius="xs"
        alignItems="center"
        justifyContent="center"
        safeAreaTop
        bg={bgColor}
      >
        <HStack space={2}>
          <Ionicons name="checkmark" size={24} color="white" />
          <CustomText className="text-white">{text}</CustomText>
        </HStack>
      </Box>
    </Animated.View>
  );
}
