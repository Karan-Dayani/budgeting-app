import { View, Text, Pressable } from 'react-native'
import React from 'react'

const ExpenseDetail = ({
    selectedExpense,
    handleDeleteExpense,
    closeExpenseDetail
}) => {

    return (
        <View className="flex-1 justify-center items-center bg-black bg-opacity-70">
            <View className="bg-gray-900 rounded-lg p-6 w-11/12">
                <Text
                    className="text-white text-3xl mb-4"
                    style={{ fontFamily: "Red_Hat" }}
                >
                    {selectedExpense?.expenseName}
                </Text>
                <Text
                    className="text-yellow-400 text-2xl mb-4"
                    style={{ fontFamily: "Red_Hat" }}
                >
                    ₹{selectedExpense?.expenseAmount}
                </Text>
                <Text
                    className="text-gray-400 text-xl mb-4"
                    style={{ fontFamily: "Red_Hat" }}
                >
                    Date: {selectedExpense?.expenseDate}
                </Text>
                <Text
                    className="text-gray-400 text-xl mb-4"
                    style={{ fontFamily: "Red_Hat" }}
                >
                    Payment Mode: {selectedExpense?.paymentMode}
                </Text>
                <Pressable
                    className="bg-red-500 p-3 rounded-lg mb-2"
                    onPress={() => handleDeleteExpense()}
                >
                    <Text
                        className="text-white text-center text-lg"
                        style={{ fontFamily: "Red_Hat" }}
                    >
                        Delete
                    </Text>
                </Pressable>
                <Pressable
                    onPress={closeExpenseDetail}
                    className="bg-blue-500 p-3 rounded-lg"
                >
                    <Text
                        className="text-white text-center text-lg"
                        style={{ fontFamily: "Red_Hat" }}
                    >
                        Close
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

export default ExpenseDetail