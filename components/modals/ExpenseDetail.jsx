import { View, Text, Pressable } from 'react-native'
import React from 'react'
import CustomText from '../CustomText'
import { numberWithCommas } from "../../lib/utils";
import { useTheme } from "expo-router/react-navigation";

const ExpenseDetail = ({
    selectedExpense,
    handleDeleteExpense,
    closeExpenseDetail
}) => {

    const { colors } = useTheme()

    return (
        <Pressable onPress={closeExpenseDetail} className="flex-1 justify-center items-center bg-opacity-80" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
            <Pressable onPress={() => { }} className="rounded-3xl p-8 w-10/12 shadow-lg" style={{ backgroundColor: colors.expenseForm }}>
                <CustomText
                    className="text-3xl mb-2"
                    style={{ color: colors.text }}
                >
                    {selectedExpense?.expenseName}
                </CustomText>
                <CustomText
                    className="text-yellow-500 text-2xl mb-2"
                    style={{ fontWeight: 'bold' }}
                >
                    ₹{numberWithCommas(selectedExpense?.expenseAmount)}
                </CustomText>
                <CustomText
                    className="text-xl mb-2"
                    style={{ color: colors.secondary }}
                >
                    Date: {selectedExpense?.expenseDate}
                </CustomText>
                <CustomText
                    className="text-xl mb-4"
                    style={{ color: colors.secondary }}
                >
                    Payment Mode: {selectedExpense?.paymentMode}
                </CustomText>
                <Pressable
                    className="bg-red-500 p-3 rounded-xl mb-4"
                    onPress={() => handleDeleteExpense()}
                >
                    <CustomText
                        className="text-white text-center text-lg"
                    >
                        Delete
                    </CustomText>
                </Pressable>
                <Pressable
                    onPress={closeExpenseDetail}
                    className="bg-blue-500 p-3 rounded-xl"
                >
                    <CustomText
                        className="text-white text-center text-lg"
                    >
                        Close
                    </CustomText>
                </Pressable>
            </Pressable>
        </Pressable>
    )
}

export default ExpenseDetail