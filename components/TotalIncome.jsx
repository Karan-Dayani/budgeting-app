import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Animated, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { getTotalExpense, numberWithCommas } from "../app/utils";
import { supabase } from "../lib/supabase";
import CustomText from "./CustomText";
import { useTheme } from "@react-navigation/native";

const TotalIncome = ({ user }) => {
  const expense = numberWithCommas(getTotalExpense(user));
  const income = numberWithCommas(user[0]?.income);
  const savings = numberWithCommas(user[0]?.savings);
  const expensesData = user[0]?.expenses || [];
  const goalsData = user[0]?.goals || [];

  const handleExpensesClick = () => {
    router.push("/(tabs)/Expenses");
  };

  const [modalVisible, setModalVisible] = useState(false);
  const scale = useRef(new Animated.Value(0)).current;

  const { colors } = useTheme()

  const recurrsionUpdate = async () => {
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toISOString().split("T")[0];

    let { data, error } = await supabase
      .from("User Data")
      .select("expenses, savings, lastRunDate")
      .eq("email", user[0]?.email);

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    const lastRunDate = data[0]?.lastRunDate || null;

    if (lastRunDate === formattedCurrentDate) {
      console.log("Function has already run today. Skipping...");
      return;
    }

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


    let updatedExpenses = data[0]?.expenses.map((expense) => {
      const { monthIndex, day, year } = parseExpenseDate(expense.expenseDate);


      if (expense.expenseType === "Recurring") {
        const expenseMonthPassed =
          currentMonth > monthIndex ||
          (currentMonth === monthIndex && currentDay >= day);
        if (expenseMonthPassed) {
          expense.times++;
          data[0].savings -= expense.expenseAmount;
        }
      }

      return expense;
    });

    let { updateError } = await supabase
      .from("User Data")
      .update({
        expenses: updatedExpenses,
        savings: data[0]?.savings,
        lastRunDate: formattedCurrentDate,
      })
      .eq("email", user[0]?.email);

    if (updateError) {
      console.error("Error updating data:", updateError);
    } else {
      console.log("Data successfully updated");
    }
  };

  const updateData = async () => {
    const { data, error } = await supabase
      .from("User Data")
      .update({ savings: user[0]?.income })
      .eq("email", user[0]?.email);
  };

  useEffect(() => {
    if (new Date().getDate() === 1) {
      updateData();
    }
    recurrsionUpdate();
  }, []);

  const openModal = () => {
    setModalVisible(true);
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(scale, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const calculateExpensesByCategory = () => {
    const categoryTotals = {};

    expensesData.forEach((expense) => {
      const { expenseCategory, expenseAmount } = expense;
      categoryTotals[expenseCategory] = (categoryTotals[expenseCategory] || 0) + expenseAmount;
    });

    return categoryTotals;
  };

  const totalExpensesByCategory = calculateExpensesByCategory();

  const renderExpensesSummary = () => {
    return Object.entries(totalExpensesByCategory).map(([category, amount]) => (
      <CustomText key={category} style={{ color: colors.text }} className="text-lg">
        {category}: ₹{numberWithCommas(amount)}
      </CustomText>
    ));
  };

  const renderGoals = () => {
    return goalsData.map((goal) => (
      <View key={goal.goalId} className="flex-row justify-between mb-2">
        <CustomText className="text-lg" style={{ color: colors.text }}>
          {goal.goalName}: {numberWithCommas(goal.goalSavedMoney)} / {numberWithCommas(goal.goalTargetMoney)}
        </CustomText>
      </View>
    ));
  };
  return (
    <View className="">
      <View className="rounded-3xl bg-[#41B3A2] justify-center px-5 py-3 mb-2 flex-2">
        <View className="items-center justify-between flex-row mb-4">
          <CustomText className="text-white text-xl">Monthly Income</CustomText>
          {/* <AntDesign
                        name="right"
                        size={14}
                        color="white"
                        style={{ marginRight: 10 }}
                    /> */}
        </View>
        {income ? (
          <CustomText
            className="text-white text-3xl"
            style={{ fontFamily: "Red_Hat" }}
          >
            ₹{income}
          </CustomText>
        ) : (
          <CustomText className="text-white text-3xl">Not mentioned</CustomText>
        )}
      </View>
      <View className="flex-row w-full justify-between">
        <Pressable className="flex-1 rounded-3xl bg-green-800 p-3 shadow-2xl mr-2" onPress={openModal}>
          <View className="items-center justify-between flex-row mb-4" >
            <View className="flex-row items-center gap-2">
              <CustomText className="text-white text-xl">Savings</CustomText>
            </View>
            {/* <AntDesign
                            name="right"
                            size={14}
                            color="white"
                            style={{ marginRight: 10 }}
                        /> */}
          </View>
          <CustomText
            className="text-white text-3xl"
            style={{ fontFamily: "Red_Hat" }}
          >
            ₹{savings}
          </CustomText>
        </Pressable>
        <View
          className="flex-1 rounded-3xl bg-red-700 p-3 shadow-2xl ml-0"
          onStartShouldSetResponder={() => handleExpensesClick()}
        >
          <View className="items-center justify-between flex-row mb-4">
            <CustomText className="text-white text-xl">Expenses</CustomText>
            {/* <AntDesign
                            name="right"
                            size={14}
                            color="white"
                            style={{ marginRight: 10 }}
                        /> */}
          </View>
          <CustomText
            className="text-white text-3xl"
            style={{ fontFamily: "Red_Hat" }}
          >
            ₹{expense}
          </CustomText>
        </View>
      </View>
      <Modal transparent visible={modalVisible} animationType="none">
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
          <Animated.View
            style={[
              {
                backgroundColor: colors.expenseForm,
                transform: [{ scale }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 10,
                elevation: 5, // For Android shadow
              },
            ]}
            className="w-[90%] max-w-[400px] rounded-2xl p-6"
          >
            <View>
              <CustomText style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }} className="text-2xl ">Savings Detail</CustomText>
              <CustomText style={{ color: colors.text }} className="text-lg font-medium mt-4">Total Savings: ₹{savings}</CustomText>

              <View className="mt-4">
                <CustomText style={{ color: colors.text }} className="text-lg font-medium">Expenses: ₹{expense}</CustomText>
                <View className="mt-2 space-y-2">
                  {renderExpensesSummary().map((item, index) => (
                    <View key={index} className=" p-4 rounded-xl shadow-md" style={{ backgroundColor: colors.expenseInput }}>
                      <CustomText style={{ color: colors.text }} className="text-md">{item}</CustomText>
                    </View>
                  ))}
                </View>
              </View>

              <View className="mt-4">
                <CustomText style={{ color: colors.text }} className="text-lg font-medium">Goals:</CustomText>
                <View className="mt-2 space-y-2">
                  {renderGoals().map((item, index) => (
                    <View key={index} className=" p-4 rounded-xl shadow-md" style={{ backgroundColor: colors.expenseInput }}>
                      <CustomText style={{ color: colors.text }} className="text-md">{item}</CustomText>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <Pressable onPress={closeModal} className="mt-6 p-3 bg-[#41B3A2] rounded-full">
              <CustomText className="text-white text-lg text-center font-semibold">Close</CustomText>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
};


export default TotalIncome;
