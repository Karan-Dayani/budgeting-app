import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { Select } from "native-base";
import { useTheme } from "@react-navigation/native";

const RecurringExpense = ({
    expense,
    handleExpenseChange,
    handleSaveExpense,
    setModalVisible,
    setRecurringModal
}) => {
    const data = [
        { label: "Cash", value: "Cash" },
        { label: "Online", value: "Online" },
        { label: "Card", value: "Card" },
    ];

    const { colors } = useTheme()

    return (
        <View className="flex-1 justify-center items-center bg-opacity-50" style={{ backgroundColor: colors.background }}>
            <View className=" rounded-2xl p-5 w-11/12 justify-between" style={{ backgroundColor: colors.inputBg }}>
                <View>
                    <Text className="text-2xl mb-4 font-Red_Hat" style={{ color: colors.text }}>Amount</Text>
                    <TextInput
                        placeholder="0"
                        onChangeText={(text) =>
                            handleExpenseChange("expenseAmount", Number(text))
                        }
                        className="bg-gray-700 text-white p-4 mb-3 rounded-xl border-[1px] border-white"
                        placeholderTextColor="#888"
                        keyboardType="numeric"
                    />
                    <Text className=" text-2xl mb-4 font-Red_Hat" style={{ color: colors.text }}>Name</Text>
                    <TextInput
                        placeholder="Expense Name"
                        value={expense.expenseName}
                        onChangeText={(text) => handleExpenseChange("expenseName", text)}
                        className="bg-gray-700 text-white p-4 mb-4 rounded-xl border-[1px] border-white "
                        placeholderTextColor="#888"
                    />
                    <Text className=" text-2xl mb-4 font-Red_Hat" style={{ color: colors.text }}>
                        Select Mode
                    </Text>
                    <Select
                        accessibilityLabel="Payment mode"
                        backgroundColor="coolGray.700"
                        borderWidth="2"
                        rounded="20px"
                        selectedValue={expense.paymentMode}
                        placeholder="Payment Mode"
                        placeholderTextColor="#888"
                        onValueChange={(value) => handleExpenseChange("paymentMode", value)}
                        _selectedItem={{
                            bg: "gray.300",
                            color: "white",
                        }}
                        color="white"
                        fontSize="18"
                        h="60px"
                        marginBottom="8"
                    >
                        {data.map((item) => (
                            <Select.Item
                                key={item.value}
                                label={item.label}
                                value={item.value}
                            />
                        ))}
                    </Select>
                </View>
                <View className="flex-row justify-between">
                    <Pressable
                        onPress={() => setRecurringModal(false)}
                        className="bg-red-500 p-5 rounded-full justify-center"
                    >
                        <Entypo name="cross" size={25} color="white" />
                    </Pressable>
                    <Pressable
                        onPress={handleSaveExpense}
                        className="bg-blue-500 p-5 rounded-full justify-center"
                    >
                        <MaterialIcons name="check" size={25} color="white" />
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

export default RecurringExpense;
