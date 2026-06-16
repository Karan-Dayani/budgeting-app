import { View, Pressable } from 'react-native'
import React from 'react'
import CustomText from '../CustomText'
import { numberWithCommas } from "../../lib/utils";
import { useTheme } from "expo-router/react-navigation";
import { Feather } from "@expo/vector-icons";

const ExpenseDetail = ({
    selectedExpense,
    handleDeleteExpense,
    closeExpenseDetail
}) => {
    const { colors } = useTheme();

    const getCategoryIcon = (category, name) => {
        const checkStr = (category + " " + name).toLowerCase();
        if (checkStr.includes("food") || checkStr.includes("eat") || checkStr.includes("dine") || checkStr.includes("restaurant") || checkStr.includes("cafe") || checkStr.includes("coffee")) {
            return { name: "coffee", color: "#FF9800", bg: "rgba(255, 152, 0, 0.12)" };
        }
        if (checkStr.includes("car") || checkStr.includes("travel") || checkStr.includes("ride") || checkStr.includes("transport") || checkStr.includes("taxi") || checkStr.includes("auto") || checkStr.includes("fuel") || checkStr.includes("petrol")) {
            return { name: "map-pin", color: "#2196F3", bg: "rgba(33, 150, 243, 0.12)" };
        }
        if (checkStr.includes("shop") || checkStr.includes("buy") || checkStr.includes("cloth") || checkStr.includes("grocery") || checkStr.includes("groceries") || checkStr.includes("mall")) {
            return { name: "shopping-bag", color: "#E91E63", bg: "rgba(233, 30, 99, 0.12)" };
        }
        if (checkStr.includes("bill") || checkStr.includes("util") || checkStr.includes("pay") || checkStr.includes("rent") || checkStr.includes("recharge") || checkStr.includes("electricity") || checkStr.includes("water")) {
            return { name: "file-text", color: "#9C27B0", bg: "rgba(156, 39, 176, 0.12)" };
        }
        if (checkStr.includes("gift") || checkStr.includes("present") || checkStr.includes("donation")) {
            return { name: "gift", color: "#4CAF50", bg: "rgba(76, 175, 80, 0.12)" };
        }
        return { name: "credit-card", color: "#607D8B", bg: "rgba(96, 125, 137, 0.12)" };
    };

    const iconConfig = getCategoryIcon(
        selectedExpense?.expenseCategory || "",
        selectedExpense?.expenseName || ""
    );

    return (
        <Pressable
            onPress={closeExpenseDetail}
            className="flex-1 justify-center items-center bg-opacity-85"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
            <Pressable
                onPress={() => { }}
                className="rounded-[32px] p-6 w-[88%] shadow-2xl relative"
                style={{
                    backgroundColor: colors.expenseForm,
                    borderWidth: 1,
                    borderColor: colors.background + '15'
                }}
            >
                {/* Header Section */}
                <View className="items-center mt-2 mb-4">
                    {/* Category icon circle */}
                    <View
                        className="h-16 w-16 rounded-[24px] items-center justify-center mb-4 shadow-sm"
                        style={{ backgroundColor: iconConfig.bg }}
                    >
                        <Feather name={iconConfig.name} size={28} color={iconConfig.color} />
                    </View>

                    <CustomText
                        className="text-xl font-bold text-center px-4"
                        style={{ color: colors.text, fontFamily: "Poppins_Bold" }}
                        numberOfLines={2}
                    >
                        {selectedExpense?.expenseName}
                    </CustomText>

                    <CustomText
                        className="text-3xl font-extrabold mt-2 text-red-500"
                        style={{ fontFamily: "Poppins_Bold" }}
                    >
                        -₹{numberWithCommas(selectedExpense?.expenseAmount)}
                    </CustomText>
                </View>

                {/* Dashed Separator */}
                <View
                    className="border-b mb-5"
                    style={{
                        borderStyle: 'dashed',
                        borderColor: colors.text + '20',
                        borderWidth: 1,
                        borderRadius: 1
                    }}
                />

                {/* Receipt Details rows */}
                <View className="mb-6 gap-y-3.5 px-1">
                    <View className="flex-row justify-between items-center">
                        <CustomText className="text-gray-400 text-sm font-semibold">Date</CustomText>
                        <CustomText className="text-sm font-bold" style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}>
                            {selectedExpense?.expenseDate}
                        </CustomText>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <CustomText className="text-gray-400 text-sm font-semibold">Category</CustomText>
                        <CustomText className="text-sm font-bold" style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}>
                            {selectedExpense?.expenseCategory || "Other"}
                        </CustomText>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <CustomText className="text-gray-400 text-sm font-semibold">Payment Mode</CustomText>
                        <CustomText className="text-sm font-bold" style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}>
                            {selectedExpense?.paymentMode}
                        </CustomText>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <CustomText className="text-gray-400 text-sm font-semibold">Type</CustomText>
                        <CustomText className="text-sm font-bold" style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}>
                            {selectedExpense?.expenseType || "Non-Recurring"}
                        </CustomText>
                    </View>
                </View>

                {/* Actions */}
                <View className="mt-2 items-center w-full">
                    {/* Primary Action: Close */}
                    <Pressable
                        style={({ pressed }) => [
                            {
                                backgroundColor: "#41B3A2",
                                width: '100%',
                                paddingVertical: 14,
                                borderRadius: 20,
                                alignItems: 'center',
                                shadowColor: "#41B3A2",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 6,
                                elevation: 3,
                                transform: [{ scale: pressed ? 0.98 : 1 }]
                            }
                        ]}
                        onPress={closeExpenseDetail}
                    >
                        <CustomText className="text-white text-base font-bold" style={{ fontFamily: "Poppins_Bold" }}>
                            Dismiss
                        </CustomText>
                    </Pressable>

                    {/* Secondary Action: Delete */}
                    <Pressable
                        style={({ pressed }) => [
                            {
                                paddingVertical: 12,
                                marginTop: 8,
                                opacity: pressed ? 0.6 : 1
                            }
                        ]}
                        onPress={() => handleDeleteExpense()}
                    >
                        <CustomText className="text-red-500 text-sm font-bold" style={{ fontFamily: "Poppins_Bold" }}>
                            Delete Transaction
                        </CustomText>
                    </Pressable>
                </View>
            </Pressable>
        </Pressable>
    )
}

export default ExpenseDetail;