import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  SafeAreaView,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text
} from "react-native";
import { Stack } from "expo-router";
import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { Dropdown } from "react-native-element-dropdown";
import uuid from "react-native-uuid";
import { Button, NativeBaseProvider, Select } from "native-base";


import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTheme } from "@react-navigation/native";
import RecurringExpense from "../../components/modals/RecurringExpense";
import ExpenseDetail from "../../components/modals/ExpenseDetail";

export default function ExpensesPage() {
  const [isOpen, setIsOpen] = useState(false);
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

  const { colors } = useTheme()

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
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
    async function fetchData() {
      const { data, error } = await supabase
        .from("User Data")
        .select("expenses, income")
        .eq("email", user?.user_metadata?.email);

      if (error) {
        console.error(error);
        Alert.alert("Error fetching data");
      } else {
        setUserExpenses(data[0]?.expenses || []);
        setIncome(data[0]?.income || 0);
      }
      setLoading(false);
    }

    if (user) {
      setLoading(true);
      fetchData();
    }
  }, [user, expense]);

  let datedExpenses = [];

  if (selectedDate === "") {
    datedExpenses = userExpenses;
  } else {
    datedExpenses = userExpenses?.filter(
      (expense) => expense.expenseDate === selectedDate
    );
  }


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
    setIsOpen(!isOpen)
    setTimeout(() => {
      setIsOpen(false);
    }, 4000);
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

  return (
    <View className="px-5 flex-1 ">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerTitleStyle: {
            color: colors.text,
            fontFamily: "Nunito",
            fontSize: 25,
          },
          headerStyle: { backgroundColor: colors.header, height: 50 },
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
              className={`text-2xl`}
              style={{ fontFamily: "Nunito", color: colors.text }}
            >
              Expenses
            </Text>
          </View>
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <View>
                {selectedDate ? (
                  <Text className={`text-xl font-bold ml-1`} style={{ color: colors.text }}>
                    {selectedDate}
                  </Text>
                ) : (
                  <Text className={` text-xl font-bold ml-1`} style={{ color: colors.text }}>
                    {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
                  </Text>
                )}
                <Text className={`px-1`} style={{ color: colors.text }}>
                  Total expense: ₹{getTotalExpense()}
                </Text>
              </View>

              {selectedDate ? (
                <Pressable
                  onPress={() => setSelectedDate("")}
                  className="bg-red-500 p-3 rounded-xl justify-center "
                >
                  <Text className="text-white">Reset</Text>
                </Pressable>
              ) : (
                <Button
                  onPress={showDatePicker}
                  className="rounded-xl bg-cardColor"
                >
                  <Text className="text-white">Select Date</Text>
                </Button>
              )}
            </View>
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
          <ScrollView className="mt-2">
            <View className="w-full mb-16">
              {datedExpenses?.map((item, index) => (
                <View key={index}>
                  <TouchableOpacity
                    onLongPress={() => handleExpenseDetail(item)}
                  >
                    <View className="rounded-2xl bg-gray-900 px-5 py-4 my-2">
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
            <ExpenseDetail
              selectedExpense={selectedExpense}
              handleDeleteExpense={handleDeleteExpense}
              closeExpenseDetail={closeExpenseDetail}
            />
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
        <RecurringExpense
          expense={expense}
          handleExpenseChange={handleExpenseChange}
          handleSaveExpense={handleSaveExpense}
          setModalVisible={setModalVisible}
        />
      </Modal>
    </View>

  );
}
