import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { Menu } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import uuid from "react-native-uuid";
import CustomText from "../../components/CustomText";
import ExpenseItem from "../../components/expense/ExpenseItem";
import { useUser } from "../../components/globalState/UserContext";
import AddExpenseModal from "../../components/modals/AddExpenseModal";
import CustomAlert from "../../components/modals/CustomAlert";
import ExpenseDetail from "../../components/modals/ExpenseDetail";
import MonthPicker from "../../components/modals/MonthPicker";
import { supabase } from "../../lib/supabase";
import NoDataLoad from "../../screens/NoDataLoad";
import { incomePercent, Notification } from "../utils";
import ExpenseTypePicker from "../../components/expense/ExpenseTypePicker";
import CategoryPicker from "../../components/modals/CategoryPicker";

export default function ExpensesPage() {
  const isFocused = useIsFocused();
  const isCurrentMonth = new Date().toDateString().slice(4).split(" ");
  const [month, date, year] = isCurrentMonth;
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { user } = useUser();
  const [addExpenseModal, setAddExpenseModal] = useState(false);
  const [expenseDetail, setExpenseDetail] = useState(false);
  const [monthModal, setMonthModal] = useState(false);
  const [categoryModel, setCategoryModel] = useState(false);
  const [expense, setExpense] = useState({
    expenseId: uuid.v4(),
    expenseName: "",
    expenseAmount: 0,
    paymentMode: "",
    expenseDate: new Date().toDateString().slice(4),
    expenseCategory: "",
    expenseType: "Non-Recurring",
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

  useEffect(() => {
    const fetchData = async () => {
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
    };

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
    setExpense((prevData) => ({ ...prevData, [fieldName]: value }));
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
    let updatedSavings = savings;
    if (
      selectedExpense.expenseDate.includes(month) &&
      selectedExpense.expenseDate.includes(year)
    ) {
      updatedSavings = updatedSavings + selectedExpense.expenseAmount;
    }

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

  let filteredExpenses = userExpenses.filter(
    (expense) =>
      ((selectedDate === "" &&
        selectedMonth === "" &&
        selectedCategory === "" &&
        expense.expenseDate.includes(month) &&
        expense.expenseDate.includes(year)) ||
        expense.expenseDate === selectedDate ||
        expense.expenseCategory === selectedCategory ||
        expense.expenseDate.slice(0, 3) === selectedMonth.slice(0, 3)) &&
      expense.expenseType === activeTab
  );

  return (
    <View className="px-5 flex-1">
      <Stack.Screen
        options={{
          headerShown: true,
          headerShadowVisible: false,
          headerTitle: "",
          headerTitleStyle: { color: colors.text, fontSize: 25 },
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
                {selectedDate || selectedMonth || selectedCategory ? (
                  <Pressable
                    onPress={() => {
                      setSelectedCategory("");
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
                      onPress={() => setCategoryModel(true)}
                    >
                      Category
                    </Menu.Item>
                  </Menu>
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
        <View>
          <ExpenseTypePicker
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.text}
            className="justify-center h-96"
          />
        ) : (
          <FlatList
            data={filteredExpenses}
            keyExtractor={(item) => item.expenseId}
            renderItem={({ item }) => (
              <ExpenseItem
                handleExpenseDetail={handleExpenseDetail}
                item={item}
              />
            )}
            ListEmptyComponent={<NoDataLoad selectedDate={selectedDate} />}
          />
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

        <Modal
          animationType="slide"
          transparent={true}
          visible={addExpenseModal}
          onRequestClose={() => setAddExpenseModal(!addExpenseModal)}
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
          onRequestClose={() => setMonthModal(!monthModal)}
        >
          <MonthPicker
            setMonthModal={setMonthModal}
            setSelectedMonth={setSelectedMonth}
            selectedMonth={selectedMonth}
          />
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={categoryModel}
          onRequestClose={() => setCategoryModel(!categoryModel)}
        >
          <CategoryPicker
            setCategoryModel={setCategoryModel}
            setSelectedCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
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
      </SafeAreaView>
    </View>
  );
}
