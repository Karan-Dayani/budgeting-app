import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { Menu } from "native-base";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import AlertScreen from "../../screens/AlertScreen"
import { incomePercent, Notification, numberWithCommas } from "../utils";
import ExpenseTypePicker from "../../components/expense/ExpenseTypePicker";
import CategoryPicker from "../../components/modals/CategoryPicker";
import * as Animatable from "react-native-animatable";

export default function ExpensesPage() {
  const { user } = useUser();
  const isFocused = useIsFocused();

  const isCurrentMonth = new Date().toDateString().slice(4).split(" ");
  const [month, date, year] = isCurrentMonth;

  const [loading, setLoading] = useState(true);
  const [notify, setNotify] = useState();
  const [showModal, setShowModal] = useState()

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
  const [alertVisible, setAlertVisible] = useState();
  const [hasShownSavingsAlert, setHasShownSavingsAlert] = useState(false);
  const flatListRef = useRef();
  const [scrollToTop, setScrollToTop] = useState(true);

  const [filters, setFilters] = useState({
    date: "",
    month: "",
    category: "",
  });

  const { colors } = useTheme();

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const handleConfirm = (date) => {
    setFilters({ ...filters, "date": new Date(date).toDateString().slice(4) });
    hideDatePicker();
  };


  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

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

    if (isFocused) {
      setLoading(true);
      fetchData();
    }
  }, [user, isFocused]);


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
    setShowModal("expenseDetail");
  };

  const closeExpenseDetail = () => {
    setShowModal(null);
    setSelectedExpense(null);
  };

  const handleSaveExpense = async () => {
    if (savings <= Number(incomePercent(income)) && !hasShownSavingsAlert) {
      setAlertVisible("lowSavings");
      setHasShownSavingsAlert(true);
    }

    if (!expense.expenseName || !expense.expenseAmount || !expense.paymentMode || !expense.expenseCategory || !expense.expenseType) {
      Alert.alert("Please fill in all fields");
      return;
    }

    if (savings < expense.expenseAmount) {
      setAlertVisible("exceedAmount");
      return;
    }

    const { data } = await supabase
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

    setUserExpenses(updatedArray);

    setExpense({
      expenseId: uuid.v4(),
      expenseName: "",
      expenseAmount: 0,
      paymentMode: "",
      expenseDate: new Date().toDateString().slice(4),
      expenseCategory: "",
      expenseType: "Non-Recurring",
    });

    setShowModal(null);
    setNotify("Saved");
    setTimeout(() => setNotify(null), 2500);
  };




  const handleDeleteExpense = async () => {
    try {
      const { data, error } = await supabase
        .from("User Data")
        .select("expenses, income")
        .eq("email", user?.user_metadata?.email);

      if (error) {
        console.error(error);
        return;
      }

      const prevArray = data[0]?.expenses || [];
      const userIncome = data[0]?.income || 0;

      const updatedArray = prevArray.filter(
        (exp) => exp.expenseId !== selectedExpense.expenseId
      );

      const totalExpenses = updatedArray.reduce(
        (sum, expense) => sum + expense.expenseAmount,
        0
      );

      const updatedSavings = userIncome - totalExpenses;
      await supabase
        .from("User Data")
        .update({ expenses: updatedArray, savings: updatedSavings })
        .eq("email", user?.user_metadata?.email);


      setUserExpenses(updatedArray);
      setSavings(updatedSavings);


      setShowModal(null);
      setSelectedExpense(null);

      setNotify("Deleted");
      setTimeout(() => setNotify(null), 2500);
    } catch (error) {
      console.error("Error deleting expense:", error);
      Alert.alert("Error deleting expense");
    }
  };


  const filteredExpenses = useMemo(() => {
    return userExpenses.filter(
      (expense) =>
        ((filters.date === "" &&
          filters.month === "" &&
          filters.category === "" &&
          expense.expenseDate.includes(month) &&
          expense.expenseDate.includes(year)) ||
          expense.expenseDate === filters.date ||
          expense.expenseCategory === filters.category ||
          expense.expenseDate.slice(0, 3) === filters.month.slice(0, 3)) &&
        expense.expenseType === activeTab
    );
  }, [userExpenses, filters, activeTab, month, year]);

  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    setScrollToTop(Math.floor(contentOffset.y) < 20);
  };

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
        {scrollToTop && (
          <Animatable.View
            className="absolute right-1 z-10 h-full"
            animation="lightSpeedIn"
            duration={500}
            delay={200}
          >
            <Pressable
              onPress={() => setShowModal("addExpense")}
              className="bg-[#41B3A2] p-3 rounded-full absolute right-2 bottom-32 z-10"
            >
              <Ionicons name="add" size={40} color="white" />
            </Pressable>
          </Animatable.View>
        )}
        {!scrollToTop && (
          <Animatable.View
            className="absolute right-1  z-10 h-full"
            animation="lightSpeedOut"
            duration={500}
            delay={100}
          >
            <Pressable
              onPress={() => setShowModal("addExpense")}
              className="bg-[#41B3A2] p-3 rounded-full absolute right-2 bottom-32 z-10"
              animation="lightSpeedIn"
              duration={500}
              delay={200}
            >
              <Ionicons name="add" size={40} color="white" />
            </Pressable>
          </Animatable.View>
        )}
        <View className="w-full mt-4">
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <CustomText className={`text-xl ml-1`} style={{ color: colors.text }}>
                  {filters?.date
                    ? filters.date
                    : filters?.month
                      ? filters.month
                      : filters?.category
                        ? filters.category
                        : "All Expenses"}
                </CustomText>
                <CustomText className={`px-1`} style={{ color: colors.text }}>
                  Total Expense: {numberWithCommas(filteredExpenses.reduce((sum, expense) => sum + expense.expenseAmount, 0))}
                </CustomText>
              </View>
              <View className="flex-row gap-x-3">
                {filters?.date || filters?.month || filters?.category ? (
                  <Pressable
                    onPress={() => {
                      setFilters({
                        date: "",
                        month: "",
                        category: "",
                      })
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
                      onPress={() => setShowModal("monthModal")}
                    >
                      Month
                    </Menu.Item>
                    <Menu.Item
                      _text={{
                        color: colors.text,
                        fontSize: "lg",
                        paddingBottom: 2,
                      }}
                      onPress={() => setShowModal("categoryModal")}
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
            onScroll={handleScroll}
            ListEmptyComponent={<NoDataLoad filters={filters} />}
            className="mb-20"
          />
        )}

        {selectedExpense && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={showModal === "expenseDetail"}
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
          visible={showModal === "addExpense"}
          onRequestClose={() => setShowModal(null)}
        >
          <AddExpenseModal
            expense={expense}
            handleExpenseChange={handleExpenseChange}
            handleSaveExpense={handleSaveExpense}
            setShowModal={setShowModal}
          />
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showModal === "monthModal"}
          onRequestClose={() => setShowModal(null)}
        >
          <MonthPicker
            setShowModal={setShowModal}
            setFilters={setFilters}
            filters={filters}
          />
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showModal === "categoryModal"}
          onRequestClose={() => setShowModal(null)}
        >
          <CategoryPicker
            setShowModal={setShowModal}
            setFilters={setFilters}
            filters={filters}
          />
        </Modal>

        <View className="flex-1">
          <CustomAlert
            visible={alertVisible === "lowSavings"}
            mainMessage="Low Savings"
            message="Your savings are running low!, It's time to cut back on expenses."
            onClose={() => setAlertVisible(null)}
            AlertScreen={AlertScreen}
          />
        </View>

        <View className="flex-1">
          <CustomAlert
            visible={alertVisible === "exceedAmount"}
            mainMessage="Amount Exceeded"
            message="It seems your savings are insufficient to cover this expense. Please review your spending and adjust accordingly."
            onClose={() => setAlertVisible(null)}
            AlertScreen={AlertScreen}
          />
        </View>

        <Notification
          isVisible={notify === "Saved" || notify === "Deleted"}
          text={notify === "Saved" ? "Expense Saved!" : "Expense Deleted!"}
          bgColor="green.500"
        />

      </SafeAreaView>
    </View>
  );
}
