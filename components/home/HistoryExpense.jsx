import React from "react";
import { View } from "react-native";
import CustomText from "../CustomText";
import { AntDesign } from "@expo/vector-icons";


const HistoryExpense = ({ colors, userData }) => {
    const historyExpense = userData[0]?.expenses?.slice(0, 4);
    return (
        <View>
            <View
                className="rounded-3xl justify-center p-3 mt-3"
                style={{ backgroundColor: colors.chartBg }}
            >
                <View className="items-center justify-between flex-row mb-4 px-2 py-2 shadow-2xl">
                    <CustomText className="text-2xl" style={{ color: colors.text }}>
                        History
                    </CustomText>

                    <AntDesign name="right" size={14} color={colors.text} />
                </View>
                <View className="mx-1 mb-2">
                    {historyExpense?.length > 0 ? (
                        historyExpense?.map((item, index) => (
                            <View
                                key={index}
                                className="mb-3 p-4 rounded-3xl"
                                style={{ backgroundColor: colors.homeCardItem }}
                            >
                                <View className="flex-row justify-between">
                                    <CustomText
                                        className=" text-lg"
                                        style={{ color: colors.text }}
                                    >
                                        {item.expenseName}
                                    </CustomText>
                                    <CustomText className="text-red-500 text-lg">
                                        - ₹{item.expenseAmount}
                                    </CustomText>
                                </View>
                                <CustomText className="text-gray-400">
                                    {item.expenseDate}
                                </CustomText>
                            </View>
                        ))
                    ) : (
                        <CustomText className=" text-xl" style={{ color: colors.text }}>
                            No Expense added till yet
                        </CustomText>
                    )}
                </View>
            </View>
        </View>
    )
}

export default HistoryExpense