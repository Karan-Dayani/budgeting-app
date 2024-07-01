import React from "react";
import { View, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";

function numberWithCommas(x) {
    return x?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const TotalIncome = ({ user }) => {
    const getTotalExpense = () => {
        if (user[0]?.expenses?.length === 0) return 0;
        return user[0]?.expenses?.reduce(
            (total, item) => total + item?.expenseAmount,
            0
        );
    };

    const expense = numberWithCommas(getTotalExpense());

    const income = numberWithCommas(user[0]?.income);

    const savings = numberWithCommas(user[0]?.income - getTotalExpense());

    const handleExpensesClick = () => {
        router.push("/(tabs)/Expenses");
    };

    return (
        <View
            className=""

        >
            <View className="rounded-3xl bg-cardColor justify-center px-5 py-3 mb-2 flex-2" >
                <View className="items-center justify-between flex-row mb-4">
                    <Text
                        className="text-white text-xl"
                        style={{ fontFamily: "Red_Hat" }}
                    >
                        Monthly Income
                    </Text>
                    <AntDesign
                        name="right"
                        size={14}
                        color="white"
                        style={{ marginRight: 10 }}
                    />
                </View>
                {income ? (
                    <Text
                        className="text-white text-3xl"
                        style={{ fontFamily: "Red_Hat" }}
                    >
                        ₹{income}
                    </Text>
                ) : (
                    <Text
                        className="text-white text-3xl"
                        style={{ fontFamily: "Red_Hat" }}
                    >
                        Not mentioned
                    </Text>
                )}
            </View>
            <View className="flex-row w-full justify-between">
                <View className="flex-1 rounded-xl bg-green-800 p-2 shadow-2xl mr-2">
                    <View className="items-center justify-between flex-row mb-4">
                        <View className="flex-row items-center gap-2">
                            <Text
                                className="text-white text-xl"
                                style={{ fontFamily: "Red_Hat" }}
                            >
                                Savings
                            </Text>
                        </View>
                        <AntDesign
                            name="right"
                            size={14}
                            color="white"
                            style={{ marginRight: 10 }}
                        />
                    </View>
                    <Text
                        className="text-white text-3xl"
                        style={{ fontFamily: "Red_Hat" }}
                    >
                        ₹{savings}
                    </Text>
                </View>
                <View
                    className="flex-1 rounded-xl bg-red-700 p-2 shadow-2xl ml-0"
                    onStartShouldSetResponder={() => handleExpensesClick()}
                >
                    <View className="items-center justify-between flex-row mb-4">
                        <Text
                            className="text-white text-xl"
                            style={{ fontFamily: "Red_Hat" }}
                        >
                            Expenses
                        </Text>
                        <AntDesign
                            name="right"
                            size={14}
                            color="white"
                            style={{ marginRight: 10 }}
                        />
                    </View>
                    <Text
                        className="text-white text-3xl"
                        style={{ fontFamily: "Red_Hat" }}
                    >
                        ₹{expense}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default TotalIncome;
