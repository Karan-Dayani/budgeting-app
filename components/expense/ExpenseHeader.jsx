import { Ionicons, Feather } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";
import React, { useState, useEffect } from "react";
import {
  Animated,
  Pressable,
  View,
  StyleSheet
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
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const [menuAnim] = useState(() => new Animated.Value(0));
  const [pressScale] = useState(() => new Animated.Value(1));

  const { colors } = useTheme();

  const toggleMenu = (open) => {
    if (open) {
      setIsMenuMounted(true);
      Animated.spring(menuAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start(() => {
        setIsMenuMounted(false);
      });
    }
  };

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const menuScale = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const menuOpacity = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const totalExpenseSum = filteredExpenses?.reduce((sum, exp) => sum + exp.expenseAmount, 0) || 0;

  const getFilterLabel = () => {
    if (filters?.date) return filters.date;
    if (filters?.month) return filters.month;
    if (filters?.category) return filters.category;
    return "All Expenses";
  };

  return (
    <Animated.View className="w-full mt-4">
      <View
        className="rounded-[28px] p-5 mb-4 shadow-sm"
        style={{ backgroundColor: colors.inputBg, zIndex: 50, elevation: 10 }}
      >
        <View className="flex-row justify-between items-start mb-4">
          <View>
            <CustomText className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              {getFilterLabel()}
            </CustomText>
            <CustomText style={{ color: colors.text }} className="text-sm text-gray-500 mt-0.5">
              Total Period Spending
            </CustomText>
          </View>

          <View className="flex-row items-center gap-2" style={{ position: "relative" }}>
            {filters?.date || filters?.month || filters?.category ? (
              <Pressable
                onPress={() => {
                  setFilters({ date: "", month: "", category: "" });
                  setDatePickerVisibility(false);
                }}
                className="bg-red-500/10 px-4 py-2 rounded-full justify-center flex-row items-center"
              >
                <Feather name="refresh-cw" size={14} color="#EF4444" />
                <CustomText className="text-red-500 text-sm font-bold ml-1">
                  Reset
                </CustomText>
              </Pressable>
            ) : (
              <View style={{ zIndex: 2000 }}>
                <Pressable
                  accessibilityLabel="More options menu"
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={() => toggleMenu(!isMenuMounted)}
                >
                  <Animated.View
                    className="flex-row items-center rounded-3xl py-2 px-4"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderWidth: colors.dark ? 0 : 1,
                      borderColor: "#E5E7EB",
                      transform: [{ scale: pressScale }],
                    }}
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

                {isMenuMounted && (
                  <Animated.View
                    style={{
                      position: "absolute",
                      top: 40,
                      right: 0,
                      width: 150,
                      backgroundColor: colors.expenseForm,
                      borderRadius: 20,
                      padding: 6,
                      zIndex: 2000,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 5,
                      elevation: 8,
                      borderWidth: 1,
                      borderColor: colors.background + '15'
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        setDatePickerVisibility(true);
                        toggleMenu(false);
                      }}
                      className="flex-row items-center p-3 rounded-xl gap-2"
                      style={({ pressed }) => [{ backgroundColor: pressed ? colors.background + '22' : 'transparent' }]}
                    >
                      <Feather name="calendar" size={16} color={colors.text} className="mr-2.5" />
                      <CustomText style={{ color: colors.text }} className="text-sm font-medium">Date</CustomText>
                    </Pressable>
                    <View style={[styles.divider, { backgroundColor: colors.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }]} />
                    <Pressable
                      onPress={() => {
                        setShowModal("monthModal");
                        toggleMenu(false);
                      }}
                      className="flex-row items-center p-3 rounded-xl gap-2"
                      style={({ pressed }) => [{ backgroundColor: pressed ? colors.background + '22' : 'transparent' }]}
                    >
                      <Feather name="clock" size={16} color={colors.text} className="mr-2.5" />
                      <CustomText style={{ color: colors.text }} className="text-sm font-medium">Month</CustomText>
                    </Pressable>
                    <View style={[styles.divider, { backgroundColor: colors.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }]} />
                    <Pressable
                      onPress={() => {
                        setShowModal("categoryModal");
                        toggleMenu(false);
                      }}
                      className="flex-row items-center p-3 rounded-xl gap-2"
                      style={({ pressed }) => [{ backgroundColor: pressed ? colors.background + '22' : 'transparent' }]}
                    >
                      <Feather name="grid" size={16} color={colors.text} className="mr-2.5" />
                      <CustomText style={{ color: colors.text }} className="text-sm font-medium">Category</CustomText>
                    </Pressable>
                  </Animated.View>
                )}
              </View>
            )}
          </View>
        </View>

        <CustomText className="text-white text-3xl font-bold mt-1" style={{ color: colors.text, fontFamily: "Poppins_Bold" }}>
          ₹{numberWithCommas(totalExpenseSum)}
        </CustomText>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        date={new Date()}
      />

      <Animated.View>
        <ExpenseTypePicker
          setActiveTab={setActiveTab}
          activeTab={activeTab}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  menuIcon: {
    marginRight: 10,
  },
  divider: {
    height: 1,
    marginHorizontal: 8,
    marginVertical: 4,
  }
});

export default ExpenseHeader;