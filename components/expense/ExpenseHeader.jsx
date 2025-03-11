import { Ionicons } from "@expo/vector-icons";
import { Menu, useTheme } from "native-base";
import React from "react";
import {
  Animated,
  Pressable,
  View
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { numberWithCommas } from "../../app/utils";
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
          <View className="flex-row gap-x-3">
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
              <Menu
                w="160"
                marginRight={5}
                backgroundColor={colors.inputBg}
                rounded="3xl"
                trigger={(triggerProps) => {
                  return (
                    <>
                      <Pressable
                        accessibilityLabel="More options menu"
                        {...triggerProps}

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
                      {/* <Link
                            href={"/Test/"}
                          >
                            <View
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
                                Test
                              </CustomText>
                            </View>
                          </Link> */}
                    </>
                  );
                }}
              >
                <Menu.Item
                  _text={{
                    color: colors.text,
                    fontSize: "lg",
                    paddingBottom: 2,
                  }}
                  onPress={() => setDatePickerVisibility(true)}
                >
                  Date
                </Menu.Item>
                <Menu.Item
                  _text={{
                    color: colors.text,
                    fontSize: "lg",
                    paddingBottom: 2,
                  }}
                  onPress={() => setShowModal("monthModal")}
                >
                  Month
                </Menu.Item>
                <Menu.Item
                  _text={{
                    color: colors.text,
                    fontSize: "lg",
                    paddingBottom: 2,
                  }}
                  onPress={() => setShowModal("categoryModal")}
                >
                  Category
                </Menu.Item>
              </Menu>
            )}
          </View>
        </View>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={() => setDatePickerVisibility(false)}
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