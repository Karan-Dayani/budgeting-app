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
import { useUser } from "../../components/globalState/UserContext";
import AddExpenseModal from "../../components/modals/AddExpenseModal";
import CategoryPicker from "../../components/modals/CategoryPicker";
import CustomAlert from "../../components/modals/CustomAlert";
import ExpenseDetail from "../../components/modals/ExpenseDetail";
import MonthPicker from "../../components/modals/MonthPicker";
import { supabase } from "../../lib/supabase";
import AlertScreen from "../../screens/AlertScreen";
import NoDataLoad from "../../screens/NoDataLoad";
import { incomePercent, Notification } from "../../lib/utils";
import FloatingAddButton from "../../components/FloatingAddButton";

export default function ExpensesPage() {
  const { colors } = useTheme();
  const { user } = useUser();
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

  const [loading, setLoading] = useState(true);
  const [notify, setNotify] = useState();
  const [showModal, setShowModal] = useState()

  const [expense, setExpense] = useState({
    user_id: user?.id,
    expense_name: "",
    amount: 0,
    payment_mode: "",
    transaction_date: new Date().toISOString().split("T")[0],
    category: "",
    expense_type: "Non-Recurring",
  });

  const [userExpenses, setUserExpenses] = useState([]);
  const [income, setIncome] = useState(0);
  const [savings, setSavings] = useState(0);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [activeTab, setActiveTab] = useState("Non-Recurring");
  const [alertVisible, setAlertVisible] = useState();
  const [hasShownSavingsAlert, setHasShownSavingsAlert] = useState(false);

  const handleInputs = () => {
    if (expense.expense_name || expense.amount || expense.payment_mode || expense.category) {
      setAlertVisible("discardInputs")
    } else {
      setShowModal(null)
    }
  }

  const handleInputsField = () => {
    setExpense({
      // expenseId: uuid.v4(),
      // expenseName: "",
      // expenseAmount: 0,
      // paymentMode: "",
      // expenseDate: new Date().toDateString().slice(4),
      // expenseCategory: "",
      // expenseType: "Non-Recurring",
      user_id: user?.id,
      expense_name: "",
      amount: 0,
      payment_mode: "",
      category: "",
      expense_type: "Non-Recurring",
      transaction_date: new Date().toISOString().split("T")[0],
    });
    setShowModal(null)
    setAlertVisible(null)
  }


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

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [userResponse, transResponse] = await Promise.all([
          supabase
            .from("User Data")
            .select("savings, income")
            .eq("email", user?.user_metadata?.email),
          supabase
            .from("transactions")
            .select("*")
            .eq("user_id", user?.id)
            .order("transaction_date", { ascending: false })
        ]);

        if (userResponse.error) throw userResponse.error;
        if (transResponse.error) throw transResponse.error;

        setSavings(userResponse.data[0]?.savings || 0);
        setIncome(userResponse.data[0]?.income || 0);
        setUserExpenses(transResponse.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error fetching data");
      } finally {
        setLoading(false);
      }
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
      return;
    }

    if (savings < expense.amount) {
      setAlertVisible("exceedAmount");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: user?.id,
          user_email: user?.user_metadata?.email,
          expense_name: expense.expense_name,
          amount: expense.amount,
          payment_mode: expense.payment_mode,
          category: expense.category,
          expense_type: expense.expense_type,
          transaction_date: new Date().toISOString().split("T")[0],
        })
        .select();

      if (error) throw error;

      const updatedSavings = savings - expense.amount;
      const { error: updateError } = await supabase
        .from("User Data")
        .update({ savings: updatedSavings })
        .eq("email", user?.user_metadata?.email);

      if (updateError) throw updateError;

      if (data && data.length > 0) {
        setUserExpenses((prev) => [data[0], ...prev]);
      }
      setSavings(updatedSavings);

      setExpense({
        user_id: user?.id,
        expense_name: "",
        amount: 0,
        payment_mode: "",
        category: "",
        expense_type: "Non-Recurring",
        transaction_date: new Date().toISOString().split("T")[0],
      });

      setShowModal(null);
      setNotify("Saved");
      setTimeout(() => setNotify(null), 2500);
    } catch (error) {
      console.error("Error saving expense:", error);
      Alert.alert("Error saving expense");
    }
  };


  const handleDeleteExpense = async () => {
    try {
      const { error: deleteError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", selectedExpense.expenseId);

      if (deleteError) throw deleteError;

      const updatedSavings = savings + selectedExpense.expenseAmount;

      const { error: updateError } = await supabase
        .from("User Data")
        .update({ savings: updatedSavings })
        .eq("email", user?.user_metadata?.email);

      if (updateError) throw updateError;

      setUserExpenses((prev) => prev.filter((tx) => tx.id !== selectedExpense.expenseId));
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

  const formattedExpenses = useMemo(() => {
    return userExpenses.map((tx) => {
      let formattedDate = "";
      if (tx.transaction_date) {
        const dateParts = tx.transaction_date.split("-");
        if (dateParts.length === 3) {
          const yearInt = parseInt(dateParts[0], 10);
          const monthInt = parseInt(dateParts[1], 10) - 1;
          const dayInt = parseInt(dateParts[2], 10);
          const d = new Date(yearInt, monthInt, dayInt);
          formattedDate = d.toDateString().slice(4);
        } else {
          formattedDate = new Date(tx.transaction_date).toDateString().slice(4);
        }
      } else {
        formattedDate = new Date().toDateString().slice(4);
      }
      return {
        ...tx,
        expenseId: tx.id,
        expenseName: tx.expense_name,
        expenseAmount: tx.amount,
        paymentMode: tx.payment_mode,
        expenseDate: formattedDate,
        expenseCategory: tx.category,
        expenseType: tx.expense_type,
      };
    });
  }, [userExpenses]);

  const filteredExpenses = useMemo(() => {
    return formattedExpenses.filter((expense) => {

      if (activeTab === "Non-Recurring") {
        return (
          ((filters.date === "" && filters.month === "" && filters.category === "" && expense.expenseDate.includes(month) && expense.expenseDate.includes(year)) ||
            expense.expenseDate === filters.date ||
            expense.expenseCategory === filters.category ||
            expense.expenseDate.slice(0, 3) === filters.month.slice(0, 3)) &&
          expense.expenseType === activeTab
        );
      }

      if (activeTab === "Recurring") {
        return (
          ((filters.date === "" && filters.month === "" && filters.category === "") ||
            expense.expenseDate === filters.date ||
            expense.expenseCategory === filters.category ||
            expense.expenseDate.slice(0, 3) === filters.month.slice(0, 3)) &&
          expense.expenseType === activeTab
        );
      }

      return false;
    });
  }, [formattedExpenses, filters, activeTab, month, year]);

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
              activeTab={activeTab}
              setActiveTab={setActiveTab}
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
