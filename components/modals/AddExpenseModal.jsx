import React, { useState } from "react";
import { View, TextInput, Pressable, Alert, Modal, FlatList } from "react-native";
import { Entypo, FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import CustomText from "../CustomText";

const AddExpenseModal = ({
  expense,
  handleExpenseChange,
  handleSaveExpense,
  setAddExpenseModal
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
  const [formType, setFormType] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);

  const handleKeyPress = (key) => {
    if (key === "backspace") {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === "." && amount.includes(".")) {
      return; // Prevent multiple decimal points
    } else {
      setAmount((prev) => prev + key);
    }
  };

  const handleSetAmount = () => {
    handleExpenseChange("expenseAmount", parseFloat(amount) || 0);
    setShowKeyboard(false); // Close modal
  };

  const handleCategorySelect = (category) => {
    console.log(category.value)
    handleExpenseChange("expenseCategory", category.value);
    setShowCategoryModal(false); // Close category modal
  };

  const handlePaymentModeSelect = (mode) => {
    console.log(mode.value)
    setSelectedPaymentMode(mode.icon);
    handleExpenseChange("paymentMode", mode.value);
    setShowPaymentModeModal(false); // Close payment mode modal
  };



  return (
    <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
      <CustomText className="text-white text-3xl pl-3 pb-2 font-semibold">
        Add Expense
      </CustomText>
      <View className="rounded-t-3xl" style={{ backgroundColor: colors.expenseForm, paddingBottom: 20 }}>
        {/* Amount TextInput */}
        <View className="flex-row rounded-t-3xl" style={{ backgroundColor: colors.expenseAmount }}>
          <Pressable
            className="flex-1 p-3 rounded-tl-3xl"
            onPress={() => {
              setFormType("Non-Recurring");
              handleExpenseChange("expenseType", "Non-Recurring");
            }}
            style={{
              backgroundColor:
                formType === "Non-Recurring" ? "#57A6A1" : colors.inputBg,
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
            className="flex-1 p-3  rounded-tr-3xl"
            onPress={() => {
              setFormType("Recurring");
              handleExpenseChange("expenseType", "Recurring");
            }}
            style={{
              backgroundColor:
                formType === "Recurring" ? "#57A6A1" : colors.inputBg,
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
        <View className="p-5  flex-row gap-x-2" style={{ backgroundColor: colors.expenseAmount }}>
          <View className="flex-1">
            <CustomText className="text-2xl mb-4" style={{ color: colors.text }}>
              Amount
            </CustomText>
            <Pressable
              onPress={() => setShowKeyboard(true)}
              className="p-6 mb-4 rounded-3xl shadow-sm"
              style={{ backgroundColor: colors.expenseInput }}
            >
              <CustomText className="text-3xl" style={{ color: colors.text }}>
                ₹ {amount || "0"}
              </CustomText>
            </Pressable>
          </View>
          <View className="w-20">
            <CustomText className="text-2xl mb-4" style={{ color: colors.text }}>
              Mode
            </CustomText>
            <Pressable
              onPress={() => setShowPaymentModeModal(true)}
              className="p-6 mb-4 rounded-3xl shadow-sm"
              style={{ backgroundColor: colors.expenseInput }}
            >
              <CustomText className="text-3xl text-center" style={{ color: colors.text }}>
                {<Ionicons name={selectedPaymentMode} size={30} color="white" /> || "Mode"}
              </CustomText>
            </Pressable>
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
              fontFamily: "Jost"
            }}
            placeholderTextColor="gray"
          />

          {/* Category */}
          <CustomText className="text-lg mb-1" style={{ color: colors.text }}>
            Category
          </CustomText>
          <Pressable
            onPress={() => setShowCategoryModal(true)} // Open category modal
            className="p-4 mb-4 rounded-3xl shadow-sm"
            style={{ backgroundColor: colors.expenseInput }}
          >
            <CustomText className="text-lg" style={{ color: colors.text }}>
              {expense.expenseCategory || "Select Category"}
            </CustomText>
          </Pressable>

          {/* Payment Mode */}


          {/* Save Expense Button */}
          <Pressable
            onPress={() => {
              if (!amount || !expense.expenseName) {
                Alert.alert("Error", "Please enter an amount and title");
              } else {
                handleSaveExpense();
                setAddExpenseModal(false)
              }
            }}
            className="bg-[#57A6A1] p-4 rounded-3xl mt-4"
          >
            <CustomText className="text-lg text-center text-white">Save Expense</CustomText>
          </Pressable>
        </View>

        {/* Buttons */}
        {/* <View className="flex-row justify-between mt-5">
          <Pressable
            onPress={() => setAddExpenseModal(false)}
            className="bg-red-500 p-4 rounded-full justify-center shadow-lg"
          >
            <Entypo name="cross" size={25} color="white" />
          </Pressable>
          <Pressable
            onPress={() => {
              if (!amount || !expense.expenseName) {
                Alert.alert("Error", "Please enter an amount and title");
              } else {
                handleSaveExpense();
              }
            }}
            className="bg-green-500 p-4 rounded-full justify-center shadow-lg"
          >
            <MaterialIcons name="check" size={25} color="white" />
          </Pressable>
        </View> */}

        {/* Custom Keyboard Modal */}
        <Modal
          visible={showKeyboard}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowKeyboard(false)}
        >
          <View className="flex-1 justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View className="absolute bottom-0 left-0 right-0  p-5 rounded-t-3xl" style={{ backgroundColor: colors.expenseForm }}>
              <CustomText className="text-2xl mb-4 text-center" style={{ color: "white" }}>
                Enter Amount
              </CustomText>

              {/* TextInput for Amount in Modal */}
              <TextInput
                value={amount}
                editable={false} // Make it read-only since we use the custom keyboard
                style={{
                  backgroundColor: colors.expenseInput,
                  color: colors.text,
                  fontFamily: "Jost"
                }}
                className="text-3xl text-center p-5 mb-4 rounded-xl"
              />

              {/* Custom Numeric Keyboard */}
              <View className="flex-wrap flex-row justify-between mb-5">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map(
                  (key) => (
                    <Pressable
                      key={key}
                      className="bg-slate-700 p-4 m-1 rounded-xl justify-center items-center w-[30%]"
                      onPress={() => handleKeyPress(key)}
                    >
                      <CustomText className="text-xl" style={{ color: "white" }}>
                        {key}
                      </CustomText>
                    </Pressable>
                  )
                )}
                <Pressable
                  className="bg-slate-700 p-4 m-1 rounded-xl justify-center items-center w-[30%]"
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
                <CustomText className="text-lg text-center text-white">Set Amount</CustomText>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Category Modal */}
        <Modal
          visible={showCategoryModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
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
                    <CustomText className="ml-3 text-lg">{item.label}</CustomText>
                  </Pressable>
                )}
              />
              <Pressable
                onPress={() => setShowCategoryModal(false)}
                className="mt-4 bg-gray-300 p-3 rounded-full"
              >
                <CustomText className="text-center">Cancel</CustomText>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Payment Mode Modal */}
        <Modal
          visible={showPaymentModeModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPaymentModeModal(false)}
        >
          <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
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
                    <CustomText className="ml-3 text-black text-lg" >
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
