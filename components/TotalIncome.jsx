import { router } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, View, ScrollView } from "react-native";
import { getTotalExpense, numberWithCommas } from "../lib/utils";
import { supabase } from "../lib/supabase";
import CustomText from "./CustomText";
import { Feather } from "@expo/vector-icons";

const TotalIncome = ({ user }) => {
  const { colors } = useTheme()
  const expense = getTotalExpense(user);
  const income = user[0]?.income;
  const savings = user[0]?.savings;
  const expensesData = user[0]?.expenses || [];
  const goalsData = user[0]?.goals || [];
  const handleExpensesClick = () => {
    router.push("/(tabs)/Expenses");
  };



  const [modalVisible, setModalVisible] = useState(false);

  const scale = useRef(new Animated.Value(0)).current;

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

    if (!data || !data[0]) {
      console.log("No user data found for recursion update. Skipping...");
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

  const toggleModal = () => {
    modalVisible.current = !modalVisible.current
  }

  const openModal = () => {
    setModalVisible(true)
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
    <View className="mb-4">
      {/* Monthly Budget Card */}
      <View className="rounded-[28px] bg-[#41B3A2] p-5 mb-4 shadow-lg">
        <View className="flex-row items-center justify-between mb-3">
          <CustomText className="text-white/80 text-sm font-semibold uppercase tracking-wider">Monthly Budget</CustomText>
          <View className="bg-white/20 p-2 rounded-full">
            <Feather name="dollar-sign" size={20} color="white" />
          </View>
        </View>
        <CustomText className="text-white text-4xl font-bold" style={{ fontFamily: "Poppins_Bold" }}>
          ₹{income ? numberWithCommas(income) : "0"}
        </CustomText>
      </View>

      {/* Savings & Expenses Grid */}
      <View className="flex-row w-full justify-between">
        <Pressable
          className="flex-1 rounded-[24px] bg-[#0F9D58] p-4 shadow-md mr-2 flex-col justify-between"
          onPress={openModal}
          style={{ height: 110 }}
        >
          <View className="flex-row items-center justify-between">
            <CustomText className="text-white/90 text-sm font-medium">Savings</CustomText>
            <Feather name="trending-up" size={16} color="white" />
          </View>
          <CustomText
            className="text-white text-2xl font-bold"
            style={{ fontFamily: "Poppins_Bold" }}
          >
            ₹{numberWithCommas(savings)}
          </CustomText>
        </Pressable>

        <Pressable
          className="flex-1 rounded-[24px] bg-[#DB4437] p-4 shadow-md ml-2 flex-col justify-between"
          onPress={handleExpensesClick}
          style={{ height: 110 }}
        >
          <View className="flex-row items-center justify-between">
            <CustomText className="text-white/90 text-sm font-medium">Expenses</CustomText>
            <Feather name="trending-down" size={16} color="white" />
          </View>
          <CustomText
            className="text-white text-2xl font-bold"
            style={{ fontFamily: "Poppins_Bold" }}
          >
            ₹{numberWithCommas(expense) || 0}
          </CustomText>
        </Pressable>
      </View>

      {/* Savings Detail Modal */}
      <Modal transparent visible={modalVisible} animationType="none" onRequestClose={closeModal}>
        <View className="flex-1 justify-center items-center bg-black/60">
          <Animated.View
            style={[
              {
                backgroundColor: colors.expenseForm,
                transform: [{ scale }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 10,
                elevation: 5,
              },
            ]}
            className="w-[90%] max-w-[400px] rounded-3xl p-6"
          >
            <View>
              <CustomText style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }} className="text-2xl mb-4">Savings Detail</CustomText>

              <View className="flex-row justify-between items-center py-3 border-b mb-4" style={{ borderBottomColor: colors.background + '22' }}>
                <CustomText style={{ color: colors.text }} className="text-base font-semibold">Total Savings</CustomText>
                <CustomText style={{ color: "#0F9D58" }} className="text-lg font-bold">₹{numberWithCommas(savings)}</CustomText>
              </View>

              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                <View className="mb-4">
                  <CustomText style={{ color: colors.text }} className="text-base font-bold mb-2">Expenses: ₹{numberWithCommas(expense)}</CustomText>
                  <View className="gap-2">
                    {expensesData.length > 0 ? (
                      Object.entries(totalExpensesByCategory).map(([category, amount]) => (
                        <View key={category} className="p-3 rounded-2xl flex-row justify-between items-center" style={{ backgroundColor: colors.expenseInput }}>
                          <CustomText style={{ color: colors.text }} className="text-sm font-medium">{category}</CustomText>
                          <CustomText style={{ color: colors.text }} className="text-sm font-bold">₹{numberWithCommas(amount)}</CustomText>
                        </View>
                      ))
                    ) : (
                      <CustomText className="text-sm text-gray-500 italic">No expenses yet</CustomText>
                    )}
                  </View>
                </View>

                <View className="mt-2">
                  <CustomText style={{ color: colors.text }} className="text-base font-bold mb-2">Goals Progress</CustomText>
                  <View className="gap-2">
                    {goalsData.length > 0 ? (
                      goalsData.map((goal) => (
                        <View key={goal.goalId} className="p-3 rounded-2xl flex-row justify-between items-center" style={{ backgroundColor: colors.expenseInput }}>
                          <CustomText style={{ color: colors.text }} className="text-sm font-medium">{goal.goalName}</CustomText>
                          <CustomText style={{ color: colors.text }} className="text-sm font-bold">
                            ₹{numberWithCommas(goal.goalSavedMoney)} / ₹{numberWithCommas(goal.goalTargetMoney)}
                          </CustomText>
                        </View>
                      ))
                    ) : (
                      <CustomText className="text-sm text-gray-500 italic">No goals active</CustomText>
                    )}
                  </View>
                </View>
              </ScrollView>
            </View>

            <Pressable onPress={closeModal} className="mt-6 p-4 bg-[#41B3A2] rounded-full shadow-md">
              <CustomText className="text-white text-base text-center font-bold">Close</CustomText>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};


export default TotalIncome;
