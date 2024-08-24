import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native'
import CustomText from '../CustomText'

const ExpenseDetail = ({
    selectedExpense,
    handleDeleteExpense,
    closeExpenseDetail
}) => {

    const { colors } = useTheme()

    return (
        <View className="flex-1 justify-center items-center bg-opacity-70" style={{ backgroundColor: colors.background }}>
            <View className=" rounded-2xl p-6 w-11/12" style={{ backgroundColor: "#31363F" }}>
                <CustomText
                    className="text-white text-3xl mb-2"

                >
                    {selectedExpense?.expenseName}
                </CustomText>
                <CustomText
                    className="text-yellow-400 text-2xl mb-2"

                >
                    ₹{selectedExpense?.expenseAmount}
                </CustomText>
                <CustomText
                    className="text-gray-400 text-xl mb-2"

                >
                    Date: {selectedExpense?.expenseDate}
                </CustomText>
                <CustomText
                    className="text-gray-400 text-xl mb-4"

                >
                    Payment Mode: {selectedExpense?.paymentMode}
                </CustomText>
                <Pressable
                    className="bg-red-500 p-3 rounded-lg mb-2"
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
                    className="bg-blue-500 p-3 rounded-lg"
                >
                    <CustomText
                        className="text-white text-center text-lg"

                    >
                        Close
                    </CustomText>
                </Pressable>
            </View>
        </View>
    )
}

export default ExpenseDetail