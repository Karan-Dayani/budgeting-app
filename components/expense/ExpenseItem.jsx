import { View, TouchableOpacity } from 'react-native';
import React from 'react';
import CustomText from '../CustomText';
import { numberWithCommas } from '../../app/utils';
import { useTheme } from '@react-navigation/native';

const ExpenseItem = ({ handleExpenseDetail, item, isLast }) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity onPress={() => handleExpenseDetail(item)}>
            <View
                className={`rounded-3xl px-6 py-5 my-2 ${isLast ? 'mb-32' : ''}`}
                style={{ backgroundColor: colors.inputBg }}
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
