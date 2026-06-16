import { View, TouchableOpacity } from 'react-native';
import React from 'react';
import CustomText from '../CustomText';
import { numberWithCommas } from "../../lib/utils";
import { useTheme } from "expo-router/react-navigation";

const ExpenseItem = ({ handleExpenseDetail, item, isLast }) => {
    const { colors, dark } = useTheme();

    return (
        <TouchableOpacity onPress={() => handleExpenseDetail(item)}>
            <View
                className={`rounded-[24px] px-6 py-5 ${isLast ? 'mb-32' : 'mb-3'} shadow-sm`} // Apply mb-32 only if it's the last item
                style={{ 
                    backgroundColor: colors.itemBg,
                    borderWidth: dark ? 0 : 1,
                    borderColor: '#E5E7EB',
                }}
            >
                <View className="flex-row justify-between mb-2">
                    <CustomText className="text-xl" style={{ color: colors.text }}>
                        {item?.expenseName}
                    </CustomText>
                    <CustomText className="text-lg" style={{ color: colors.text }}>
                        ₹{numberWithCommas(Number(item?.expenseAmount))}
                    </CustomText>
                </View>
                <CustomText style={{ color: colors.secondary }}>
                    Payment Mode: {item?.paymentMode}
                </CustomText>
                <CustomText style={{ color: colors.secondary }}>
                    Date: {item?.expenseDate}
                </CustomText>
            </View>
        </TouchableOpacity>
    );
};

export default ExpenseItem;
