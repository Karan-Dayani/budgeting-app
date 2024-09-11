import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { getTotalExpense, numberWithCommas } from "../app/utils";
import { supabase } from "../lib/supabase";
import CustomText from "./CustomText";

const TotalIncome = ({ user }) => {
  const expense = numberWithCommas(getTotalExpense(user));

  const income = numberWithCommas(user[0]?.income);

  const savings = numberWithCommas(user[0]?.savings);

  const handleExpensesClick = () => {
    router.push("/(tabs)/Expenses");
  };

  const recurrsionUpdate = async () => {
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD

    // Fetch the user's data including the 'lastRunDate'
    let { data, error } = await supabase
      .from("User Data")
      .select("expenses, savings, lastRunDate")
      .eq("email", user[0]?.email);

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    const lastRunDate = data[0]?.lastRunDate || null;

    // Check if the function has already run today
    if (lastRunDate === formattedCurrentDate) {
      console.log("Function has already run today. Skipping...");
      return;
    }

    const currentMonth = currentDate.getMonth(); // Get the current month (0-indexed)
    const currentYear = currentDate.getFullYear(); // Get the current year
    const currentDay = currentDate.getDate(); // Get the current day of the month

    // Helper function to parse the custom "MMM DD YYYY" date format
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
      const monthIndex = monthNames.indexOf(month); // Convert month name to month index (0-11)
      return { monthIndex, day: parseInt(day), year: parseInt(year) };
    };

    // Process each expense
    let updatedExpenses = data[0]?.expenses.map((expense) => {
      const { monthIndex, day, year } = parseExpenseDate(expense.expenseDate);

      // Recurring expenses logic: Increment 'times' only after the date in the current month
      if (expense.expenseType === "Recurring") {
        const expenseMonthPassed =
          currentMonth > monthIndex ||
          (currentMonth === monthIndex && currentDay >= day);
        if (expenseMonthPassed) {
          expense.times++;
          // Deduct the expenseAmount from savings
          data[0].savings -= expense.expenseAmount;
        }
      }

      return expense;
    });

    // Update the database with the new expenses, savings, and the 'lastRunDate' field
    let { updateError } = await supabase
      .from("User Data")
      .update({
        expenses: updatedExpenses,
        savings: data[0]?.savings,
        lastRunDate: formattedCurrentDate, // Update lastRunDate to today's date
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
        <View className="flex-1 rounded-3xl bg-green-800 p-3 shadow-2xl mr-2">
          <View className="items-center justify-between flex-row mb-4">
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
        </View>
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
    </View>
  );
};

export default TotalIncome;
