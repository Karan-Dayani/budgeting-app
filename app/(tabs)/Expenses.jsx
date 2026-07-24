import { useIsFocused } from "expo-router/react-navigation";
import { Stack } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Modal,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import uuid from "react-native-uuid";
import ExpenseHeader from "../../components/expense/ExpenseHeader";
import ExpenseItem from "../../components/expense/ExpenseItem";
import { useAuthStore } from "../../components/globalState/authStore";
import { useBudgetStore } from "../../components/globalState/budgetStore";
import AddExpenseModal from "../../components/modals/AddExpenseModal";
import CategoryPicker from "../../components/modals/CategoryPicker";
import CustomAlert from "../../components/modals/CustomAlert";
import ExpenseDetail from "../../components/modals/ExpenseDetail";
import MonthPicker from "../../components/modals/MonthPicker";
import AlertScreen from "../../screens/AlertScreen";
import NoDataLoad from "../../screens/NoDataLoad";
import { incomePercent, Notification } from "../../lib/utils";
import FloatingAddButton from "../../components/FloatingAddButton";

export default function ExpensesPage() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    income,
    savings,
    expenses,
    loading,
    accounts,
    fetchBudget,
    addExpense,
    deleteExpense,
  } = useBudgetStore();

  const isFocused = useIsFocused();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (isFocused) {
      fadeAnim.setValue(0);
      slideAnim.setValue(10);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(10);
    }
  }, [isFocused]);

  const [animations, setAnimations] = useState([]);

  const isCurrentMonth = new Date().toDateString().slice(4).split(" ");
  const [month, date, year] = isCurrentMonth;

  const [notify, setNotify] = useState();
  const [showModal, setShowModal] = useState();

  const [expense, setExpense] = useState({
    user_id: user?.id,
    expense_name: "",
    amount: 0,
    payment_mode: "",
    transaction_date: new Date().toISOString().split("T")[0],
    category: "",
    expense_type: "Non-Recurring",
    items: [],
  });

  const [selectedExpense, setSelectedExpense] = useState(null);
  const [alertVisible, setAlertVisible] = useState();
  const [hasShownSavingsAlert, setHasShownSavingsAlert] = useState(false);

  useEffect(() => {
    if (user) {
      setExpense((prev) => ({ ...prev, user_id: user.id }));
    }
  }, [user]);

  const handleInputs = () => {
    if (expense.expense_name || expense.amount || expense.payment_mode || expense.category) {
      setAlertVisible("discardInputs");
    } else {
      setShowModal(null);
    }
  };

  const handleInputsField = () => {
    setExpense({
      user_id: user?.id,
      expense_name: "",
      amount: 0,
      payment_mode: "",
      category: "",
      expense_type: "Non-Recurring",
      transaction_date: new Date().toISOString().split("T")[0],
      items: [],
    });
    setShowModal(null);
    setAlertVisible(null);
  };

  const [filters, setFilters] = useState({
    date: "",
    month: "",
    category: "",
  });

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!loading && filteredExpenses.length > 0 && !hasAnimatedRef.current) {
      const newAnimations = filteredExpenses.map(() => new Animated.Value(0));
      setAnimations(newAnimations);

      const animationsSequence = newAnimations.map((anim, index) => {
        return Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          delay: index * 100,
        });
      });

      Animated.stagger(100, animationsSequence).start(() => {
        hasAnimatedRef.current = true;
      });
    }
  }, [loading, filteredExpenses]);

  const handleConfirm = (date) => {
    setFilters({ ...filters, "date": new Date(date).toDateString().slice(4) });
    setDatePickerVisibility(false);
  };

  // Unified budget fetch from store
  useEffect(() => {
    if (isFocused && user) {
      const email = user.email || user.user_metadata?.email;
      if (email) {
        fetchBudget(email, user.id);
      }
    }
  }, [user, isFocused]);

  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
    } else {
      if (savings <= incomePercent(income) && !hasShownSavingsAlert) {
        setAlertVisible("lowSavings");
        setHasShownSavingsAlert(true);
      }
    }
  }, [savings, income, expense]);

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

    if (!expense.expense_name || !expense.amount || !expense.payment_mode || !expense.category || !expense.expense_type) {
      Alert.alert("Please fill in all fields");
      return false;
    }

    const email = user?.email || user?.user_metadata?.email;
    if (!email || !user?.id) {
      Alert.alert("Error", "User session email or id not found.");
      return false;
    }

    const success = await addExpense(
      user.id,
      email,
      expense.expense_name,
      expense.amount,
      expense.payment_mode,
      expense.category,
      expense.expense_type,
      expense.items || []
    );

    if (success) {
      setExpense({
        user_id: user?.id,
        expense_name: "",
        amount: 0,
        payment_mode: "",
        category: "",
        expense_type: "Non-Recurring",
        transaction_date: new Date().toISOString().split("T")[0],
        items: [],
      });

      setNotify("Saved");
      setTimeout(() => setNotify(null), 2500);
      return true;
    } else {
      Alert.alert("Error saving expense");
      return false;
    }
  };

  const handleDeleteExpense = async () => {
    const email = user?.email || user?.user_metadata?.email;
    if (!email) {
      Alert.alert("Error", "User session email not found.");
      return;
    }

    const success = await deleteExpense(email, selectedExpense.expenseId, selectedExpense.expenseAmount);

    if (success) {
      setShowModal(null);
      setSelectedExpense(null);
      setNotify("Deleted");
      setTimeout(() => setNotify(null), 2500);
    } else {
      Alert.alert("Error deleting expense");
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      return (
        (filters.date === "" && filters.month === "" && filters.category === "" && expense.expenseDate.includes(month) && expense.expenseDate.includes(year)) ||
        expense.expenseDate === filters.date ||
        expense.expenseCategory === filters.category ||
        expense.expenseDate.slice(0, 3) === filters.month.slice(0, 3)
      );
    });
  }, [expenses, filters, month, year]);

  const alertConfig = {
    lowSavings: {
      mainMessage: "Low Savings",
      message: "Your savings are running low! It's time to cut back on expenses.",
      alerts: true,
      AlertScreen: AlertScreen,
    },
    exceedAmount: {
      mainMessage: "Amount Exceeded",
      message: "It seems your savings are insufficient to cover this expense. Please review your spending and adjust accordingly.",
      alerts: true,
      AlertScreen: AlertScreen,
    },
    discardInputs: {
      mainMessage: "Discard data",
      message: "Your Data will be discarded, Are you sure?",
      alerts: false,
      task: handleInputsField,
      isDanger: true,
      confirmText: "Yes, Discard",
      cancelText: "No"
    }
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View className="px-6 flex-1" style={{
        backgroundColor: colors.background
      }}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <SafeAreaView className="h-full">
          <>
            <FloatingAddButton onPress={() => setShowModal("addExpense")} />
          </>
          <View style={{ zIndex: 100, elevation: 10 }}>
            <ExpenseHeader
              filters={filters}
              setFilters={setFilters}
              setDatePickerVisibility={setDatePickerVisibility}
              setShowModal={setShowModal}
              handleConfirm={handleConfirm}
              isDatePickerVisible={isDatePickerVisible}
              filteredExpenses={filteredExpenses}
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
              renderItem={({ item, index }) => {
                const itemAnimation =
                  index < 7 ? animations[index] || new Animated.Value(1) : new Animated.Value(1);

                const animatedStyle = index < 7
                  ? {
                    opacity: itemAnimation,
                    transform: [
                      {
                        translateY: itemAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  }
                  : {};

                return (
                  <Animated.View style={animatedStyle}>
                    <ExpenseItem
                      handleExpenseDetail={handleExpenseDetail}
                      item={item}
                      isLast={index === filteredExpenses.length - 1}
                    />
                  </Animated.View>
                );
              }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<NoDataLoad filters={filters} />}
              contentContainerStyle={{ paddingBottom: 50 }}
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
            animationType="none"
            transparent={true}
            visible={showModal === "addExpense"}
            onRequestClose={handleInputs}
          >
            <AddExpenseModal
              expense={expense}
              handleExpenseChange={handleExpenseChange}
              handleSaveExpense={handleSaveExpense}
              setShowModal={setShowModal}
              handleInputs={handleInputs}
              colors={colors}
              accounts={accounts}
            />
          </Modal>

          <Modal
            animationType="none"
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
            animationType="none"
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
            {alertVisible && (
              <CustomAlert
                visible={!!alertVisible}
                mainMessage={alertConfig[alertVisible]?.mainMessage}
                message={alertConfig[alertVisible]?.message}
                onClose={() => setAlertVisible(null)}
                alerts={alertConfig[alertVisible]?.alerts}
                task={alertConfig[alertVisible]?.task}
                AlertScreen={alertConfig[alertVisible]?.AlertScreen}
                isDanger={alertConfig[alertVisible]?.isDanger}
                confirmText={alertConfig[alertVisible]?.confirmText}
                cancelText={alertConfig[alertVisible]?.cancelText}
              />
            )}
          </View>


        </SafeAreaView>

        <Notification
          isVisible={notify === "Saved" || notify === "Deleted"}
          text={notify === "Saved" ? "Expense Saved!" : "Expense Deleted!"}
          bgColor="green.500"
        />
      </View>
    </Animated.View>
  );
}
