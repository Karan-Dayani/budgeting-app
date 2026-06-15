import {
  FontAwesome,
  FontAwesome5,
  Ionicons
} from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { numberWithCommas } from "../../lib/utils";
import CustomText from "../CustomText";

const AddExpenseModal = ({
  expense,
  handleExpenseChange,
  handleSaveExpense,
  setShowModal,
  colors
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
    <Pressable
      onPress={() => setShowModal(null)}
      className="flex-1 justify-end"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
    >
      <Pressable onPress={() => { }}>
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
                <View
                  className="flex-row items-center px-6 rounded-3xl shadow-sm"
                  style={{ backgroundColor: colors.expenseInput, height: 80 }}
                >
                  <CustomText
                    className="text-3xl mr-1"
                    style={{
                      color: colors.text,
                      fontFamily: "Poppins_SemiBold",
                    }}
                  >
                    ₹
                  </CustomText>
                  <TextInput
                    value={amount}
                    onChangeText={(text) => {
                      const cleanText = text.replace(/[^0-9.]/g, "");
                      setAmount(cleanText);
                      handleExpenseChange("expenseAmount", parseFloat(cleanText) || 0);
                    }}
                    placeholder="0"

                    placeholderTextColor="gray"
                    keyboardType="decimal-pad"
                    className="text-3xl flex-1"
                    style={[{
                      color: colors.text,
                      fontFamily: "Poppins_SemiBold",
                      height: "100%",
                    }, amount === '' && { textAlignVertical: "bottom" }]}
                  />
                </View>
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
                    {selectedPaymentMode ?
                      <Ionicons
                        name={selectedPaymentMode}
                        size={30}
                        color="white"
                      /> : <FontAwesome name="rupee" size={30} color="white" />
                    }
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



          {/* Category Modal */}
          <Modal
            visible={addExpenseModals === "category"}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setAddExpenseModals(null)}
          >
            <Pressable
              onPress={() => setAddExpenseModals(null)}
              className="flex-1 justify-end"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            >
              <Pressable onPress={() => { }} className="bg-white rounded-t-3xl p-5">
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
              </Pressable>
            </Pressable>
          </Modal>

          {/* Payment Mode Modal */}
          <Modal
            visible={addExpenseModals === "paymentMode"}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setAddExpenseModals(null)}
          >
            <Pressable
              onPress={() => setAddExpenseModals(null)}
              className="flex-1 justify-end"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            >
              <Pressable onPress={() => { }} className="bg-white rounded-t-3xl p-5">
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
              </Pressable>
            </Pressable>
          </Modal>
        </View>
      </Pressable>
    </Pressable>
  );
};

export default AddExpenseModal;
