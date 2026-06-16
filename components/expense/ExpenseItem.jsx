import { View, TouchableOpacity } from 'react-native';
import React from 'react';
import CustomText from '../CustomText';
import { numberWithCommas } from "../../lib/utils";
import { useTheme } from "expo-router/react-navigation";
import { Feather } from "@expo/vector-icons";

const ExpenseItem = ({ handleExpenseDetail, item, isLast }) => {
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

    const iconConfig = getCategoryIcon(item?.expenseCategory || "", item?.expenseName || "");

    return (
        <TouchableOpacity onPress={() => handleExpenseDetail(item)}>
            <View
                className={`flex-row justify-between items-center rounded-[24px] p-4 ${isLast ? 'mb-32' : 'mb-3'}`}
                style={{ backgroundColor: colors.inputBg }}
            >
                <View className="flex-row items-center flex-1 mr-2">
                    <View
                        className="h-11 w-11 rounded-2xl items-center justify-center mr-3"
                        style={{ backgroundColor: iconConfig.bg }}
                    >
                        <Feather name={iconConfig.name} size={20} color={iconConfig.color} />
                    </View>

                    <View className="flex-1">
                        <CustomText
                            className="text-base font-bold"
                            style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}
                            numberOfLines={1}
                        >
                            {item?.expenseName}
                        </CustomText>
                        <CustomText className="text-xs text-gray-400 mt-1">
                            {item?.expenseDate} • {item?.paymentMode}
                        </CustomText>
                    </View>
                </View>

                <CustomText
                    className="text-red-500 font-bold text-base ml-2"
                    style={{ fontFamily: "Red_Hat" }}
                >
                    -₹{numberWithCommas(Number(item?.expenseAmount))}
                </CustomText>
            </View>
        </TouchableOpacity>
    );
};

export default ExpenseItem;
