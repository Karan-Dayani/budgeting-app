import { router } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import React, { useEffect } from "react";
import { Pressable, View } from "react-native";
import { getTotalExpense, numberWithCommas } from "../lib/utils";
import { supabase } from "../lib/supabase";
import CustomText from "./CustomText";
import { Feather } from "@expo/vector-icons";

const TotalIncome = ({ user }) => {
  const { colors } = useTheme();
  const expense = getTotalExpense(user);
  const accountsData = user[0]?.accounts || [];

  const handleExpensesClick = () => {
    router.push("/(tabs)/Expenses");
  };

  const recurrsionUpdate = async () => {
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toISOString().split("T")[0];

    try {
      const [userResponse, transResponse] = await Promise.all([
        supabase
          .from("User Data")
          .select("savings, lastRunDate")
          .eq("email", user[0]?.email),
        supabase
          .from("transactions")
          .select("*")
          .eq("user_email", user[0]?.email)
          .eq("expense_type", "Recurring")
      ]);

      if (userResponse.error) throw userResponse.error;
      if (transResponse.error) throw transResponse.error;

      const userData = userResponse.data[0];
      const recurringTrans = transResponse.data || [];

      if (!userData) {
        console.log("No user data found for recursion update. Skipping...");
        return;
      }

      const lastRunDate = userData.lastRunDate || null;

      if (lastRunDate === formattedCurrentDate) {
        console.log("Function has already run today. Skipping...");
        return;
      }

      const parseExpenseDate = (expenseDateStr) => {
        const parts = expenseDateStr.split("-");
        if (parts.length === 3) {
          return {
            monthIndex: parseInt(parts[1], 10) - 1,
            day: parseInt(parts[2], 10),
            year: parseInt(parts[0], 10)
          };
        }
        const today = new Date();
        return { monthIndex: today.getMonth(), day: today.getDate(), year: today.getFullYear() };
      };

      let updatedSavings = userData.savings;
      let transactionsToUpdateDate = [];

      for (let tx of recurringTrans) {
        const { monthIndex, day, year } = parseExpenseDate(tx.transaction_date);
        const nextBillingDate = new Date(year, monthIndex + 1, day);

        if (currentDate >= nextBillingDate) {
          updatedSavings -= tx.amount;

          transactionsToUpdateDate.push(
            supabase
              .from("transactions")
              .update({ transaction_date: nextBillingDate.toISOString().split("T")[0] })
              .eq("id", tx.id)
          );
        }
      }

      const updateSavingsPromise = supabase
        .from("User Data")
        .update({
          savings: updatedSavings,
          lastRunDate: formattedCurrentDate,
        })
        .eq("email", user[0]?.email);

      const results = await Promise.all([
        updateSavingsPromise,
        ...transactionsToUpdateDate
      ]);

      const hasError = results.some(r => r.error);
      if (hasError) {
        console.error("Error updating recursion data");
      } else {
        console.log("Data successfully updated");
      }
    } catch (error) {
      console.error("Error running recursion update:", error);
    }
  };

  useEffect(() => {
    recurrsionUpdate();
  }, []);

  return (
    <View className="mb-4">
      {/* Monthly Budget Card */}
      <View className="rounded-[28px] bg-[#41B3A2] p-5 mb-4 shadow-lg">
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <CustomText className="text-white/80 text-sm font-semibold uppercase tracking-wider">Total Balance</CustomText>
          <View className="bg-white/20 p-2 rounded-full">
            <Feather name="dollar-sign" size={20} color="white" />
          </View>
        </View>
        <CustomText className="text-white text-4xl font-bold" style={{ fontFamily: "Poppins_Bold" }}>
          ₹{numberWithCommas(accountsData.reduce((sum, acc) => sum + (acc.balance || 0), 0))}
        </CustomText>
      </View>

      {/* Expenses Card (Full Width) */}
      <Pressable
        className="rounded-[28px] bg-[#DB4437] p-5 shadow-lg flex-col justify-between"
        onPress={handleExpensesClick}
        style={{ height: 110 }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <CustomText className="text-white/90 text-sm font-semibold uppercase tracking-wider">Total Expenses</CustomText>
          <View className="bg-white/20 p-2 rounded-full">
            <Feather name="trending-down" size={20} color="white" />
          </View>
        </View>
        <CustomText
          className="text-white text-3xl font-bold"
          style={{ fontFamily: "Poppins_Bold" }}
        >
          ₹{numberWithCommas(expense) || 0}
        </CustomText>
      </Pressable>
    </View>
  );
};

export default TotalIncome;
