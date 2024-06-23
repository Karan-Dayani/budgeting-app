import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../../lib/supabase";
import { Dropdown } from "react-native-element-dropdown";

export default function ExpensesPage() {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" })
  );
  const [user, setUser] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [expense, setExpense] = useState({
    expenseName: "",
    expenseAmount: 0,
    paymentMode: "",
    expenseDate: new Date().toDateString().slice(4),
  });
  const [userExpenses, setUserExpenses] = useState([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      } else {
        Alert.alert("error accessing user");
      }
    });
  }, []);

  useEffect(() => {
    setLoading(true)
    async function fetchData() {
      const { data, err } = await supabase
        .from("User Data")
        .select("expenses")
        .eq("email", user?.user_metadata?.email);

      setUserExpenses(data[0]?.expenses);
    }
    fetchData();
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
    setLoading(false)
  }, [user, expense]);



  const handleExpenseChange = (fieldName, value) => {
    setExpense((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  const handleAddExpense = () => {
    setModalVisible(true);
  };

  const handleSaveExpense = async () => {
    // Add your logic to save the expense
    const { data, err } = await supabase
      .from("User Data")
      .select("expenses")
      .eq("email", user?.user_metadata?.email);

    const prevArray = data[0]?.expenses || [];
    const updatedArray = [expense, ...prevArray];


    await supabase
      .from("User Data")
      .update({ expenses: updatedArray })
      .eq("email", user?.user_metadata?.email);
    // Reset form and close modal
    setExpense((prevData) => ({
      ...prevData,
      expenseName: "",
      expenseAmount: 0,
      paymentMode: "",
    }));
    setModalVisible(false);
  };

  const getTotalExpense = () => {
    if (userExpenses?.length === 0) return 0;
    return userExpenses?.reduce((total, item) => total + item?.expenseAmount, 0);
  };



  const data = [
    { label: "Cash", value: "Cash" },
    { label: "Online", value: "Online" },
    { label: "Card", value: "Card" },
  ];

  return (
    <View className="px-5 flex-1 ">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerTitleStyle: {
            color: "white",
            fontFamily: "Nunito",
            fontSize: 25,
          },
          headerStyle: { backgroundColor: "#0F0F0F", height: 50 },
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
          <Text className="text-xl text-white my-5">
            Total Expense: ₹{getTotalExpense()}
          </Text>
        </View>
        {loading ? <ActivityIndicator color="white" className="pt-10" size={35} /> :
          <ScrollView className="">
            {userExpenses ? (
              <View className="">
                <View className="rounded-xl bg-gradient-to-r from-[#413F42] to-[#2C2B2E] mb-4 w-full shadow-lg">
                  <View className="flex-row mb-5 border-b-2 border-gray-500 justify-between pb-2 ">
                    <Text className="text-white text-lg flex-1">Name</Text>
                    <View className="flex-row flex-1 justify-between">
                      <Text className="text-white text-lg font-semibold">Money</Text>
                      <Text className="text-white text-lg font-semibold">Mode</Text>
                    </View>
                  </View>
                  <>
                    {userExpenses?.map((item, index) => (
                      <View className="flex-row justify-between mb-5 py-5 px-3 rounded bg-[#2C2B2E] " key={index} >
                        <Text className="text-white text-lg flex-1">{item.expenseName}</Text>
                        <View className="flex-row flex-1 justify-between">
                          <Text className="text-white text-lg">₹{item.expenseAmount}</Text>
                          <Text className="text-white text-lg">{item.paymentMode}</Text>
                        </View>
                      </View>
                    ))}
                  </>
                </View>
              </View>
            ) : (
              <View className="  "  >
                <Text className="text-white text-lg">No expenses till yet</Text>
              </View>
            )}
          </ScrollView>
        }

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
            <Text className="text-xl text-white mb-4">Name</Text>
            <TextInput
              placeholder="Expense Name"
              placeholderTextColor="gray"
              onChangeText={(value) =>
                handleExpenseChange("expenseName", value)
              }
              className="bg-[#31363F] text-white p-2 mb-4 rounded-lg"
            />
            <Text className="text-xl text-white mb-4">Amount</Text>
            <TextInput
              placeholder="Expense Amount"
              placeholderTextColor="gray"
              onChangeText={(value) =>
                handleExpenseChange("expenseAmount", Number(value))
              }
              keyboardType="numeric"
              className="bg-[#31363F] text-white p-2 mb-4 rounded-lg"
            />
            <Text className="text-xl text-white mb-4">Payment mode</Text>
            {/* <TextInput
              placeholder="Payment Mode"
              placeholderTextColor="gray"
              onChangeText={(value) =>
                handleExpenseChange("paymentMode", value)
              }
              className="bg-[#31363F] text-white p-2 mb-4 rounded-lg"
            /> */}
            <Dropdown
              className="bg-[#31363F] rounded-lg px-2 py-3 mb-5 text-white"
              placeholderStyle={{ color: "gray" }}
              selectedTextStyle={{ color: "white" }}
              data={data}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Payment Mode"
              value={expense.paymentMode}
              onChange={(value) =>
                handleExpenseChange("paymentMode", value.value)
              }
            />
            <Pressable
              onPress={handleSaveExpense}
              className="bg-blue-500 p-3 rounded-lg mb-5"
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
