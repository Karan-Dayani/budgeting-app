import { useIsFocused, useTheme } from "@react-navigation/native";
import { Link, Stack } from "expo-router";
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
import { AntDesign } from "@expo/vector-icons";
import { useUser } from "../../components/globalState/UserContext";
import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";
import { numberWithCommas } from "../utils";
import AlertScreen from "../../screens/AlertScreen";
import CustomAlert from "../../components/modals/CustomAlert";

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
        const { data, error: updateError } = await supabase
          .from("User Data")
          .update({
            username: userName,
            income: incomeNumber,
            savings: incomeNumber,
            expenses: [],
            goals: [],
          })
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
          setAlertVisible(true);
        }
        setShowModal(null);
        setLoading(true);
      }
    }

    setLoading(false);
  };

  const handleLogOut = async () => {
    const { error } = await supabase.auth.signOut();
  };

  async function fetchData() {
    const { data, error } = await supabase
      .from("User Data")
      .select("username,income,expenses,savings")
      .eq("email", user?.user_metadata?.email);

    if (error) {
      console.error(error);
      Alert.alert("Error fetching data");
    } else {
      setUserName(data[0]?.username || "");
      setIncome(data[0]?.income || 0);
      setOldIncome(data[0]?.income || 0);
      setExpenses(data[0]?.expenses || [])
      setSavings(data[0]?.savings || 0);
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
      <View className="flex-row absolute top-10 left-5 z-10 ">
        <Link className="" href={"/(tabs)/Home"}>
          <AntDesign name="arrowleft" size={26} color="black" />
        </Link>
      </View>
      <View className="bg-[#41B3A2] h-36 justify-center mb-5">
        <View className="h-32 w-full absolute z-10 items-center top-16">
          <Image
            source={require("../../assets/images/defaultProfile.png")}
            alt="pfp"
            className="h-32 w-32"
          />
        </View>
      </View>

      <View className="px-6">
        {loading ? (
          <View className="items-center mt-8">
            <ActivityIndicator size={20} color={colors.text} />
          </View>
        ) : (
          <View className="items-center mt-8">
            <CustomText
              className="mt-4 text-2xl font-bold"
              style={{ color: colors.text }}
            >
              {userName}
            </CustomText>
            <CustomText className="text-base" style={{ color: colors.text }}>
              {user?.user_metadata?.email}
            </CustomText>
          </View>
        )}

        <View className="mt-12">
          <TouchableOpacity
            className="p-4 rounded-full flex-row justify-between items-center shadow-md"
            style={{ backgroundColor: colors.inputBg }}
            onPress={() => {
              setShowModal("profileModal");
              fetchData();
            }}
          >
            <CustomText className="text-lg " style={{ color: colors.text }}>
              Edit Profile
            </CustomText>
          </TouchableOpacity>

          <Link
            className="p-4 rounded-full flex-row justify-between items-center mt-4 shadow-md"
            style={{ backgroundColor: colors.inputBg }}
            href={"/Support/"}
          >
            <CustomText className="text-lg " style={{ color: colors.text }}>
              Support
            </CustomText>
          </Link>

          {/* <TouchableOpacity
            className="p-4 rounded-full flex-row justify-between items-center mt-4 shadow-md"
            style={{ backgroundColor: colors.inputBg }}
            onPress={generatePdf}
          >
            <CustomText className="text-lg text-white ">Export PDF</CustomText>
          </TouchableOpacity> */}

          <TouchableOpacity
            className="p-4 rounded-full flex-row justify-between items-center mt-4 shadow-md"
            style={{ backgroundColor: colors.inputBg }}
            onPress={() => setShowModal("datePickerModal")}
          >
            <CustomText className="text-lg text-white ">Export PDF</CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4 rounded-full flex-row justify-between items-center mt-4 bg-red-500 shadow-md"
            onPress={() => setShowModal("logOut")}
          >
            <CustomText className="text-lg text-white ">Log Out</CustomText>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal === "profileModal"}
        onRequestClose={() => {
          setShowModal(null);
        }}
      >
        <View
          className="h-full justify-center px-10 "
          style={{ backgroundColor: `${colors.background}dd` }}
        >
          <View className="bg-[#191A19] pb-8 justify-center rounded-2xl px-6 shadow-lg">
            <View className="mt-5">
              <CustomText className="text-white text-xl font-semibold">
                Username
              </CustomText>
              <TextInput
                className="rounded-full my-3 text-white p-4 bg-[#31363F] text-lg"
                placeholderTextColor="white"
                value={userName}
                onChangeText={(text) => setUserName(text)}
              />
              <CustomText className="text-white text-xl font-semibold">
                Monthly Income
              </CustomText>
              <TextInput
                className="rounded-full my-3 text-white p-4 bg-[#31363F] text-lg"
                placeholderTextColor="white"
                value={String(income)}
                onChangeText={(text) => setIncome(text)}
                inputMode="numeric"
                keyboardType="numeric"
              />
            </View>
            <CustomText className="text-gray-400 text-sm mt-4 text-center">
              Update your details by removing the old information and entering
              the new data.
            </CustomText>
            <Pressable
              className="p-4 bg-[#41B3A2] items-center rounded-full mt-6 shadow-md"
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
                <CustomText className="text-white text-lg">Submit</CustomText>
              )}
            </Pressable>
            <Pressable
              className="p-4 bg-red-500 items-center rounded-full mt-4 shadow-md"
              onPress={() => setShowModal(null)}
            >
              <CustomText className="text-white text-lg">Cancel</CustomText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal === "confirmModal"}
        onRequestClose={() => {
          setShowModal(null);
        }}
      >
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: `${colors.background}dd` }}
        >
          <View
            className="p-6 rounded-2xl w-4/5 shadow-lg"
            style={{ backgroundColor: colors.inputBg }}
          >
            <CustomText
              className="text-xl mt-4 font-semibold text-center"
              style={{ color: colors.text }}
            >
              This will reset your data
            </CustomText>
            <CustomText
              className="text-xl mb-4 font-semibold text-center"
              style={{ color: colors.text }}
            >
              Are you sure you want to make this change?
            </CustomText>
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 p-4 bg-red-500 items-center rounded-full shadow-md"
                onPress={() => {
                  setShowModal(null);
                }}
              >
                <CustomText className="text-white text-lg">No</CustomText>
              </Pressable>
              <Pressable
                className="flex-1 p-4 bg-blue-500 items-center rounded-full shadow-md"
                onPress={() => handleChangeSubmit()}
              >
                <CustomText className="text-white text-lg">Yes</CustomText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal === "datePickerModal"}
        onRequestClose={() => {
          setShowModal(null);
        }}
      >
        <View
          className="flex-1 justify-center items-center bg-opacity-80"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
          <View
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
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal === "logOut"}
        onRequestClose={() => {
          setShowModal(null);
        }}
      >
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: `${colors.background}dd` }}
        >
          <View
            className="p-6 rounded-2xl w-4/5 shadow-lg"
            style={{ backgroundColor: colors.inputBg }}
          >
            <CustomText
              className="text-xl mb-4 font-semibold text-center"
              style={{ color: colors.text }}
            >
              Are you sure you want to log out?
            </CustomText>
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 p-4 bg-red-500 items-center rounded-full shadow-md"
                onPress={() => setShowModal(null)}
              >
                <CustomText className="text-white text-lg">No</CustomText>
              </Pressable>
              <Pressable
                className="flex-1 p-4 bg-blue-500 items-center rounded-full shadow-md"
                onPress={handleLogOut}
              >
                <CustomText className="text-white text-lg">Yes</CustomText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <View className="flex-1">
        <CustomSuccessAlert
          visible={alertVisible === "profileUpdated"}
          mainMessage="Profile Updated"
          message="Your profile updated successfully!"
          onClose={() => setAlertVisible(null)}
        />
      </View>
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
          />
        )}
      </View>
    </View>
  );
};

export default ProfilePage;
