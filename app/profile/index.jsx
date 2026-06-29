import { useIsFocused } from "expo-router/react-navigation";
import { Link, Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomText from "../../components/CustomText";
import CustomSuccessAlert from "../../components/modals/CustomSuccessAlert";
import { supabase } from "../../lib/supabase";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useUser } from "../../components/globalState/UserContext";
import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";
import { numberWithCommas } from "../../lib/utils";
import AlertScreen from "../../screens/AlertScreen";
import CustomAlert from "../../components/modals/CustomAlert";
import { useTheme } from "expo-router/react-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from '@expo/vector-icons/FontAwesome';

const ProfilePage = () => {
  const { colors } = useTheme();
  const { user } = useUser()
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [oldIncome, setOldIncome] = useState(0);
  const [income, setIncome] = useState(0);
  const [savings, setSavings] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [showModal, setShowModal] = useState()
  const [selectedMY, setSelectedMY] = useState({
    month: "",
    year: ""
  })

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(-1, i).toLocaleString("default", { month: "long" })
  );

  const handleChangeSubmit = async () => {
    const incomeNumber = Number(income);

    if (oldIncome !== income) {
      if (isNaN(incomeNumber) || incomeNumber <= 0) {
        Alert.alert("Please enter a valid number for income.");
        return;
      } else {
        const [updateRes, deleteRes, deleteGoalsRes] = await Promise.all([
          supabase
            .from("User Data")
            .update({
              username: userName,
              income: incomeNumber,
              savings: incomeNumber,
              expenses: [],
              goals: [],
            })
            .eq("email", user?.user_metadata?.email),
          supabase
            .from("transactions")
            .delete()
            .eq("user_id", user?.id),
          supabase
            .from("goals")
            .delete()
            .eq("user_id", user?.id)
        ]);

        if (updateRes.error) {
          Alert.alert("Error updating profile", updateRes.error.message);
        } else if (deleteRes.error) {
          Alert.alert("Error clearing transactions", deleteRes.error.message);
        } else if (deleteGoalsRes.error) {
          Alert.alert("Error clearing goals", deleteGoalsRes.error.message);
        } else {
          setAlertVisible("profileUpdated");
        }
        setShowModal(null);
        setLoading(true);
      }
    } else {
      if (isNaN(incomeNumber) || incomeNumber <= 0) {
        Alert.alert("Please enter a valid number for income.");
        return;
      } else {
        const { data, error: updateError } = await supabase
          .from("User Data")
          .update({ username: userName })
          .eq("email", user?.user_metadata?.email)
          .select();
        if (updateError) {
          Alert.alert("Error updating profile", updateError.message);
        } else {
          setAlertVisible("profileUpdated");
        }
        setShowModal(null);
        setLoading(true);
      }
    }

    setLoading(false);
  };

  const handleLogOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace("/(auth)/login");
    } else {
      console.error("Logout error:", error);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const email = user?.user_metadata?.email;
      const userId = user?.id;

      if (!email || !userId) {
        throw new Error("User information is missing.");
      }

      // 1. Delete user-specific data from public tables
      const [resUserData, resTransactions, resGoals] = await Promise.all([
        supabase.from("User Data").delete().eq("email", email),
        supabase.from("transactions").delete().eq("user_id", userId),
        supabase.from("goals").delete().eq("user_id", userId),
      ]);

      if (resUserData.error) throw new Error(`Failed to delete User Data: ${resUserData.error.message}`);
      if (resTransactions.error) throw new Error(`Failed to delete transactions: ${resTransactions.error.message}`);
      if (resGoals.error) throw new Error(`Failed to delete goals: ${resGoals.error.message}`);

      // 2. Call the RPC to delete from auth.users
      const { error: rpcError } = await supabase.rpc("delete_user_account");
      if (rpcError) {
        console.warn("RPC delete_user_account failed:", rpcError);
        throw new Error(`Failed to delete auth account: ${rpcError.message}`);
      }

      // 3. Clear local session & redirect
      await supabase.auth.signOut();
      setShowModal(null);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Delete account error:", error);
      Alert.alert("Error Deleting Account", error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  async function fetchData() {
    try {
      const [userResponse, transResponse] = await Promise.all([
        supabase
          .from("User Data")
          .select("username,income,savings")
          .eq("email", user?.user_metadata?.email),
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user?.id)
          .order("transaction_date", { ascending: false })
      ]);

      if (userResponse.error) throw userResponse.error;
      if (transResponse.error) throw transResponse.error;

      const userData = userResponse.data[0];
      setUserName(userData?.username || "");
      setIncome(userData?.income || 0);
      setOldIncome(userData?.income || 0);
      setSavings(userData?.savings || 0);

      const formattedTrans = (transResponse.data || []).map((tx) => {
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

      setExpenses(formattedTrans);
    } catch (err) {
      console.error(err);
      Alert.alert("Error fetching data");
    }
  }

  useEffect(() => {
    if (user) {
      fetchData();
    }
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [user]);

  const filterdExpensePDF = expenses?.filter((expense) => (
    expense.expenseDate.slice(0, 3) === selectedMY.month.slice(0, 3) && Number(expense.expenseDate.slice(7, 11)) === selectedMY.year
  ))

  const html = `
      <html>
    <head>
        <style>
            body {
                font-family: 'Arial', sans-serif;
            }
            h1 {
                color: #41B3A2;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                border: 1px solid #dddddd;
                text-align: left;
                padding: 8px;
            }
            th {
                background-color: #41B3A2;
                color: white;
            }
            .total-row {
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <h1>${selectedMY.month} ${selectedMY.year} Expenses</h1>
        <table>
            <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Category</th>
            </tr>
            ${filterdExpensePDF.map(expense => `
                <tr>
                    <td>${expense.expenseDate}</td>
                    <td>${expense.expenseAmount}</td>
                    <td>${expense.expenseName}</td>
                </tr>
            `).join('')}
            <tr class="total-row">
                <td colspan="1">Total Expense</td>
                <td>${numberWithCommas(filterdExpensePDF?.reduce((sum, expense) => sum + expense.expenseAmount, 0))}</td>
                <td></td>
            </tr>
            <tr class="total-row">
                <td colspan="1">Savings</td>
                <td>${income - (filterdExpensePDF?.reduce((sum, expense) => sum + expense.expenseAmount, 0))}</td>
                <td></td>
            </tr>
        </table>
    </body>
</html>

    `

  const alertConfig = {
    noDataPdf: {
      mainMessage: "No Data",
      message: `There is no data on ${selectedMY.month} ${selectedMY.year}`,
      alerts: true,
      AlertScreen: AlertScreen,
    },
  };

  let generatePdf = async () => {
    if (filterdExpensePDF.length > 0) {

      const file = await printToFileAsync({
        html: html,
        base64: false
      });

      await shareAsync(file.uri)
    } else {
      setAlertVisible("noDataPdf")
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="bg-[#41B3A2] pt-12 pb-16 px-6 rounded-b-[40px] shadow-lg relative">
        <SafeAreaView edges={["top"]} className="flex-row items-center justify-between">
          <Link href={"/(tabs)/Home"} asChild>
            <TouchableOpacity className="bg-white/20 p-2.5 rounded-full items-center justify-center">
              <AntDesign name="arrow-left" size={22} color="white" />
            </TouchableOpacity>
          </Link>
          <CustomText className="text-white text-xl font-bold" style={{ fontFamily: "Poppins_SemiBold" }}>
            Profile
          </CustomText>
          <View style={{ width: 42 }} />
        </SafeAreaView>
        <View className="absolute -bottom-16 left-0 right-0 items-center justify-center z-10">
          <View className="rounded-full shadow-lg border-4" style={{ borderColor: colors.background }}>
            <Image
              source={require("../../assets/images/defaultProfile.png")}
              alt="pfp"
              className="h-32 w-32 rounded-full"
            />
          </View>
        </View>
      </View>
      <ScrollView
        className="flex-1 px-6 mt-20"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {loading ? (
          <View className="items-center my-6">
            <ActivityIndicator size={20} color={colors.text} />
          </View>
        ) : (
          <View className="items-center mb-6">
            <CustomText
              className="text-2xl font-bold"
              style={{ color: colors.text, fontFamily: "Poppins_Bold" }}
            >
              {userName}
            </CustomText>
            <CustomText className="text-sm text-gray-500 mt-1" style={{ fontFamily: "Jost" }}>
              {user?.user_metadata?.email}
            </CustomText>
          </View>
        )}
        {!loading && (
          <View className="flex-row justify-between mb-6">
            <View className="flex-1 rounded-2xl p-4 mr-2 shadow-sm" style={{ backgroundColor: colors.inputBg }}>
              <View className="flex-row items-center mb-1">
                <Feather name="trending-up" size={14} color="#41B3A2" />
                <CustomText className="text-[11px] text-gray-500 ml-1 font-medium">Monthly Income</CustomText>
              </View>
              <CustomText className="text-base font-bold" style={{ color: colors.text, fontFamily: "Red_Hat" }}>
                ₹{numberWithCommas(income)}
              </CustomText>
            </View>
            <View className="flex-1 rounded-2xl p-4 ml-2 shadow-sm" style={{ backgroundColor: colors.inputBg }}>
              <View className="flex-row items-center mb-1">
                <Feather name="credit-card" size={14} color="#41B3A2" />
                <CustomText className="text-[11px] text-gray-500 ml-1 font-medium">Savings</CustomText>
              </View>
              <CustomText className="text-base font-bold" style={{ color: colors.text, fontFamily: "Red_Hat" }}>
                ₹{numberWithCommas(savings)}
              </CustomText>
            </View>
          </View>
        )}
        <View className="rounded-3xl p-1 mb-6 shadow-sm" style={{ backgroundColor: colors.inputBg }}>
          <Link href={"/profile/accounts"} asChild>
            <TouchableOpacity className="flex-row justify-between items-center p-4">
              <View className="flex-row items-center">
                <View className="p-2 rounded-xl bg-[#41B3A2]/10 mr-3">
                  <FontAwesome name="bank" size={18} color="#41B3A2" />
                </View>
                <CustomText className="text-base font-medium" style={{ color: colors.text }}>
                  Accounts
                </CustomText>
              </View>
              <Feather name="chevron-right" size={18} color={colors.text + '55'} />
            </TouchableOpacity>
          </Link>
          <TouchableOpacity
            className="flex-row justify-between items-center p-4 border-b"
            style={{ borderBottomColor: colors.background + '22' }}
            onPress={() => {
              setShowModal("profileModal");
              fetchData();
            }}
          >
            <View className="flex-row items-center">
              <View className="p-2 rounded-xl bg-[#41B3A2]/10 mr-3">
                <Feather name="user" size={18} color="#41B3A2" />
              </View>
              <CustomText className="text-base font-medium" style={{ color: colors.text }}>
                Edit Profile
              </CustomText>
            </View>
            <Feather name="chevron-right" size={18} color={colors.text + '55'} />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row justify-between items-center p-4 border-b"
            style={{ borderBottomColor: colors.background + '22' }}
            onPress={() => setShowModal("datePickerModal")}
          >
            <View className="flex-row items-center">
              <View className="p-2 rounded-xl bg-[#41B3A2]/10 mr-3">
                <Feather name="file-text" size={18} color="#41B3A2" />
              </View>
              <CustomText className="text-base font-medium" style={{ color: colors.text }}>
                Export PDF
              </CustomText>
            </View>
            <Feather name="chevron-right" size={18} color={colors.text + '55'} />
          </TouchableOpacity>
          <Link href={"/Support/"} asChild>
            <TouchableOpacity className="flex-row justify-between items-center p-4">
              <View className="flex-row items-center">
                <View className="p-2 rounded-xl bg-[#41B3A2]/10 mr-3">
                  <Feather name="help-circle" size={18} color="#41B3A2" />
                </View>
                <CustomText className="text-base font-medium" style={{ color: colors.text }}>
                  Support
                </CustomText>
              </View>
              <Feather name="chevron-right" size={18} color={colors.text + '55'} />
            </TouchableOpacity>
          </Link>
        </View>
        <TouchableOpacity
          className="rounded-3xl p-4 flex-row justify-between items-center shadow-sm mb-4"
          style={{ backgroundColor: colors.inputBg }}
          onPress={() => setShowModal("logOut")}
        >
          <View className="flex-row items-center">
            <View className="p-2 rounded-xl bg-red-500/10 mr-3">
              <Feather name="log-out" size={18} color="#EF4444" />
            </View>
            <CustomText className="text-base font-semibold text-red-500">
              Log Out
            </CustomText>
          </View>
          <Feather name="chevron-right" size={18} color="#EF4444" />
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-3xl p-4 flex-row justify-between items-center shadow-sm mb-6"
          style={{ backgroundColor: colors.inputBg }}
          onPress={() => setShowModal("deleteAccount")}
        >
          <View className="flex-row items-center">
            <View className="p-2 rounded-xl bg-red-500/10 mr-3">
              <Feather name="trash-2" size={18} color="#EF4444" />
            </View>
            <CustomText className="text-base font-semibold text-red-500">
              Delete Account
            </CustomText>
          </View>
          <Feather name="chevron-right" size={18} color="#EF4444" />
        </TouchableOpacity>
      </ScrollView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal === "profileModal"}
        onRequestClose={() => {
          setShowModal(null);
        }}
      >
        <Pressable
          onPress={() => setShowModal(null)}
          className="flex-1 justify-center px-6 bg-black/60"
        >
          <Pressable
            onPress={() => { }}
            className="pb-8 justify-center rounded-3xl px-6 shadow-2xl"
            style={{ backgroundColor: colors.expenseForm }}
          >
            <View className="mt-6">
              <CustomText className="text-lg font-bold text-center mb-6" style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}>
                Edit Profile
              </CustomText>
              <CustomText className="text-xs font-semibold mb-2" style={{ color: colors.text + 'aa' }}>
                Username
              </CustomText>
              <TextInput
                className="rounded-2xl p-4 text-base mb-4 border"
                style={{
                  backgroundColor: colors.expenseInput,
                  color: colors.text,
                  borderColor: colors.inputBg
                }}
                placeholderTextColor={colors.text + '66'}
                placeholder="Enter username"
                value={userName}
                onChangeText={(text) => setUserName(text)}
              />
              <CustomText className="text-xs font-semibold mb-2" style={{ color: colors.text + 'aa' }}>
                Monthly Income
              </CustomText>
              <TextInput
                className="rounded-2xl p-4 text-base border"
                style={{
                  backgroundColor: colors.expenseInput,
                  color: colors.text,
                  borderColor: colors.inputBg
                }}
                placeholderTextColor={colors.text + '66'}
                placeholder="Enter monthly income"
                value={String(income)}
                onChangeText={(text) => setIncome(text)}
                inputMode="numeric"
                keyboardType="numeric"
              />
            </View>
            <CustomText className="text-gray-400 text-xs mt-4 text-center">
              Changing income will reset your monthly savings and active expenses.
            </CustomText>
            <View className="flex-row gap-3 mt-6">
              <Pressable
                className="flex-1 p-4 bg-red-500 items-center rounded-full shadow-md"
                onPress={() => setShowModal(null)}
              >
                <CustomText className="text-white text-base font-bold">Cancel</CustomText>
              </Pressable>
              <Pressable
                className="flex-1 p-4 bg-[#41B3A2] items-center rounded-full shadow-md"
                onPress={() => {
                  if (oldIncome !== income) {
                    setShowModal("confirmModal");
                  } else {
                    handleChangeSubmit();
                  }
                }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <CustomText className="text-white text-base font-bold">Submit</CustomText>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal === "confirmModal"}
        onRequestClose={() => {
          setShowModal(null);
        }}
      >
        <Pressable
          onPress={() => setShowModal(null)}
          className="flex-1 justify-center items-center bg-black/60"
        >
          <Pressable
            onPress={() => { }}
            className="p-6 rounded-3xl w-4/5 shadow-2xl"
            style={{ backgroundColor: colors.expenseForm }}
          >
            <View className="items-center mb-4">
              <View className="p-3 bg-red-500/10 rounded-full mb-3">
                <Feather name="alert-triangle" size={28} color="#EF4444" />
              </View>
              <CustomText
                className="text-lg font-bold text-center"
                style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}
              >
                Reset Financial Data
              </CustomText>
            </View>
            <CustomText
              className="text-sm text-center mb-6 text-gray-500"
              style={{ fontFamily: "Jost" }}
            >
              This change will update your Monthly Income and reset all savings, expenses, and goals. Are you sure you want to proceed?
            </CustomText>
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 p-3.5 bg-red-500 items-center rounded-full shadow-md"
                onPress={() => {
                  setShowModal(null);
                }}
              >
                <CustomText className="text-white text-base font-bold">No</CustomText>
              </Pressable>
              <Pressable
                className="flex-1 p-3.5 bg-[#41B3A2] items-center rounded-full shadow-md"
                onPress={() => handleChangeSubmit()}
              >
                <CustomText className="text-white text-base font-bold">Yes</CustomText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal === "datePickerModal"}
        onRequestClose={() => {
          setShowModal(null);
        }}
      >
        <Pressable
          onPress={() => setShowModal(null)}
          className="flex-1 justify-center items-center bg-opacity-80"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
          <Pressable
            onPress={() => { }}
            className="rounded-3xl p-4 w-10/12 max-h-1/2"
            style={{ backgroundColor: colors.expenseForm }}
          >
            <CustomText
              className="text-xl text-center mb-4"
              style={{ color: colors.text }}
            >
              Select Month & Year
            </CustomText>
            <View className="flex-row justify-between mb-4">
              <View className=" gap-x-2 w-full flex-row">
                <ScrollView
                  style={{ maxHeight: 300 }}
                  nestedScrollEnabled={true}
                >
                  {months.map((item, i) => (
                    <View
                      key={i}
                      className="my-2 py-4 px-4 rounded-3xl"
                      style={{
                        backgroundColor: selectedMY.month === item ? "#41B3A2" : colors.expenseInput,
                        color: colors.text
                      }}
                    >
                      <Pressable
                        onPress={() => {
                          setSelectedMY({
                            ...selectedMY,
                            month: item
                          })
                        }}
                      >
                        <CustomText
                          className="text-lg"
                          style={{
                            backgroundColor: selectedMY.month === item ? "#41B3A2" : colors.expenseInput,
                            color: colors.text
                          }}
                        >
                          {item}
                        </CustomText>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
                <ScrollView
                  style={{ maxHeight: 300 }}
                  nestedScrollEnabled={true}
                >
                  {years.map((item, i) => (
                    <View
                      key={i}
                      className="my-2 py-4 px-4 rounded-3xl"
                      style={{
                        backgroundColor: selectedMY.year === item ? "#41B3A2" : colors.expenseInput,
                        color: colors.text
                      }}
                    >
                      <Pressable
                        onPress={() => {
                          setSelectedMY({
                            ...selectedMY,
                            year: item
                          })
                        }}
                      >
                        <CustomText
                          className="text-lg"
                          style={{
                            backgroundColor: selectedMY.year === item ? "#41B3A2" : colors.expenseInput,
                            color: colors.text
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
              className="bg-[#41B3A2] rounded-3xl p-4 items-center mt-3"
              onPress={() => {
                setShowModal(null)
                generatePdf()
              }}
            >
              <CustomText className="text-white">Confirm</CustomText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal === "logOut"}
        onRequestClose={() => {
          setShowModal(null);
        }}
      >
        <Pressable
          onPress={() => setShowModal(null)}
          className="flex-1 justify-center items-center bg-black/60"
        >
          <Pressable
            onPress={() => { }}
            className="p-6 rounded-3xl w-4/5 shadow-2xl"
            style={{ backgroundColor: colors.expenseForm }}
          >
            <View className="items-center mb-4">
              <View className="p-3 bg-red-500/10 rounded-full mb-3">
                <Feather name="log-out" size={28} color="#EF4444" />
              </View>
              <CustomText
                className="text-lg font-bold text-center"
                style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}
              >
                Sign Out
              </CustomText>
            </View>
            <CustomText
              className="text-sm text-center mb-6 text-gray-500"
              style={{ fontFamily: "Jost" }}
            >
              Are you sure you want to log out of your account?
            </CustomText>
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 p-3.5 bg-red-500 items-center rounded-full shadow-md"
                onPress={() => setShowModal(null)}
              >
                <CustomText className="text-white text-base font-bold">No</CustomText>
              </Pressable>
              <Pressable
                className="flex-1 p-3.5 bg-[#41B3A2] items-center rounded-full shadow-md"
                onPress={handleLogOut}
              >
                <CustomText className="text-white text-base font-bold">Yes</CustomText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal === "deleteAccount"}
        onRequestClose={() => {
          setShowModal(null);
        }}
      >
        <Pressable
          onPress={() => setShowModal(null)}
          className="flex-1 justify-center items-center bg-black/60"
        >
          <Pressable
            onPress={() => { }}
            className="p-6 rounded-3xl w-4/5 shadow-2xl"
            style={{ backgroundColor: colors.expenseForm }}
          >
            <View className="items-center mb-4">
              <View className="p-3 bg-red-500/10 rounded-full mb-3">
                <Feather name="trash-2" size={28} color="#EF4444" />
              </View>
              <CustomText
                className="text-lg font-bold text-center"
                style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}
              >
                Delete Account
              </CustomText>
            </View>
            <CustomText
              className="text-sm text-center mb-6 text-gray-500"
              style={{ fontFamily: "Jost" }}
            >
              Are you sure you want to permanently delete your account? This action is irreversible and will remove all your data, transactions, and goals.
            </CustomText>
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 p-3.5 bg-gray-500 items-center rounded-full shadow-md"
                onPress={() => setShowModal(null)}
              >
                <CustomText className="text-white text-base font-bold">Cancel</CustomText>
              </Pressable>
              <Pressable
                className="flex-1 p-3.5 bg-red-500 items-center rounded-full shadow-md"
                onPress={handleDeleteAccount}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <CustomText className="text-white text-base font-bold">Delete</CustomText>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <CustomSuccessAlert
        visible={alertVisible === "profileUpdated"}
        mainMessage="Profile Updated"
        message="Your profile updated successfully!"
        onClose={() => setAlertVisible(null)}
      />
      {alertVisible && alertVisible !== "profileUpdated" && (
        <CustomAlert
          visible={!!alertVisible}
          mainMessage={alertConfig[alertVisible]?.mainMessage}
          message={alertConfig[alertVisible]?.message}
          onClose={() => setAlertVisible(null)}
          alerts={alertConfig[alertVisible]?.alerts}
          task={alertConfig[alertVisible]?.task}
          AlertScreen={alertConfig[alertVisible]?.AlertScreen}
        />
      )}
    </View>
  );
};

export default ProfilePage;
