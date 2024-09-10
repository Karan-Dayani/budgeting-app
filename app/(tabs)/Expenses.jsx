import { useIsFocused, useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Modal,
  SafeAreaView,
  View
} from "react-native";
import uuid from "react-native-uuid";
import ExpenseAddButton from "../../components/expense/ExpenseAddButton";
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
import { incomePercent, Notification } from "../utils";

export default function ExpensesPage() {
  const { user } = useUser();
  const isFocused = useIsFocused();

  const [animations, setAnimations] = useState([]);

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

  const [filters, setFilters] = useState({
    date: "",
    month: "",
    category: "",
  });

  const { colors } = useTheme();

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
    return userExpenses.filter((expense) => {

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
  }, [userExpenses, filters, activeTab, month, year]);



  return (
    <View className="px-5 flex-1">
      <Stack.Screen
        options={{
          headerShown: false,
          headerShadowVisible: false,
          headerTitle: "",
          headerTitleStyle: { color: colors.text, fontSize: 25 },
          headerStyle: { backgroundColor: colors.header, height: 50 },
        }}
      />
      <SafeAreaView className="h-full">

        <>
          <ExpenseAddButton setShowModal={setShowModal} />
        </>


        <View>
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
