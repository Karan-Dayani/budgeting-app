import React, { useEffect } from "react";
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
  }, []);

  return (
    <View className="">
      <View className="rounded-3xl bg-[#41B3A2] justify-center px-5 py-3 mb-2 flex-2">
        <View className="items-center justify-between flex-row mb-4">
          <CustomText
            className="text-white text-xl"

          >
            Monthly Income
          </CustomText>
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
          <CustomText
            className="text-white text-3xl"

          >
            Not mentioned
          </CustomText>
        )}
      </View>
      <View className="flex-row w-full justify-between">
        <View className="flex-1 rounded-3xl bg-green-800 p-3 shadow-2xl mr-2">
          <View className="items-center justify-between flex-row mb-4">
            <View className="flex-row items-center gap-2">
              <CustomText
                className="text-white text-xl"

              >
                Savings
              </CustomText>
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
            <CustomText
              className="text-white text-xl"

            >
              Expenses
            </CustomText>
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
