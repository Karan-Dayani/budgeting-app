import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Modal,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

export default function ExpensesPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" })
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [expense, setExpense] = useState({
    expenseName: "",
    expenseAmount: 0,
    paymentMode: "",
    expenseDate: new Date().toDateString().slice(4),
  });

  const handleExpenseChange = (fieldName, value) => {
    setExpense((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  const handleAddExpense = () => {
    setModalVisible(true);
  };

  const handleSaveExpense = () => {
    // Add your logic to save the expense
    console.log(expense);

    // Reset form and close modal
    setExpense((prevData) => ({
      ...prevData,
      expenseName: "",
      expenseAmount: 0,
      paymentMode: "",
    }));
    setModalVisible(false);
  };

  return (
    <View className="px-5 flex-1">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Expenses",
          headerTitleStyle: {
            color: "white",
            fontFamily: "Nunito",
            fontSize: 25,
          },
          headerStyle: { backgroundColor: "#0F0F0F" },
        }}
      />
      <SafeAreaView className="h-full">
        <Pressable
          onPress={handleAddExpense}
          className="bg-blue-500 p-2 rounded-full absolute right-0 bottom-5 z-10"
        >
          <Ionicons name="add" size={40} color="white" />
        </Pressable>
        <View className="my-4 flex-row justify-between items-center">
          <View>
            <Text className="text-2xl text-white font-bold">
              Expenses Summary
            </Text>
            <Text className="text-lg text-gray-400">
              Overview of your monthly expenses
            </Text>
          </View>
        </View>
        <View className="my-4">
          <Text className="text-lg text-gray-400 mb-2">Select Month:</Text>
          <View className="bg-[#1C1C1C] rounded-xl p-2">
            <Picker
              selectedValue={selectedDate}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedDate(itemValue)
              }
              style={{ color: "white" }}
              itemStyle={{ borderRadius: 50 }}
            >
              <Picker.Item label="June 2024" value="June 2024" />
              <Picker.Item label="May 2024" value="May 2024" />
              <Picker.Item label="April 2024" value="April 2024" />
            </Picker>
          </View>
        </View>
        <ScrollView>
          <View className="items-center ">
            <View className="rounded-xl bg-[#413F42] mb-4 p-4 w-full">
              <Text className="text-white">Expense details will be here</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-[#1C1C1C] rounded-xl p-5 w-4/5">
            <Text className="text-xl text-white mb-4">Add Expense</Text>
            <TextInput
              placeholder="Expense Name"
              placeholderTextColor="gray"
              onChangeText={(value) =>
                handleExpenseChange("expenseName", value)
              }
              className="bg-[#31363F] text-white p-2 mb-4 rounded-lg"
            />
            <TextInput
              placeholder="Expense Amount"
              placeholderTextColor="gray"
              onChangeText={(value) =>
                handleExpenseChange("expenseAmount", Number(value))
              }
              keyboardType="numeric"
              className="bg-[#31363F] text-white p-2 mb-4 rounded-lg"
            />
            <TextInput
              placeholder="Payment Mode"
              placeholderTextColor="gray"
              onChangeText={(value) =>
                handleExpenseChange("paymentMode", value)
              }
              className="bg-[#31363F] text-white p-2 mb-4 rounded-lg"
            />
            <Pressable
              onPress={handleSaveExpense}
              className="bg-blue-500 p-3 rounded-lg mb-2"
            >
              <Text className="text-white text-center">Save Expense</Text>
            </Pressable>
            <Pressable
              onPress={() => setModalVisible(false)}
              className="bg-red-500 p-3 rounded-lg"
            >
              <Text className="text-white text-center">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
