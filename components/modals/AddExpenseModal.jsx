import React, { useState } from "react";
import { View, TextInput, Pressable, Alert } from "react-native";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { Select, Radio } from "native-base";
import { useTheme } from "@react-navigation/native";
import CustomText from "../CustomText";

const AddExpenseModal = ({
  expense,
  handleExpenseChange,
  handleSaveExpense,
  setAddExpenseModal,
}) => {
  const PaymentModedata = [
    { label: "Cash", value: "Cash" },
    { label: "Online", value: "Online" },
    { label: "Card", value: "Card" },
  ];
  const CategoryData = [
    { label: "Food", value: "Food" },
    { label: "Clothing", value: "Clothing" },
    { label: "Entertainment", value: "Entertainment" },
    { label: "Groceries", value: "Groceries" },
    { label: "Utilities", value: "Utilities" },
    { label: "Travel", value: "Travel" },
    { label: "Rent", value: "Rent" },
    { label: "Education", value: "Education" },
  ];

  const { colors } = useTheme();
  const [formType, setFormType] = useState("");

  return (
    <View
      className="flex-1 justify-center items-center bg-opacity-90"
      style={{ backgroundColor: colors.background }}
    >
      <View
        className="rounded-xl p-6 w-11/12  shadow-2xl"
        style={{ elevation: 5, backgroundColor: colors.expenseForm }}
      >
        <CustomText
          className="text-3xl font-semibold mb-5 text-center"
          style={{ color: colors.primary }}
        >
          Add Expense
        </CustomText>

        {/* <View className="items-center">
          <Radio.Group
            className="flex-row gap-x-3"
            onChange={(value) => {
              handleExpenseChange("expenseType", value);
            }}
          >
            <Radio value="Reccuring">
              <CustomText className=" text-center" style={{ color: colors.text }}>Reccuring</CustomText>
            </Radio>
            <Radio value="Non-Reccuring">
              <CustomText className=" text-center" style={{ color: colors.text }}>Non-Reccuring</CustomText>
            </Radio>
          </Radio.Group>
        </View> */}

        <CustomText className="mb-2 text-lg" style={{ color: colors.text }}>
          Expense Type
        </CustomText>

        <View className="flex-row mb-5 gap-x-4">
          <Pressable
            className="flex-1 p-2 rounded-md"
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
            className="flex-1 p-2 rounded-md"
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

        {/* Expense Name */}
        <CustomText className="text-lg mb-1" style={{ color: colors.text }}>
          Expense Name
        </CustomText>
        <TextInput
          placeholder="Enter expense name"
          value={expense.expenseName}
          onChangeText={(text) => handleExpenseChange("expenseName", text)}
          className=" p-3 mb-4 rounded-md  shadow-sm"
          style={{ backgroundColor: colors.expenseInput, color: colors.text }}
          placeholderTextColor="#A0AEC0"
        />

        {/* Amount */}
        <CustomText className="text-lg mb-1" style={{ color: colors.text }}>
          Amount
        </CustomText>
        <TextInput
          placeholder="0"
          onChangeText={(text) =>
            handleExpenseChange("expenseAmount", Number(text))
          }
          className=" p-3 mb-4 rounded-md  shadow-sm"
          style={{ backgroundColor: colors.expenseInput, color: colors.text }}
          placeholderTextColor="#A0AEC0"
          keyboardType="numeric"
        />

        {/* Category */}
        <CustomText className="text-lg mb-1" style={{ color: colors.text }}>
          Category
        </CustomText>
        <Select
          selectedValue={expense.expenseCategory}
          placeholder="Select Category"
          onValueChange={(value) =>
            handleExpenseChange("expenseCategory", value)
          }
          backgroundColor={colors.expenseInput}
          _selectedItem={{
            bg: "blue.500",
            color: "white",
          }}
          color={colors.text}
          fontSize="16"
          h="55px"
          marginBottom="15px"
          placeholderTextColor="#A0AEC0"
          rounded="7"
          borderWidth="0"
        >
          {CategoryData.map((item) => (
            <Select.Item
              key={item.value}
              label={item.label}
              value={item.value}
            />
          ))}
        </Select>

        {/* Payment Mode */}
        <CustomText className="text-lg mb-1" style={{ color: colors.text }}>
          Payment Mode
        </CustomText>
        <Select
          selectedValue={expense.paymentMode}
          placeholder="Select Payment Mode"
          onValueChange={(value) => handleExpenseChange("paymentMode", value)}
          backgroundColor={colors.expenseInput}
          _selectedItem={{
            bg: "blue.500",
            color: "white",
          }}
          color={colors.text}
          fontSize="16"
          h="55px"
          rounded="7"
          placeholderTextColor="#A0AEC0"
          borderWidth="0"
        >
          {PaymentModedata.map((item) => (
            <Select.Item
              key={item.value}
              label={item.label}
              value={item.value}
            />
          ))}
        </Select>

        {/* Buttons */}
        <View className="flex-row justify-between mt-5">
          <Pressable
            onPress={() => setAddExpenseModal(false)}
            className="bg-red-500 p-4 rounded-full justify-center shadow-lg"
          >
            <Entypo name="cross" size={25} color="white" />
          </Pressable>
          <Pressable
            onPress={() => {
              if (formType === "") {
                Alert.alert("Error", "Select expense type")
              } else {
                handleSaveExpense()
              }
            }}
            className="bg-green-500 p-4 rounded-full justify-center shadow-lg"
          >
            <MaterialIcons name="check" size={25} color="white" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default AddExpenseModal;
