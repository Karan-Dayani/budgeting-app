import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "native-base";
import React, { useState } from "react";
import {
  Animated,
  Pressable,
  View
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { numberWithCommas } from "../../lib/utils";
import ExpenseTypePicker from "./ExpenseTypePicker";
import CustomText from "../CustomText";

const ExpenseHeader = ({
  filters,
  setFilters,
  setDatePickerVisibility,
  setShowModal,
  handleConfirm,
  activeTab,
  setActiveTab,
  filteredExpenses,
  isDatePickerVisible
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const { colors } = useTheme()

  return (
    <Animated.View className="w-full mt-5"
    >
      <View>
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <CustomText
              style={{ color: colors.text }}
              className={`text-xl ml-1`}
            >
              {filters?.date
                ? filters.date
                : filters?.month
                  ? filters.month
                  : filters?.category
                    ? filters.category
                    : "All Expenses"}
            </CustomText>
            {/* <CustomText className={`text-xl ml-1`} style={{ color: colors.text }}>
                  {filters?.date
                    ? filters.date
                    : filters?.month
                      ? filters.month
                      : filters?.category
                        ? filters.category
                        : "All Expenses"}
                </CustomText> */}
            <CustomText className={`px-1`} style={{ color: colors.text }}>
              Total Expense: {numberWithCommas(filteredExpenses?.reduce((sum, expense) => sum + expense.expenseAmount, 0))}
            </CustomText>
          </View>
          <View className="flex-row gap-x-3" style={{ position: "relative" }}>
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
              <View>
                <Pressable
                  accessibilityLabel="More options menu"
                  onPress={() => setMenuOpen(!menuOpen)}
                >
                  <Animated.View
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
                  </Animated.View>
                </Pressable>
                {menuOpen && (
                  <View
                    style={{
                      position: "absolute",
                      top: 55,
                      right: 0,
                      width: 160,
                      backgroundColor: colors.inputBg,
                      borderRadius: 16,
                      padding: 8,
                      zIndex: 2000,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        setDatePickerVisibility(true);
                        setMenuOpen(false);
                      }}
                      style={{ padding: 12 }}
                    >
                      <CustomText style={{ color: colors.text, fontSize: 16 }}>
                        Date
                      </CustomText>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setShowModal("monthModal");
                        setMenuOpen(false);
                      }}
                      style={{ padding: 12 }}
                    >
                      <CustomText style={{ color: colors.text, fontSize: 16 }}>
                        Month
                      </CustomText>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setShowModal("categoryModal");
                        setMenuOpen(false);
                      }}
                      style={{ padding: 12 }}
                    >
                      <CustomText style={{ color: colors.text, fontSize: 16 }}>
                        Category
                      </CustomText>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={() => setDatePickerVisibility(false)}
          date={new Date()}
        />
      </View>
      <Animated.View >
        <ExpenseTypePicker
          setActiveTab={setActiveTab}
          activeTab={activeTab}
        />
      </Animated.View>
    </Animated.View>
  )
}

export default ExpenseHeader