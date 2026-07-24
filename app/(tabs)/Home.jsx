import { useIsFocused } from "expo-router/react-navigation";
import { Stack, Link } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  View,
  TouchableOpacity,
  Pressable,
} from "react-native";
import AnimatedHeader from "../../components/AnimatedHeader";
import { useAuthStore } from "../../components/globalState/authStore";
import { useBudgetStore } from "../../components/globalState/budgetStore";
import HistoryExpense from "../../components/home/HistoryExpense";
import HistoryGoals from "../../components/home/HistoryGoals";
import MonthChart from "../../components/home/MonthChart";
import TotalIncome from "../../components/TotalIncome";
import CustomText from "../../components/CustomText";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { AntDesign, Feather } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";

const Skeleton = ({ h, w, my, mb, rounded }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        height: typeof h === "string" && h.endsWith("px") ? parseInt(h) : h,
        width: typeof w === "string" && w.endsWith("px") ? parseInt(w) : w || "100%",
        marginTop: my ? (my === "1" ? 4 : 8) : undefined,
        marginBottom: mb ? (mb === "1" ? 4 : 8) : my ? (my === "1" ? 4 : 8) : undefined,
        borderRadius: rounded === "3xl" ? 24 : rounded === "20px" ? 20 : 8,
        backgroundColor: colors.inputBg || "#E5E7EB",
      }}
    />
  );
};

export default function Home() {
  const { user } = useAuthStore();
  const {
    username,
    income,
    savings,
    expenses,
    goals,
    accounts,
    budgets,
    loading,
    fetchBudget
  } = useBudgetStore();

  const isFocused = useIsFocused();
  const { colors, dark } = useTheme();
  const fadeInOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;


  useEffect(() => {
    if (isFocused) {
      fadeInOpacity.setValue(0);
      translateY.setValue(10);
      Animated.parallel([
        Animated.timing(fadeInOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      fadeInOpacity.setValue(0);
      translateY.setValue(10);
    }
  }, [isFocused]);

  // Unified budget fetch from store
  useEffect(() => {
    if (isFocused && user) {
      const email = user.email || user.user_metadata?.email;
      if (email) {
        fetchBudget(email, user.id);
      }
    }
  }, [isFocused, user]);

  // Re-construct the userData array in the exact shape children components expect
  const userData = React.useMemo(() => {
    return [
      {
        username,
        income,
        savings,
        expenses,
        goals,
        accounts,
        budgets,
        email: user?.email || user?.user_metadata?.email || "",
      }
    ];
  }, [username, income, savings, expenses, goals, accounts, budgets, user]);

  // Calculate budgets close to or exceeding limit (spent >= 85%) for the current system date
  const warningBudgets = React.useMemo(() => {
    if (!budgets || budgets.length === 0) return [];

    const date = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthAbbr = months[date.getMonth()]; // e.g. "Jul"
    const currentYearStr = String(date.getFullYear()); // e.g. "2026"

    const monthMap = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
      Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    };

    return budgets
      .filter((b) => b.budgetMonth === currentMonthAbbr && b.budgetYear === currentYearStr)
      .map((b) => {
        const targetMonthNum = monthMap[b.budgetMonth] || "01";
        const spent = expenses
          .filter((e) => {
            const catMatch = e.expenseCategory?.toLowerCase() === b.budgetCategory.toLowerCase();
            const dateMatch = e.transaction_date && e.transaction_date.startsWith(`${b.budgetYear}-${targetMonthNum}`);
            return catMatch && dateMatch;
          })
          .reduce((sum, e) => sum + Number(e.expenseAmount || 0), 0);

        const limit = b.budgetAmount;
        const percent = limit > 0 ? (spent / limit) * 100 : 0;
        return {
          category: b.budgetCategory,
          limit,
          spent,
          percent,
        };
      })
      .filter((b) => b.percent >= 85);
  }, [budgets, expenses]);

  // Calculate accounts with low or negative balance (balance < 1000)
  const warningAccounts = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return [];
    return accounts
      .filter((acc) => acc.balance < 1000)
      .map((acc) => ({
        id: acc.id,
        name: acc.name,
        balance: acc.balance,
        isNegative: acc.balance < 0,
      }));
  }, [accounts]);

  return (
    <View className="flex-1 mb-5" style={{
      backgroundColor: colors.background
    }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar
        barStyle={dark ? "light-content" : "dark-content"}
        backgroundColor={colors.header}
      />

      <ScrollView
        className="px-5 py-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View>
          <AnimatedHeader
            user={userData}
          />
        </Animated.View>
        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [{ translateY }],
          }}
        >
          {loading ? (
            <>
              <Skeleton
                h="100px"
                mb="1"
                rounded="20px"
                startColor="coolGray.300"
              />
              <View className="flex-row justify-between">
                <Skeleton
                  h="100px"
                  w="156px"
                  my="1"
                  rounded="20px"
                  startColor="coolGray.300"
                />
                <Skeleton
                  h="100px"
                  w="156px"
                  my="1"
                  rounded="20px"
                  startColor="coolGray.300"
                />
              </View>
            </>
          ) : (
            <>
              <Animated.View className="w-full">
                <TotalIncome user={userData} />
              </Animated.View>

              {/* Budget Warning Alerts Card */}
              {warningBudgets.length > 0 && (
                <Link href="/(tabs)/Budget" asChild>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 24,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: dark ? 0 : 1,
                      borderColor: "#E5E7EB",
                      marginBottom: 18,
                      marginTop: 4,
                      position: "relative",
                      overflow: "hidden",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: dark ? 0.2 : 0.04,
                      shadowRadius: 10,
                      elevation: 2,
                    }}
                  >
                    {/* Left visual accent bar */}
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 5,
                        backgroundColor: "#FF5252",
                      }}
                    />

                    {/* Warning icon container */}
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        backgroundColor: dark ? "rgba(255, 82, 82, 0.12)" : "rgba(255, 82, 82, 0.08)",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 14,
                        marginLeft: 4,
                      }}
                    >
                      <Feather name="alert-triangle" size={16} color="#FF5252" />
                    </View>

                    {/* Alert Text */}
                    <View style={{ flex: 1 }}>
                      <CustomText style={{ fontSize: 14, fontFamily: "Poppins_Bold", color: colors.text }}>
                        Budget Alert
                      </CustomText>
                      <CustomText style={{ fontSize: 12, fontFamily: "Poppins_Medium", color: colors.secondary, marginTop: 2 }}>
                        {warningBudgets.length === 1
                          ? `Your ${warningBudgets[0].category} budget is close to limit (${Math.round(warningBudgets[0].percent)}% spent).`
                          : `${warningBudgets.length} budgets are close to or exceeding limits.`}
                      </CustomText>
                    </View>

                    {/* Right action button */}
                    <View
                      style={{
                        backgroundColor: dark ? "rgba(255,255,255,0.05)" : "#F3F4F6",
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 8,
                      }}
                    >
                      <Feather name="arrow-right" size={14} color={colors.text} />
                    </View>
                  </TouchableOpacity>
                </Link>
              )}

              {/* Account Warning Alerts Card */}
              {warningAccounts.length > 0 && (
                <Link href="/profile/accounts" asChild>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 24,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: dark ? 0 : 1,
                      borderColor: "#E5E7EB",
                      marginBottom: 18,
                      marginTop: 4,
                      position: "relative",
                      overflow: "hidden",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: dark ? 0.2 : 0.04,
                      shadowRadius: 10,
                      elevation: 2,
                    }}
                  >
                    {/* Left visual accent bar */}
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 5,
                        backgroundColor: warningAccounts.some(a => a.isNegative) ? "#FF5252" : "#FFB300",
                      }}
                    />

                    {/* Warning icon container */}
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        backgroundColor: warningAccounts.some(a => a.isNegative)
                          ? (dark ? "rgba(255, 82, 82, 0.12)" : "rgba(255, 82, 82, 0.08)")
                          : (dark ? "rgba(255, 179, 0, 0.12)" : "rgba(255, 179, 0, 0.08)"),
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 14,
                        marginLeft: 4,
                      }}
                    >
                      <Feather
                        name={warningAccounts.some(a => a.isNegative) ? "alert-triangle" : "info"}
                        size={16}
                        color={warningAccounts.some(a => a.isNegative) ? "#FF5252" : "#FFB300"}
                      />
                    </View>

                    {/* Alert Text */}
                    <View style={{ flex: 1 }}>
                      <CustomText style={{ fontSize: 14, fontFamily: "Poppins_Bold", color: colors.text }}>
                        Account Alert
                      </CustomText>
                      <CustomText style={{ fontSize: 12, fontFamily: "Poppins_Medium", color: colors.secondary, marginTop: 2 }}>
                        {warningAccounts.length === 1
                          ? `${warningAccounts[0].name} balance is ${warningAccounts[0].isNegative ? "negative" : "low"} (₹${warningAccounts[0].balance.toLocaleString("en-IN")}).`
                          : `${warningAccounts.length} accounts have low or negative balances.`}
                      </CustomText>
                    </View>

                    {/* Right action button */}
                    <View
                      style={{
                        backgroundColor: dark ? "rgba(255,255,255,0.05)" : "#F3F4F6",
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 8,
                      }}
                    >
                      <Feather name="arrow-right" size={14} color={colors.text} />
                    </View>
                  </TouchableOpacity>
                </Link>
              )}

              {/* Accounts Card List */}
              <Animated.View style={{ marginTop: 8, marginBottom: 16 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <CustomText style={{ fontFamily: "Poppins_Bold", fontSize: 18, color: colors.text }}>
                    My Accounts
                  </CustomText>
                  <Link href={"/profile/accounts"} asChild>
                    <TouchableOpacity>
                      <CustomText style={{ color: "#41B3A2", fontFamily: "Poppins_SemiBold", fontSize: 14 }}>
                        Manage
                      </CustomText>
                    </TouchableOpacity>
                  </Link>
                </View>

                {accounts && accounts.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 20 }}
                  >
                    {accounts.map((acc) => {
                      // Visual customization based on account type
                      let cardBg = "#4F46E5"; // Indigo default
                      let cardAccentCircle = "rgba(255, 255, 255, 0.08)";
                      if (acc.type === "Digital Wallet") {
                        cardBg = "#10B981"; // Emerald Green
                      } else if (acc.type === "Cash") {
                        cardBg = "#F59E0B"; // Amber Gold
                      } else if (acc.type === "Credit Card") {
                        cardBg = "#EC4899"; // Pink
                      }

                      return (
                        <View
                          key={acc.id}
                          style={{
                            width: 220,
                            height: 130,
                            backgroundColor: cardBg,
                            borderRadius: 24,
                            padding: 16,
                            marginRight: 14,
                            position: "relative",
                            overflow: "hidden",
                            justifyContent: "space-between",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.12,
                            shadowRadius: 8,
                            elevation: 4,
                          }}
                        >
                          {/* Translucent background circles for depth */}
                          <View
                            style={{
                              position: "absolute",
                              right: -25,
                              top: -25,
                              width: 100,
                              height: 100,
                              borderRadius: 50,
                              backgroundColor: cardAccentCircle,
                            }}
                          />
                          <View
                            style={{
                              position: "absolute",
                              left: -20,
                              bottom: -40,
                              width: 80,
                              height: 80,
                              borderRadius: 40,
                              backgroundColor: "rgba(255, 255, 255, 0.04)",
                            }}
                          />

                          {/* Card Top Header */}
                          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", zIndex: 1 }}>
                            <View
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 17,
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {acc.type === "Bank" ? (
                                <FontAwesome name="bank" size={14} color="#FFFFFF" />
                              ) : acc.type === "Cash" ? (
                                <FontAwesome name="money" size={14} color="#FFFFFF" />
                              ) : acc.type === "Credit Card" ? (
                                <FontAwesome name="credit-card" size={14} color="#FFFFFF" />
                              ) : (
                                <FontAwesome name="google-wallet" size={14} color="#FFFFFF" />
                              )}
                            </View>
                            {/* Mock microchip */}
                            <View
                              style={{
                                width: 30,
                                height: 22,
                                borderRadius: 4,
                                backgroundColor: "#ECC94B",
                                opacity: 0.85,
                              }}
                            />
                          </View>

                          {/* Card Balance */}
                          <View style={{ zIndex: 1, marginTop: 4 }}>
                            <CustomText
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color: "#FFFFFF",
                                fontFamily: "Poppins_Bold",
                              }}
                            >
                              ₹{acc.balance.toLocaleString("en-IN")}
                            </CustomText>
                          </View>

                          {/* Card Footer Info */}
                          <View style={{ zIndex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                              <CustomText
                                numberOfLines={1}
                                style={{
                                  fontSize: 13,
                                  fontFamily: "Poppins_SemiBold",
                                  color: "#FFFFFF",
                                }}
                              >
                                {acc.name}
                              </CustomText>
                            </View>
                            <CustomText
                              style={{
                                fontSize: 10,
                                fontFamily: "Poppins_Medium",
                                color: "rgba(255, 255, 255, 0.8)",
                              }}
                            >
                              {acc.type === "Credit Card" ? "CARD" : acc.type === "Digital Wallet" ? "WALLET" : acc.type.toUpperCase()}
                            </CustomText>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <View
                    style={{
                      padding: 24,
                      borderRadius: 24,
                      backgroundColor: colors.inputBg,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: dark ? 0 : 1,
                      borderColor: '#E5E7EB',
                    }}
                  >
                    <Feather name="info" size={24} color="#78909C" style={{ marginBottom: 8 }} />
                    <CustomText style={{ fontSize: 14, fontFamily: "Poppins_SemiBold", color: colors.text }}>
                      No accounts configured
                    </CustomText>
                    <CustomText style={{ fontSize: 12, color: "#8A9Aad", textAlign: "center", marginTop: 2, marginBottom: 12 }}>
                      Add your accounts to display them here.
                    </CustomText>
                    <Link href={"/profile/accounts"} asChild>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: `${colors.primary}15`,
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 14,
                          borderWidth: 1.2,
                          borderColor: `${colors.primary}30`,
                        }}
                      >
                        <Feather name="plus" size={14} color="#41B3A2" style={{ marginRight: 6 }} />
                        <CustomText style={{ color: "#41B3A2", fontSize: 12, fontFamily: "Poppins_Bold" }}>
                          Add Account
                        </CustomText>
                      </TouchableOpacity>
                    </Link>
                  </View>
                )}
              </Animated.View>
            </>
          )}
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [{ translateY }],
          }}
        >

          {loading ? (
            <Skeleton
              h="250px"
              my="1"
              rounded="3xl"
              startColor="coolGray.300"
            />
          ) : (
            <>
              <MonthChart colors={colors} dark={dark} userData={userData} />
            </>
          )}

        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [{ translateY }],
          }}
        >
          {loading ? (
            <Skeleton
              h="250px"
              my="1"
              rounded="3xl"
              startColor="coolGray.300"
            />
          ) : (
            <HistoryExpense
              colors={colors}
              dark={dark}
              userData={userData}
            />
          )}

          {loading ? (
            <Skeleton
              h="250px"
              my="1"
              rounded="3xl"
              startColor="coolGray.300"
            />
          ) : (
            <HistoryGoals
              colors={colors}
              dark={dark}
              userData={userData}
            />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
