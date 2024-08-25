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
import CustomText from "../../components/CustomText"; // Import your custom text component
import AddExpenseModal from "../../components/modals/AddExpenseModal";
import ExpenseDetail from "../../components/modals/ExpenseDetail";
import { supabase } from "../../lib/supabase";
import NoDataLoad from "../../screens/NoDataLoad";

export default function ExpensesPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [user, setUser] = useState("");
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
  const [income, setIncome] = useState(0);
  const [expenseDetail, setExpenseDetail] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [activeTab, setActiveTab] = useState("Non-Recurring");

  const { colors } = useTheme();

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
        Alert.alert("Error accessing user");
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

  let activeExpenses = [];

  if (activeTab === "Non-Recurring") {
    activeExpenses = datedExpenses?.filter(
      (expense) => expense.expenseType === "Non-Recurring"
    );
  } else if (activeTab === "Recurring") {
    activeExpenses = datedExpenses?.filter(
      (expense) => expense.expenseType === "Recurring"
    );
  }

  const handleExpenseChange = (fieldName, value) => {
    setExpense((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  const handleAddExpense = () => {
    setAddExpenseModal(true);
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

    await supabase
      .from("User Data")
      .update({ expenses: updatedArray })
      .eq("email", user?.user_metadata?.email);
    setUserExpenses(updatedArray);
    setExpenseDetail(false);
    setSelectedExpense(null);

    setIsDeleted(!isDeleted);
    setTimeout(() => {
      setIsDeleted(false);
    }, 2500);
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
          onPress={handleAddExpense}
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
                  Total Expense: ₹{getTotalExpense()}
                </CustomText>
              </View>

              {selectedDate ? (
                <Pressable
                  onPress={() => setSelectedDate("")}
                  className="bg-red-500 p-3 rounded-xl justify-center "
                >
                  <CustomText className="text-white">Reset</CustomText>
                </Pressable>
              ) : (
                <Button
                  onPress={showDatePicker}
                  className="rounded-xl bg-[#41B3A2]"
                >
                  <CustomText className="text-white">Select Date</CustomText>
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
              {activeExpenses.length > 0 ? (
                activeExpenses?.map((item, index) => (
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
                            ₹{item?.expenseAmount}
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
          // formType={formType}
          // setFormType={setFormType}
          handleExpenseChange={handleExpenseChange}
          handleSaveExpense={handleSaveExpense}
          setAddExpenseModal={setAddExpenseModal}
        />
      </Modal>
      <Slide in={isSaved} placement="top">
        <Box
          w="100%"
          position="absolute"
          p="2"
          borderRadius="xs"
          bg="emerald.500"
          alignItems="center"
          justifyContent="center"
          _dark={{
            bg: "emerald.200",
          }}
          safeArea
        >
          <HStack space={2}>
            <CustomText className=" text-white text-lg">
              Expense saved successfully!
            </CustomText>
          </HStack>
        </Box>
      </Slide>

      <Slide in={isDeleted} placement="top">
        <Box
          w="100%"
          position="absolute"
          p="2"
          borderRadius="xs"
          bg="error.500"
          alignItems="center"
          justifyContent="center"
          safeArea
        >
          <HStack space={2}>
            <CustomText className="text-white text-lg">
              Expense deleted successfully!
            </CustomText>
          </HStack>
        </Box>
      </Slide>
    </View>
  );
}
