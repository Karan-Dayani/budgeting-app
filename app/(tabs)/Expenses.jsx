import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { Box, HStack, Menu, Slide } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import uuid from "react-native-uuid";
import CustomText from "../../components/CustomText";
import { useUser } from "../../components/globalState/UserContext";
import AddExpenseModal from "../../components/modals/AddExpenseModal";
import CustomAlert from "../../components/modals/CustomAlert";
import ExpenseDetail from "../../components/modals/ExpenseDetail";
import { supabase } from "../../lib/supabase";
import NoDataLoad from "../../screens/NoDataLoad";
import { incomePercent, numberWithCommas } from "../utils";

export default function ExpensesPage() {
  const isFocused = useIsFocused();
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const { user } = useUser();
  const [addExpenseModal, setAddExpenseModal] = useState(false);
  const [expenseDetail, setExpenseDetail] = useState(false);
  const [monthModal, setMonthModal] = useState(false);
  const [expense, setExpense] = useState({
    expenseId: uuid.v4(),
    expenseName: "",
    expenseAmount: 0,
    paymentMode: "",
    expenseDate: new Date().toDateString().slice(4),
    expenseCategory: "",
    expenseType: "",
  });
  const [userExpenses, setUserExpenses] = useState([]);
  const [income, setIncome] = useState(0);
  const [savings, setSavings] = useState(0);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [activeTab, setActiveTab] = useState("Non-Recurring");
  const [alertVisible, setAlertVisible] = useState(false);
  const [hasShownSavingsAlert, setHasShownSavingsAlert] = useState(false);

  const { colors } = useTheme();

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const handleConfirm = (date) => {
    setSelectedDate(new Date(date).toDateString().slice(4));
    hideDatePicker();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(-1, i).toLocaleString("default", { month: "long" })
  );

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("User Data")
        .select("expenses, savings, income")
        .eq("email", user?.user_metadata?.email);

      if (error) {
        console.error(error);
        Alert.alert("Error fetching data");
      } else {
        setUserExpenses(data[0]?.expenses || []);
        setSavings(data[0]?.savings || 0);
        setIncome(data[0]?.income || 0);
      }

      setLoading(false);
    }

    if (user) {
      setLoading(true);
      fetchData();
    }
  }, [user, expense, isFocused]);

  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
    } else {
      console.log(income);
      if (savings <= incomePercent(income) && !hasShownSavingsAlert) {
        setAlertVisible(true);
        setHasShownSavingsAlert(true);
      }
    }
  }, [savings, income]);

  const handleExpenseChange = (fieldName, value) => {
    setExpense((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
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
    if (savings <= Number(incomePercent(income)) && !hasShownSavingsAlert) {
      setAlertVisible(true);
      setHasShownSavingsAlert(true);
    }

    if (
      !expense.expenseName.trim() ||
      !expense.expenseAmount ||
      !expense.paymentMode.trim() ||
      !expense.expenseCategory.trim() ||
      !expense.expenseType.trim()
    ) {
      Alert.alert("Please fill in all the fields before saving.");
      return;
    }

    const { data, err } = await supabase
      .from("User Data")
      .select("expenses")
      .eq("email", user?.user_metadata?.email);

    const prevArray = data[0]?.expenses || [];
    const updatedArray = [expense, ...prevArray];
    const updatedSavings = savings - expense.expenseAmount;

    await supabase
      .from("User Data")
      .update({ expenses: updatedArray, savings: updatedSavings })
      .eq("email", user?.user_metadata?.email);

    setExpense({
      expenseId: uuid.v4(),
      expenseName: "",
      expenseAmount: 0,
      paymentMode: "",
      expenseDate: new Date().toDateString().slice(4),
      expenseCategory: "",
      expenseType: "",
    });

    setAddExpenseModal(false);
    setIsSaved(!isSaved);
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
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
    const updatedSavings = savings + selectedExpense.expenseAmount;

    await supabase
      .from("User Data")
      .update({ expenses: updatedArray, savings: updatedSavings })
      .eq("email", user?.user_metadata?.email);
    setUserExpenses(updatedArray);
    setExpenseDetail(false);
    setSelectedExpense(null);

    setIsDeleted(!isDeleted);
    setTimeout(() => {
      setIsDeleted(false);
    }, 2500);
  };

  const isCurrentMonth = new Date().toDateString().slice(4).split(" ");
  const [month, date, year] = isCurrentMonth;

  const filteredExpenses = userExpenses.filter(
    (expense) =>
      ((selectedDate === "" &&
        selectedMonth === "" &&
        expense.expenseDate.includes(month) &&
        expense.expenseDate.includes(year)) ||
        expense.expenseDate === selectedDate ||
        expense.expenseDate.slice(0, 3) === selectedMonth.slice(0, 3)) &&
      expense.expenseType === activeTab
  );

  return (
    <View className="px-5 flex-1 ">
      <Stack.Screen
        options={{
          headerShown: true,
          headerShadowVisible: false,
          headerTitle: "",
          headerTitleStyle: {
            color: colors.text,
            fontSize: 25,
          },
          headerStyle: { backgroundColor: colors.header, height: 50 },
        }}
      />
      <SafeAreaView className="h-full">
        <Pressable
          onPress={() => setAddExpenseModal(true)}
          className="bg-[#41B3A2] p-3 rounded-full absolute right-2 bottom-32 z-10"
        >
          <Ionicons name="add" size={40} color="white" />
        </Pressable>
        <View className="w-full mt-4">
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <View>
                {selectedDate ? (
                  <CustomText
                    className={`text-xl  ml-1`}
                    style={{ color: colors.text }}
                  >
                    {selectedDate}
                  </CustomText>
                ) : (
                  <CustomText
                    className={`text-xl ml-1`}
                    style={{ color: colors.text }}
                  >
                    All Expenses
                  </CustomText>
                )}
                <CustomText className={`px-1`} style={{ color: colors.text }}>
                  Total Expense:
                </CustomText>
              </View>
              <View className="flex-row gap-x-3">
                {selectedDate || selectedMonth ? (
                  <Pressable
                    onPress={() => {
                      setSelectedDate("");
                      setSelectedMonth("");
                      setDatePickerVisibility(false);
                    }}
                    className="bg-red-500 px-5 py-3 rounded-3xl justify-center "
                  >
                    <CustomText className="text-white text-lg mx-2">
                      Reset
                    </CustomText>
                  </Pressable>
                ) : (
                  <Menu
                    w="160"
                    marginRight={5}
                    backgroundColor={colors.inputBg}
                    rounded="3xl"
                    trigger={(triggerProps) => {
                      return (
                        <Pressable
                          accessibilityLabel="More options menu"
                          {...triggerProps}
                        >
                          <View
                            className="flex-row items-center rounded-3xl p-3"
                            style={{ backgroundColor: colors.inputBg }}
                          >
                            <Ionicons
                              name="filter"
                              size={20}
                              color={colors.text}
                            />
                            <CustomText
                              className="text-lg mx-2"
                              style={{ color: colors.text }}
                            >
                              Filter
                            </CustomText>
                          </View>
                        </Pressable>
                      );
                    }}
                  >
                    <Menu.Item
                      _text={{
                        color: colors.text,
                        fontSize: "lg",
                        paddingBottom: 2,
                      }}
                      onPress={() => setDatePickerVisibility(true)}
                    >
                      Date
                    </Menu.Item>
                    <Menu.Item
                      _text={{
                        color: colors.text,
                        fontSize: "lg",
                        paddingBottom: 2,
                      }}
                      onPress={() => setMonthModal(true)}
                    >
                      Month
                    </Menu.Item>
                    <Menu.Item
                      _text={{
                        color: colors.text,
                        fontSize: "lg",
                        paddingBottom: 2,
                      }}
                    >
                      Category
                    </Menu.Item>
                  </Menu>
                  // <Pressable
                  //   onPress={() => console.log("hi")}
                  //   className="flex-row items-center bg-gray-700 rounded-3xl p-3"
                  // >
                  //   <Ionicons name="filter" size={20} color={colors.text} />
                  //   <CustomText className="text-white text-lg mx-2">Filter</CustomText>
                  // </Pressable>
                )}
              </View>
            </View>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={() => setDatePickerVisibility(false)}
            />
          </View>
        </View>
        <View className="flex-row my-4 gap-x-4">
          <Pressable
            className="flex-1 p-3 rounded-3xl"
            onPress={() => setActiveTab("Non-Recurring")}
            style={{
              backgroundColor:
                activeTab === "Non-Recurring" ? "#57A6A1" : colors.inputBg,
            }}
          >
            <CustomText
              style={{ color: colors.text }}
              className="text-lg text-center"
            >
              Non-Recurring
            </CustomText>
          </Pressable>

          <Pressable
            className="flex-1 p-3 rounded-3xl"
            onPress={() => setActiveTab("Recurring")}
            style={{
              backgroundColor:
                activeTab === "Recurring" ? "#57A6A1" : colors.inputBg,
            }}
          >
            <CustomText
              style={{ color: colors.text }}
              className="text-lg text-center"
            >
              Recurring
            </CustomText>
          </Pressable>
        </View>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.text}
            className="justify-center h-96"
          />
        ) : (
          <ScrollView className="mt-2" showsVerticalScrollIndicator={false}>
            <View className="w-full mb-40">
              {filteredExpenses.length > 0 ? (
                filteredExpenses?.map((item, index) => (
                  <View key={index}>
                    <TouchableOpacity
                      onLongPress={() => handleExpenseDetail(item)}
                    >
                      <View
                        className="rounded-3xl px-6 py-5 my-2"
                        style={{ backgroundColor: colors.inputBg }}
                      >
                        <View className="flex-row justify-between mb-2">
                          <CustomText
                            className="text-xl"
                            style={{
                              color: colors.text,
                            }}
                          >
                            {item?.expenseName}
                          </CustomText>
                          <CustomText
                            className="text-lg"
                            style={{
                              color: colors.text,
                            }}
                          >
                            ₹{numberWithCommas(Number(item?.expenseAmount))}
                          </CustomText>
                        </View>
                        <CustomText
                          style={{
                            color: colors.secondary,
                          }}
                        >
                          Payment Mode: {item?.paymentMode}
                        </CustomText>
                        <CustomText
                          style={{
                            color: colors.secondary,
                          }}
                        >
                          Date: {item?.expenseDate}
                        </CustomText>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <NoDataLoad selectedDate={selectedDate} />
              )}
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
        visible={addExpenseModal}
        onRequestClose={() => {
          setAddExpenseModal(!addExpenseModal);
        }}
      >
        <AddExpenseModal
          expense={expense}
          handleExpenseChange={handleExpenseChange}
          handleSaveExpense={handleSaveExpense}
          setAddExpenseModal={setAddExpenseModal}
        />
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={monthModal}
        onRequestClose={() => {
          setMonthModal(!monthModal);
        }}
      >
        <View
          className="flex-1 justify-center items-center bg-opacity-80"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
          <View
            className="rounded-3xl p-4 w-10/12 max-h-1/2"
            style={{ backgroundColor: colors.chartBg }}
          >
            <CustomText
              className="text-xl text-center mb-4"
              style={{ color: colors.text }}
            >
              Select Month
            </CustomText>
            <View className="flex-row justify-between mb-4">
              <View className="w-full">
                <CustomText
                  className="text-lg text-center mb-2"
                  style={{ color: colors.text }}
                >
                  Months
                </CustomText>
                <ScrollView
                  style={{ maxHeight: 300 }}
                  nestedScrollEnabled={true}
                >
                  {months.map((item, i) => (
                    <View
                      key={i}
                      className="my-2 py-4 px-4 rounded-3xl"
                      style={{
                        backgroundColor:
                          selectedMonth === item ? "blue" : colors.homeCardItem,
                      }}
                    >
                      <Pressable
                        onPress={() => {
                          setSelectedMonth(item);
                          setMonthModal(false);
                        }}
                      >
                        <CustomText
                          className="text-lg"
                          style={{
                            color:
                              selectedMonth === item ? "white" : colors.text,
                          }}
                        >
                          {item}
                        </CustomText>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
            <Pressable
              className="bg-red-500 rounded-3xl p-4 items-center mt-3"
              onPress={() => setMonthModal(false)}
            >
              <CustomText className="text-white">Close</CustomText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View className="flex-1">
        <CustomAlert
          visible={alertVisible}
          mainMessage="Low Savings"
          message="Your savings are running low!, It's time to cut back on expenses."
          onClose={() => setAlertVisible(false)}
        />
      </View>

      <Notification
        isVisible={isSaved}
        text="Expense saved!"
        bgColor="green.500"
      />
      <Notification
        isVisible={isDeleted}
        text="Expense deleted!"
        bgColor="green.500"
      />
    </View>
  );
}

function Notification({ isVisible, text, bgColor }) {
  return (
    <Slide in={isVisible} placement="top">
      <Box
        w="100%"
        position="absolute"
        p="2"
        borderRadius="xs"
        alignItems="center"
        justifyContent="center"
        safeArea
        _dark={{ bg: bgColor }}
        _light={{ bg: bgColor }}
      >
        <HStack space={2}>
          <Ionicons name="checkmark" size={24} color="white" />
          <CustomText className="text-white">{text}</CustomText>
        </HStack>
      </Box>
    </Slide>
  );
}
