import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  Alert,
  Modal,
  FlatList,
  Animated,
  Dimensions,
} from "react-native";
import {
  Entypo,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import CustomText from "../CustomText";
import { numberWithCommas } from "../../app/utils";

const AddExpenseModal = ({
  expense,
  handleExpenseChange,
  handleSaveExpense,
  setShowModal,
}) => {
  const PaymentModeData = [
    { label: "Cash", value: "Cash", icon: "cash-outline" },
    { label: "Online", value: "Online", icon: "globe-outline" },
    { label: "Card", value: "Card", icon: "card-outline" },
  ];

  const CategoryData = [
    { label: "Food", value: "Food", icon: "utensils" },
    { label: "Clothing", value: "Clothing", icon: "font-awesome-alt" },
    { label: "Entertainment", value: "Entertainment", icon: "film" },
    { label: "Groceries", value: "Groceries", icon: "shopping-cart" },
    { label: "Utilities", value: "Utilities", icon: "bolt" },
    { label: "Travel", value: "Travel", icon: "plane" },
    { label: "Rent", value: "Rent", icon: "home" },
    { label: "Education", value: "Education", icon: "book" },
    { label: "Other", value: "Other", icon: "ellipsis-h" },
  ];

  const { colors } = useTheme();
  const [amount, setAmount] = useState("");
  const [formType, setFormType] = useState("Non-Recurring");
  const [addExpenseModals, setAddExpenseModals] = useState(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);

  const screenWidth = Dimensions.get("window").width;

  const slideAnim = useRef(new Animated.Value(0)).current;
  const tabWidth = screenWidth / 2;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: formType === "Recurring" ? tabWidth : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [formType]);

  const handleKeyPress = (key) => {
    if (key === "backspace") {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === "." && amount.includes(".")) {
      return;
    } else {
      setAmount((prev) => prev + key);
    }
  };

  const handleSetAmount = () => {
    handleExpenseChange("expenseAmount", parseFloat(amount) || 0);
    setAddExpenseModals(null);
  };

  const handleCategorySelect = (category) => {
    handleExpenseChange("expenseCategory", category.value);
    setAddExpenseModals(null);
  };

  const handlePaymentModeSelect = (mode) => {
    setSelectedPaymentMode(mode.icon);
    handleExpenseChange("paymentMode", mode.value);
    setAddExpenseModals(null);
  };

  return (
    <View
      className="flex-1 justify-end"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
    >
      <CustomText
        className="text-white text-3xl pl-3 pb-2 font-semibold"
        style={{ fontFamily: "Poppins_SemiBold" }}
      >
        Add Expense
      </CustomText>
      <View style={{ backgroundColor: colors.expenseForm, paddingBottom: 20 }}>
        {/* Amount TextInput */}
        <View
          className="flex-row relative"
          style={{ backgroundColor: colors.expenseForm }}
        >
          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              height: "100%",
              width: tabWidth,
              backgroundColor: "#57A6A1",
              transform: [{ translateX: slideAnim }],
            }}
          />

          <Pressable
            className="flex-1 p-3 rounded-tl-3xl"
            onPress={() => {
              setFormType("Non-Recurring");
              handleExpenseChange("expenseType", "Non-Recurring");
            }}
            style={{ zIndex: 1 }}
          >
            <CustomText
              style={{ color: colors.text }}
              className="text-lg text-center"
            >
              Non-Recurring
            </CustomText>
          </Pressable>

          <Pressable
            className="flex-1 p-3  rounded-tr-3xl"
            onPress={() => {
              setFormType("Recurring");
              handleExpenseChange("expenseType", "Recurring");
              handleExpenseChange("times", 1);
            }}
            style={{ zIndex: 1 }}
          >
            <CustomText
              style={{ color: colors.text }}
              className="text-lg text-center"
            >
              Recurring
            </CustomText>
          </Pressable>
        </View>
        <View
          className="p-5 h-46"
          style={{ backgroundColor: colors.expenseAmount }}
        >
          <View className="h-42 flex-row gap-x-2">
            <View className="flex-1">
              <CustomText
                className="text-2xl mb-4"
                style={{ color: colors.text }}
              >
                Amount
              </CustomText>
              <Pressable
                onPress={() => setAddExpenseModals("keyboard")}
                className="p-6 mb-4 rounded-3xl shadow-sm"
                style={{ backgroundColor: colors.expenseInput }}
              >
                <CustomText
                  className="text-3xl"
                  style={{
                    color: colors.text,
                    fontFamily: "Poppins_SemiBold",
                  }}
                >
                  ₹ {numberWithCommas(amount) || "0"}
                </CustomText>
              </Pressable>
            </View>
            <View className="w-20">
              <CustomText
                className="text-2xl mb-4"
                style={{ color: colors.text }}
              >
                Mode
              </CustomText>
              <Pressable
                onPress={() => setAddExpenseModals("paymentMode")}
                className="p-6 mb-3 rounded-3xl shadow-sm"
                style={{ backgroundColor: colors.expenseInput }}
              >
                <CustomText
                  className="text-2xl text-center"
                  style={{ color: colors.text }}
                >
                  {(
                    <Ionicons
                      name={selectedPaymentMode}
                      size={30}
                      color="white"
                    />
                  ) || "Mode"}
                </CustomText>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="px-5 py-5">
          {/* Expense Name */}
          <CustomText className="text-xl mb-1" style={{ color: colors.text }}>
            Title
          </CustomText>
          <TextInput
            placeholder="Enter expense name"
            value={expense.expenseName}
            onChangeText={(text) => handleExpenseChange("expenseName", text)}
            className="p-4 mb-4 rounded-3xl shadow-sm text-xl"
            style={{
              backgroundColor: colors.expenseInput,
              color: colors.text,
              fontFamily: "Jost",
            }}
            placeholderTextColor="gray"
          />

          {/* Category */}
          <CustomText className="text-lg mb-1" style={{ color: colors.text }}>
            Category
          </CustomText>
          <Pressable
            onPress={() => setAddExpenseModals("category")} // Open category modal
            className="p-4 mb-4 rounded-3xl shadow-sm"
            style={{ backgroundColor: colors.expenseInput }}
          >
            <CustomText className="text-lg" style={{ color: colors.text }}>
              {expense.expenseCategory || "Select Category"}
            </CustomText>
          </Pressable>

          {/* Save Expense Button */}
          <Pressable
            onPress={() => {
              if (!amount || !expense.expenseName) {
                Alert.alert("Error", "Please enter an amount and title");
              } else {
                handleSaveExpense();
                setShowModal(null);
              }
            }}
            className="bg-[#57A6A1] p-4 rounded-3xl mt-4"
          >
            <CustomText className="text-lg text-center text-white">
              Save Expense
            </CustomText>
          </Pressable>
        </View>

        {/* Custom Keyboard Modal */}
        <Modal
          visible={addExpenseModals === "keyboard"}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAddExpenseModals(null)}
        >
          <View
            className="flex-1 justify-center"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <View
              className="absolute bottom-0 left-0 right-0  p-5 rounded-t-3xl"
              style={{ backgroundColor: colors.expenseForm }}
            >
              <CustomText
                className="text-2xl mb-4 text-center"
                style={{ color: "white" }}
              >
                Enter Amount
              </CustomText>

              {/* TextInput for Amount in Modal */}
              <TextInput
                value={numberWithCommas(amount)}
                editable={false} // Make it read-only since we use the custom keyboard
                style={{
                  backgroundColor: colors.expenseInput,
                  color: colors.text,
                  fontFamily: "Poppins_SemiBold",
                }}
                className="text-3xl text-center p-5 mb-4 rounded-xl"
              />

              {/* Custom Numeric Keyboard */}
              <View className="flex-wrap flex-row justify-center mb-5 rounded-3xl bg-slate-700">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map(
                  (key) => (
                    <Pressable
                      key={key}
                      className=" p-4 m-1  justify-center items-center w-[30%]"
                      onPress={() => handleKeyPress(key)}
                    >
                      <CustomText
                        className="text-xl"
                        style={{ color: "white" }}
                      >
                        {key}
                      </CustomText>
                    </Pressable>
                  )
                )}
                <Pressable
                  className=" p-4 m-1 justify-center items-center w-[30%]"
                  onPress={() => handleKeyPress("backspace")}
                >
                  <Entypo name="back" size={25} color="white" />
                </Pressable>
              </View>

              {/* Set Amount Button */}
              <Pressable
                onPress={handleSetAmount}
                className="bg-blue-500 p-4 rounded-3xl justify-center shadow-lg"
              >
                <CustomText className="text-lg text-center text-white">
                  Set Amount
                </CustomText>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Category Modal */}
        <Modal
          visible={addExpenseModals === "category"}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAddExpenseModals(null)}
        >
          <View
            className="flex-1 justify-end"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <View className="bg-white rounded-t-3xl p-5">
              <CustomText className="text-2xl mb-4 text-center">
                Select Category
              </CustomText>
              <FlatList
                data={CategoryData}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleCategorySelect(item)}
                    className="flex-row items-center p-3 border-b border-gray-200"
                  >
                    <FontAwesome5 name={item.icon} size={24} color="black" />
                    <CustomText className="ml-3 text-lg">
                      {item.label}
                    </CustomText>
                  </Pressable>
                )}
              />
              <Pressable
                onPress={() => setAddExpenseModals(null)}
                className="mt-4 bg-gray-300 p-3 rounded-full"
              >
                <CustomText className="text-center">Cancel</CustomText>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Payment Mode Modal */}
        <Modal
          visible={addExpenseModals === "paymentMode"}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAddExpenseModals(null)}
        >
          <View
            className="flex-1 justify-end"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <View className="bg-white rounded-t-3xl p-5">
              <CustomText className="text-2xl mb-4 text-center">
                Select Mode
              </CustomText>
              <FlatList
                data={PaymentModeData}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handlePaymentModeSelect(item)}
                    className="flex-row items-center p-3 border-b border-gray-200"
                  >
                    <Ionicons name={item.icon} size={20} color="black" />
                    <CustomText className="ml-3 text-black text-lg">
                      {item.label}
                    </CustomText>
                  </Pressable>
                )}
              />
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

export default AddExpenseModal;
