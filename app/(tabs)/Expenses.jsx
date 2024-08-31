import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { Box, Button, HStack, Slide } from "native-base";
import React, { useEffect, useState } from "react";
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
import AddExpenseModal from "../../components/modals/AddExpenseModal";
import ExpenseDetail from "../../components/modals/ExpenseDetail";
import { supabase } from "../../lib/supabase";
import NoDataLoad from "../../screens/NoDataLoad";
import { useUser } from "../../components/globalState/UserContext";
import {
  numberWithCommas,
  incomePercent,
  getTotalExpense,
  getGoalSavings,
} from "../utils";
import CustomAlert from "../../components/modals/CustomAlert";
import AlertScreen from "../../screens/AlertScreen";

export default function ExpensesPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const { user } = useUser();
  const [addExpenseModal, setAddExpenseModal] = useState(false);
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
  // const [income, setIncome] = useState(0);
  const [savings, setSavings] = useState(0);
  const [expenseDetail, setExpenseDetail] = useState(false);
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

  // let savings = Number(userData[0]?.income - (getTotalExpense(userData) + getGoalSavings(userData)))

  // useEffect(() => {
  //   if (savings <= Number(incomePercent(Number(userData[0]?.income)))) {
  //     setAlertVisible(true);
  //     setHasShownSavingsAlert(true)
  //   }
  // }, []);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("User Data")
        .select("expenses, savings")
        .eq("email", user?.user_metadata?.email);

      if (error) {
        console.error(error);
        Alert.alert("Error fetching data");
      } else {
        setUserExpenses(data[0]?.expenses || []);
        setSavings(data[0]?.savings || 0);
        // setIncome(data[0]?.income || 0);
      }

      setLoading(false);
    }

    if (user) {
      setLoading(true);
      fetchData();
    }
  }, [user, expense]);

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

  const filteredExpenses = userExpenses.filter(
    (expense) =>
      (selectedDate === "" || expense.expenseDate === selectedDate) &&
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
          className="bg-[#41B3A2] p-3 rounded-full absolute right-2 bottom-28 z-10"
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

              {selectedDate ? (
                <Pressable
                  onPress={() => {
                    setSelectedDate("");
                    setDatePickerVisibility(false);
                  }}
                  className="bg-red-500 p-3 rounded-xl justify-center "
                >
                  <CustomText className="text-white">Reset</CustomText>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => setDatePickerVisibility(true)}
                  className="rounded-xl bg-[#41B3A2] p-3"
                >
                  <CustomText className="text-white">Select Date</CustomText>
                </Pressable>
              )}
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
            className="flex-1 p-2 rounded-md"
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
            className="flex-1 p-2 rounded-md"
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
                        className="rounded-2xl px-5 py-4 my-2"
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
