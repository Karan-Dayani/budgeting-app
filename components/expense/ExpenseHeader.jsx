import { Ionicons } from "@expo/vector-icons";
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

  return (
    <Animated.View className="w-full mt-5">
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
                  });
                  setDatePickerVisibility(false);
                }}
                className="bg-red-500 px-5 py-3 rounded-3xl justify-center"
              >
                <CustomText className="text-white text-lg mx-2">
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
                      top: 52,
                      right: 0,
                      width: 170,
                      backgroundColor: colors.card,
                      borderRadius: 16,
                      padding: 6,
                      zIndex: 2000,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 12,
                      elevation: 8,
                      borderWidth: 1,
                      borderColor: colors.dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
                      opacity: menuOpacity,
                      transform: [{ scale: menuScale }],
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        setDatePickerVisibility(true);
                        toggleMenu(false);
                      }}
                      style={({ pressed }) => [
                        styles.menuItem,
                        pressed && { backgroundColor: colors.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }
                      ]}
                    >
                      <Ionicons name="calendar-outline" size={18} color={colors.text} style={styles.menuIcon} />
                      <CustomText style={{ color: colors.text, fontSize: 16 }}>
                        Date
                      </CustomText>
                    </Pressable>
                    <View style={[styles.divider, { backgroundColor: colors.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }]} />
                    <Pressable
                      onPress={() => {
                        setShowModal("monthModal");
                        toggleMenu(false);
                      }}
                      style={({ pressed }) => [
                        styles.menuItem,
                        pressed && { backgroundColor: colors.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }
                      ]}
                    >
                      <Ionicons name="calendar" size={18} color={colors.text} style={styles.menuIcon} />
                      <CustomText style={{ color: colors.text, fontSize: 16 }}>
                        Month
                      </CustomText>
                    </Pressable>
                    <View style={[styles.divider, { backgroundColor: colors.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }]} />
                    <Pressable
                      onPress={() => {
                        setShowModal("categoryModal");
                        toggleMenu(false);
                      }}
                      style={({ pressed }) => [
                        styles.menuItem,
                        pressed && { backgroundColor: colors.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }
                      ]}
                    >
                      <Ionicons name="pricetag-outline" size={18} color={colors.text} style={styles.menuIcon} />
                      <CustomText style={{ color: colors.text, fontSize: 16 }}>
                        Category
                      </CustomText>
                    </Pressable>
                  </Animated.View>
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