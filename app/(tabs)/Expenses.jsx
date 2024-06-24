import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Button,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { Dropdown } from "react-native-element-dropdown";
import uuid from "react-native-uuid";

import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function ExpensesPage() {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [user, setUser] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [expense, setExpense] = useState({
    expenseId: uuid.v4(),
    expenseName: "",
    expenseAmount: 0,
    paymentMode: "",
    expenseDate: new Date().toDateString().slice(4),
  });
  const [userExpenses, setUserExpenses] = useState([]);
  const [income, setIncome] = useState(0);
  const [expenseDetail, setExpenseDetail] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    console.log(new Date(date).toDateString().slice(4));
    setSelectedDate(new Date(date).toDateString().slice(4));
    hideDatePicker();
  };

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
    setLoading(true);
    async function fetchData() {
      const { data, err } = await supabase
        .from("User Data")
        .select("expenses, income")
        .eq("email", user?.user_metadata?.email);

      setUserExpenses(data[0]?.expenses || []);
      setIncome(data[0]?.income || 0);
    }
    fetchData();
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    setLoading(false);
    return () => clearTimeout(timer);
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

  const handleExpenseDetail = (item) => {
    setSelectedExpense(item);
    setExpenseDetail(true);
  };

  const closeExpenseDetail = () => {
    setExpenseDetail(false);
    setSelectedExpense(null);
  };

  const handleSaveExpense = async () => {
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

    setExpense({
      expenseName: "",
      expenseAmount: 0,
      paymentMode: "",
      expenseDate: new Date().toDateString().slice(4),
    });
    setModalVisible(false);
  };

  const handleDeleteExpense = async () => {
    const { data, err } = await supabase
      .from("User Data")
      .select("expenses")
      .eq("email", user?.user_metadata?.email);

    const prevArray = data[0]?.expenses || [];
    const updatedArray = prevArray.filter(
      (exp) => exp.expenseId !== selectedExpense.expenseId
    );

    console.log(updatedArray);

    await supabase
      .from("User Data")
      .update({ expenses: updatedArray })
      .eq("email", user?.user_metadata?.email);

    setUserExpenses(updatedArray);

    setExpenseDetail(false);
    setSelectedExpense(null);
  };

  const getTotalExpense = () => {
    if (userExpenses?.length === 0) return 0;
    return userExpenses?.reduce(
      (total, item) => total + item?.expenseAmount,
      0
    );
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
        <View className=" w-full">
          <View className="h-12 justify-start">
            <Text
              className="text-white text-3xl"
              style={{ fontFamily: "Red_Hat" }}
            >
              Monthly Expenses
            </Text>
          </View>
          {/* <Text className="text-gray-400 mb-2">Select month :</Text>
          <View className="w-42 h-12  rounded-lg">
            <Picker
              selectedValue={selectedDate}
              onValueChange={(itemValue) => setSelectedDate(itemValue)}
              style={{
                height: "100%",
                width: "100%",
                color: "white",
                fontFamily: "Red_Hat",
              }}
              itemStyle={{
                backgroundColor: "#000",
                color: "#fff",
                fontFamily: "Red_Hat",
                fontSize: 16,
              }}
            >
              <Picker.Item label="January 2024" value="January 2024" />
              <Picker.Item label="February 2024" value="February 2024" />
              <Picker.Item label="March 2024" value="March 2024" />
              <Picker.Item label="April 2024" value="April 2024" />
              <Picker.Item label="May 2024" value="May 2024" />
              <Picker.Item label="June 2024" value="June 2024" />
              <Picker.Item label="July 2024" value="July 2024" />
              <Picker.Item label="August 2024" value="August 2024" />
              <Picker.Item label="September 2024" value="September 2024" />
              <Picker.Item label="October 2024" value="October 2024" />
              <Picker.Item label="November 2024" value="November 2024" />
              <Picker.Item label="December 2024" value="December 2024" />
            </Picker>
          </View> */}
          <View>
            <Button title="Show Date Picker" onPress={showDatePicker} />
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />
          </View>
        </View>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="white"
            className=" justify-center h-96"
          />
        ) : (
          <ScrollView className="mt-5">
            <View className="w-full mb-16">
              {userExpenses?.map((item, index) => (
                <View key={index}>
                  <TouchableOpacity
                    onLongPress={() => handleExpenseDetail(item)}
                  >
                    <View className="rounded-lg bg-gray-900 p-4 my-2">
                      <View className="flex-row justify-between mb-2">
                        <Text
                          className="text-white text-xl"
                          style={{ fontFamily: "Red_Hat" }}
                        >
                          {item?.expenseName}
                        </Text>
                        <Text
                          className="text-white text-lg"
                          style={{ fontFamily: "Red_Hat" }}
                        >
                          ₹{item?.expenseAmount}
                        </Text>
                      </View>
                      <Text
                        className="text-gray-400"
                        style={{ fontFamily: "Red_Hat" }}
                      >
                        Payment Mode: {item?.paymentMode}
                      </Text>
                      <Text
                        className="text-gray-400"
                        style={{ fontFamily: "Red_Hat" }}
                      >
                        Date: {item?.expenseDate}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
        {selectedExpense && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={expenseDetail}
            onRequestClose={closeExpenseDetail}
          >
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
          </Modal>
        )}
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
          <View className="bg-gray-800 rounded-lg p-5 w-11/12">
            <Text
              className="text-white text-2xl mb-4"
              style={{ fontFamily: "Red_Hat" }}
            >
              Name
            </Text>
            <TextInput
              placeholder="Expense Name"
              value={expense.expenseName}
              onChangeText={(text) => handleExpenseChange("expenseName", text)}
              className="bg-gray-700 text-white p-2 mb-4 rounded-lg"
              placeholderTextColor="#888"
            />
            <Text
              className="text-white text-2xl mb-4"
              style={{ fontFamily: "Red_Hat" }}
            >
              Amount
            </Text>
            <TextInput
              placeholder="0"
              onChangeText={(text) =>
                handleExpenseChange("expenseAmount", Number(text))
              }
              className="bg-gray-700 text-white p-2 mb-4 rounded-lg"
              placeholderTextColor="#888"
              keyboardType="numeric"
            />
            <Text
              className="text-white text-2xl mb-4"
              style={{ fontFamily: "Red_Hat" }}
            >
              Select Mode
            </Text>
            <Dropdown
              className="bg-gray-700 rounded-lg px-2 py-3 mb-5 text-white"
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
              className="bg-blue-500 p-3 rounded-lg mb-2"
            >
              <Text
                className="text-white text-center text-lg"
                style={{ fontFamily: "Red_Hat" }}
              >
                Save Expense
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setModalVisible(false)}
              className="bg-red-500 p-3 rounded-lg"
            >
              <Text
                className="text-white text-center text-lg"
                style={{ fontFamily: "Red_Hat" }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
