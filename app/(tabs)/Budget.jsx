import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import { useIsFocused } from "expo-router/react-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5, Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import CustomText from "../../components/CustomText";
import FloatingAddButton from "../../components/FloatingAddButton";
import CustomCircularProgress from "../../components/CustomCircularProgress";
import { Notification } from "../../lib/utils";
import { useAuthStore } from "../../components/globalState/authStore";
import { useBudgetStore } from "../../components/globalState/budgetStore";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

// Pre-defined categories corresponding to CategoryPicker in the app
const CATEGORIES = [
  { label: "Food", icon: "utensils", primary: "#FF7043", tint: "rgba(255, 112, 67, 0.12)" },
  { label: "Groceries", icon: "shopping-cart", primary: "#66BB6A", tint: "rgba(102, 187, 106, 0.12)" },
  { label: "Rent", icon: "home", primary: "#EC407A", tint: "rgba(236, 64, 122, 0.12)" },
  { label: "Utilities", icon: "bolt", primary: "#FFA726", tint: "rgba(255, 167, 38, 0.12)" },
  { label: "Travel", icon: "plane", primary: "#26A69A", tint: "rgba(38, 166, 154, 0.12)" },
  { label: "Entertainment", icon: "film", primary: "#29B6F6", tint: "rgba(41, 182, 246, 0.12)" },
  { label: "Clothing", icon: "font-awesome-alt", primary: "#AB47BC", tint: "rgba(171, 71, 188, 0.12)" },
  { label: "Education", icon: "book", primary: "#5C6BC0", tint: "rgba(92, 107, 192, 0.12)" },
  { label: "Other", icon: "ellipsis-h", primary: "#8D6E63", tint: "rgba(141, 110, 99, 0.12)" },
];

const MONTHS = [
  "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026",
  "Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026", "Dec 2026"
];

const CURRENT_MONTH = "Jul 2026";

export default function BudgetPage() {
  const { colors, dark } = useTheme();
  const isFocused = useIsFocused();

  // Screen transition animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  // Subscribe to auth and budget store
  const { user } = useAuthStore();
  const {
    budgets: storeBudgets,
    expenses,
    fetchBudget,
    addBudget,
    updateBudget,
    deleteBudget,
    submitting,
  } = useBudgetStore();

  const [showModal, setShowModal] = useState(false);
  const [notify, setNotify] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);

  // Form inputs state
  const [formCategory, setFormCategory] = useState("Food");
  const [formLimit, setFormLimit] = useState("");
  const [formSpent, setFormSpent] = useState("");
  const [formMonth, setFormMonth] = useState(CURRENT_MONTH);

  // Trigger page animations and fetch budgets
  useEffect(() => {
    if (isFocused) {
      fadeAnim.setValue(0);
      slideAnim.setValue(10);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      if (user) {
        const email = user.email || user.user_metadata?.email;
        if (email) {
          fetchBudget(email, user.id);
        }
      }
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(10);
    }
  }, [isFocused, user]);

  // Dynamically calculate spent amount from actual expenses/transactions in the store!
  const budgets = storeBudgets.map((b) => {
    const monthYear = `${b.budgetMonth} ${b.budgetYear}`;

    // Map month abbreviation to numeric string for filtering: "Jan" -> "01", "Jul" -> "07", etc.
    const monthMap = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
      Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    };
    const targetMonthNum = monthMap[b.budgetMonth] || "01";

    const spent = expenses
      .filter((e) => {
        const catMatch = e.expenseCategory?.toLowerCase() === b.budgetCategory.toLowerCase();
        // check transaction_date
        const dateMatch = e.transaction_date && e.transaction_date.startsWith(`${b.budgetYear}-${targetMonthNum}`);
        return catMatch && dateMatch;
      })
      .reduce((sum, e) => sum + Number(e.expenseAmount || 0), 0);

    return {
      id: b.budgetId,
      category: b.budgetCategory,
      limit: b.budgetAmount,
      spent: spent,
      month: monthYear,
    };
  });

  // Calculate totals
  const totalLimit = budgets.reduce((sum, item) => sum + item.limit, 0);
  const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
  const remaining = totalLimit - totalSpent;
  const progressPercent = totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0;

  // Trigger notifications helper
  const triggerNotification = (text) => {
    setNotify(text);
    setTimeout(() => setNotify(null), 2500);
  };

  // Open modal for adding a new budget
  const handleOpenAdd = () => {
    setEditingBudget(null);
    setFormCategory("Food");
    setFormLimit("");
    setFormSpent("");
    setFormMonth(CURRENT_MONTH);
    setShowModal(true);
  };

  // Open modal for editing an existing budget
  const handleOpenEdit = (budget) => {
    setEditingBudget(budget);
    setFormCategory(budget.category);
    setFormLimit(budget.limit.toString());
    setFormSpent(budget.spent.toString());
    setFormMonth(budget.month);
    setShowModal(true);
  };

  // Save budget handler (Adds or edits budget in Supabase DB via store)
  const handleSaveBudget = async () => {
    if (!formLimit || isNaN(Number(formLimit)) || Number(formLimit) <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid budget limit amount.");
      return;
    }

    const limitVal = Number(formLimit);
    const [monthStr, yearStr] = formMonth.split(" "); // e.g. "Jul 2026" -> "Jul", "2026"

    // Check if category already has a budget for this month (only when adding a new one)
    if (!editingBudget) {
      const exists = storeBudgets.some(
        (b) => b.budgetCategory === formCategory && b.budgetMonth === monthStr && b.budgetYear === yearStr
      );
      if (exists) {
        Alert.alert(
          "Duplicate Budget",
          `A budget for "${formCategory}" in ${formMonth} already exists. You can edit the existing one instead.`
        );
        return;
      }

      if (!user?.id) {
        Alert.alert("Error", "User session not found.");
        return;
      }

      const success = await addBudget(user.id, formCategory, limitVal, monthStr, yearStr);
      if (success) {
        triggerNotification("Budget Saved!");
        setShowModal(false);
      } else {
        Alert.alert("Error", "Failed to save budget.");
      }
    } else {
      // Editing
      const success = await updateBudget(editingBudget.id, formCategory, limitVal, monthStr, yearStr);
      if (success) {
        triggerNotification("Budget Updated!");
        setShowModal(false);
      } else {
        Alert.alert("Error", "Failed to update budget.");
      }
    }
  };

  // Delete budget handler
  const handleDeleteBudget = (id) => {
    Alert.alert(
      "Delete Budget",
      "Are you sure you want to delete this budget category?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteBudget(id);
            if (success) {
              triggerNotification("Budget Deleted!");
            } else {
              Alert.alert("Error", "Failed to delete budget.");
            }
          },
        },
      ]
    );
  };

  // Helper function to pre-populate sample template budgets
  const loadDemoBudgets = async () => {
    if (!user?.id) return;
    const demos = [
      { category: "Food", limit: 8000, month: "Jul", year: "2026" },
      { category: "Groceries", limit: 6000, month: "Jul", year: "2026" },
      { category: "Rent", limit: 15000, month: "Jul", year: "2026" },
      { category: "Entertainment", limit: 4000, month: "Jul", year: "2026" },
    ];
    for (const d of demos) {
      await addBudget(user.id, d.category, d.limit, d.month, d.year);
    }
    triggerNotification("Sample Budgets Loaded!");
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />

        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header Title */}
            <View style={styles.header}>
              <CustomText style={[styles.headerTitle, { color: colors.text }]}>
                Budgets
              </CustomText>
              <CustomText style={[styles.headerSubtitle, { color: colors.secondary }]}>
                Plan your expenses and set limits
              </CustomText>
            </View>

            {/* Total Budget Stats Card */}
            <View
              style={[
                styles.statsCard,
                {
                  backgroundColor: "#41B3A2",
                  borderWidth: 0,
                  shadowColor: "#41B3A2",
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: 6,
                },
              ]}
            >
              <View style={styles.statsLeft}>
                <CustomText style={[styles.statsLabel, { color: "rgba(255, 255, 255, 0.85)" }]}>
                  TOTAL MONTHLY BUDGET
                </CustomText>
                <CustomText style={[styles.statsValue, { color: "#FFFFFF" }]}>
                  ₹{totalLimit.toLocaleString("en-IN")}
                </CustomText>

                <View style={styles.statsBreakdown}>
                  <View style={styles.breakdownItem}>
                    <View style={[styles.breakdownDot, { backgroundColor: "rgba(255, 255, 255, 0.6)" }]} />
                    <CustomText style={[styles.breakdownText, { color: "rgba(255, 255, 255, 0.85)" }]}>
                      Spent: <CustomText style={{ color: "#FFFFFF", fontWeight: "700" }}>₹{totalSpent.toLocaleString("en-IN")}</CustomText>
                    </CustomText>
                  </View>
                  <View style={styles.breakdownItem}>
                    <View style={[styles.breakdownDot, { backgroundColor: remaining >= 0 ? "rgba(255, 255, 255, 0.9)" : "#FF8A80" }]} />
                    <CustomText style={[styles.breakdownText, { color: "rgba(255, 255, 255, 0.85)" }]}>
                      {remaining >= 0 ? "Left: " : "Over: "}{" "}
                      <CustomText style={{ color: remaining >= 0 ? "#FFFFFF" : "#FF8A80", fontWeight: "700" }}>
                        ₹{Math.abs(remaining).toLocaleString("en-IN")}
                      </CustomText>
                    </CustomText>
                  </View>
                </View>
              </View>

              <View style={styles.statsRight}>
                <CustomCircularProgress
                  value={progressPercent}
                  radius={42}
                  strokeWidth={9}
                  activeStrokeColor="#FFFFFF"
                  inActiveStrokeColor="rgba(255, 255, 255, 0.24)"
                  progressValueColor="#FFFFFF"
                  valueSuffix="%"
                />
              </View>
            </View>

            {/* List Header */}
            <View style={styles.listHeaderRow}>
              <CustomText style={[styles.listTitle, { color: colors.text }]}>
                Category Limits
              </CustomText>
              {budgets.length > 0 && (
                <TouchableOpacity onPress={handleOpenAdd} activeOpacity={0.7} style={styles.addTextBtn}>
                  <Ionicons name="add-circle" size={18} color="#41B3A2" />
                  <CustomText style={styles.addTextBtnText}>Add Limit</CustomText>
                </TouchableOpacity>
              )}
            </View>

            {/* Budgets List */}
            {budgets.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderWidth: dark ? 0 : 1, borderColor: "#E5E7EB" }]}>
                <View style={[styles.emptyIconCircle, { backgroundColor: dark ? "rgba(65, 179, 162, 0.15)" : "rgba(65, 179, 162, 0.08)" }]}>
                  <MaterialCommunityIcons name="piggy-bank-outline" size={42} color="#41B3A2" />
                </View>
                <CustomText style={[styles.emptyTitle, { color: colors.text }]}>
                  No Budgets Configured
                </CustomText>
                <CustomText style={[styles.emptyDesc, { color: colors.secondary }]}>
                  Create budget limits for categories like Food, Rent, utilities etc. to prevent overspending.
                </CustomText>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleOpenAdd}
                  style={[styles.emptyBtn, { backgroundColor: "#41B3A2" }]}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <CustomText style={styles.emptyBtnText}>Create Budget</CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={loadDemoBudgets}
                  style={styles.demoBtn}
                >
                  <CustomText style={styles.demoBtnText}>Load Sample Budgets</CustomText>
                </TouchableOpacity>
              </View>
            ) : (
              budgets.map((item) => {
                const catInfo = CATEGORIES.find((c) => c.label === item.category) || {
                  icon: "ellipsis-h",
                  primary: "#8D6E63",
                  tint: "rgba(141, 110, 99, 0.12)",
                };

                const isOverBudget = item.spent > item.limit;
                const usageRatio = item.spent / item.limit;
                const isWarning = usageRatio >= 0.85 && !isOverBudget;
                const ratioPercent = Math.round(usageRatio * 100);

                let progressColor = catInfo.primary;
                let statusLabel = "On Track";
                let statusColor = "#10B981";
                let statusBg = "rgba(16, 185, 129, 0.1)";

                if (isOverBudget) {
                  progressColor = "#EF4444";
                  statusLabel = "Overspent";
                  statusColor = "#EF4444";
                  statusBg = "rgba(239, 68, 68, 0.1)";
                } else if (isWarning) {
                  progressColor = "#FFA726";
                  statusLabel = "Warning";
                  statusColor = "#FFA726";
                  statusBg = "rgba(255, 167, 38, 0.1)";
                }

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.budgetCard,
                      {
                        backgroundColor: colors.card,
                        borderWidth: dark ? 0 : 1,
                        borderColor: "#E5E7EB",
                      },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <View style={[styles.catIconContainer, { backgroundColor: catInfo.tint }]}>
                          <FontAwesome5 name={catInfo.icon} size={16} color={catInfo.primary} />
                        </View>
                        <View style={styles.cardTitleContainer}>
                          <CustomText style={[styles.cardTitle, { color: colors.text }]}>
                            {item.category}
                          </CustomText>
                          <CustomText style={[styles.cardMonth, { color: colors.secondary }]}>
                            {item.month}
                          </CustomText>
                        </View>
                      </View>

                      <View style={styles.cardHeaderRight}>
                        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                          <CustomText style={[styles.statusBadgeText, { color: statusColor }]}>
                            {statusLabel}
                          </CustomText>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleOpenEdit(item)}
                          style={styles.actionBtn}
                          activeOpacity={0.6}
                        >
                          <Feather name="edit-2" size={15} color={colors.secondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteBudget(item.id)}
                          style={[styles.actionBtn, styles.deleteBtnMargin]}
                          activeOpacity={0.6}
                        >
                          <Feather name="trash-2" size={15} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.cardProgressSection}>
                      <View style={styles.progressTextRow}>
                        <CustomText style={[styles.progressRatioText, { color: colors.secondary }]}>
                          ₹{item.spent.toLocaleString("en-IN")}{" "}
                          <CustomText style={{ fontSize: 11, fontWeight: "400" }}>
                            of ₹{item.limit.toLocaleString("en-IN")}
                          </CustomText>
                        </CustomText>
                        <CustomText style={[styles.progressPercentText, { color: progressColor }]}>
                          {ratioPercent}%
                        </CustomText>
                      </View>

                      {/* Progress bar line */}
                      <View style={[styles.progressBarBg, { backgroundColor: colors.inputBg }]}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              backgroundColor: progressColor,
                              width: `${Math.min(ratioPercent, 100)}%`,
                            },
                          ]}
                        />
                      </View>

                      {/* Bottom values */}
                      <View style={styles.cardFooter}>
                        {isOverBudget ? (
                          <CustomText style={[styles.cardFooterText, { color: "#EF4444" }]}>
                            Exceeded by ₹{(item.spent - item.limit).toLocaleString("en-IN")}
                          </CustomText>
                        ) : (
                          <CustomText style={[styles.cardFooterText, { color: colors.secondary }]}>
                            ₹{(item.limit - item.spent).toLocaleString("en-IN")} remaining
                          </CustomText>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}

            {/* Bottom spacer to prevent contents going behind tab bar */}
            <View style={{ height: 110 }} />
          </ScrollView>

          {/* Floating Add button */}
          <FloatingAddButton onPress={handleOpenAdd} />
        </SafeAreaView>

        {/* Custom Input Sheet Modal */}
        <Modal
          animationType="none"
          transparent={true}
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <BottomSheetModal
            visible={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveBudget}
            colors={colors}
            dark={dark}
            isEditing={!!editingBudget}
            formCategory={formCategory}
            setFormCategory={setFormCategory}
            formLimit={formLimit}
            setFormLimit={setFormLimit}
            formSpent={formSpent}
            setFormSpent={setFormSpent}
            formMonth={formMonth}
            setFormMonth={setFormMonth}
            submitting={submitting}
          />
        </Modal>

        {/* Global Notification Banner */}
        <Notification
          isVisible={notify !== null}
          text={notify || ""}
          bgColor="green.500"
        />
      </View>
    </Animated.View>
  );
}

// Sub-component: Elegant animated bottom sheet for adding and editing budgets
function BottomSheetModal({
  visible,
  onClose,
  onSave,
  colors,
  dark,
  isEditing,
  formCategory,
  setFormCategory,
  formLimit,
  setFormLimit,
  formSpent,
  setFormSpent,
  formMonth,
  setFormMonth,
  submitting,
}) {
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(SCREEN_HEIGHT * 0.5));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT * 0.5,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const selectedCategoryInfo = CATEGORIES.find((c) => c.label === formCategory) || CATEGORIES[0];

  return (
    <View style={styles.modalOverlay}>
      <Pressable style={styles.backdropPressable} onPress={handleClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </Pressable>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: colors.card,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Grab Handle */}
          <View
            style={[
              styles.grabHandle,
              { backgroundColor: dark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)" },
            ]}
          />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <CustomText style={[styles.sheetTitle, { color: colors.text }]}>
              {isEditing ? "Edit Budget Limit" : "New Budget Limit"}
            </CustomText>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetForm}>
            {/* Category Select Title */}
            <CustomText style={[styles.inputLabel, { color: colors.secondary }]}>
              SELECT CATEGORY
            </CustomText>

            {/* Horizontal Category Grid Selector */}
            <View style={styles.categoriesSelectorContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesSelectorScroll}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = formCategory === cat.label;
                  return (
                    <TouchableOpacity
                      key={cat.label}
                      activeOpacity={0.8}
                      onPress={() => setFormCategory(cat.label)}
                      style={[
                        styles.catSelectBtn,
                        {
                          backgroundColor: isSelected ? cat.primary : colors.inputBg,
                          borderColor: isSelected ? "transparent" : "rgba(250,250,250,0.02)",
                          borderWidth: 1.2,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.catSelectIconWrapper,
                          { backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : cat.tint },
                        ]}
                      >
                        <FontAwesome5
                          name={cat.icon}
                          size={14}
                          color={isSelected ? "#FFFFFF" : cat.primary}
                        />
                      </View>
                      <CustomText
                        style={[
                          styles.catSelectBtnText,
                          {
                            color: isSelected ? "#FFFFFF" : colors.text,
                            fontWeight: isSelected ? "700" : "500",
                          },
                        ]}
                      >
                        {cat.label}
                      </CustomText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Input Limit Amount */}
            <CustomText style={[styles.inputLabel, { color: colors.secondary }]}>
              BUDGET LIMIT AMOUNT (₹)
            </CustomText>
            <View style={[styles.inputFieldContainer, { backgroundColor: colors.inputBg }]}>
              <FontAwesome5 name="rupee-sign" size={16} color={colors.secondary} style={styles.inputFieldIcon} />
              <TextInput
                placeholder="e.g. 10000"
                placeholderTextColor={dark ? "#687076" : "#9BA1A6"}
                value={formLimit}
                onChangeText={setFormLimit}
                keyboardType="numeric"
                style={[styles.textInput, { color: colors.text }]}
              />
            </View>

            {/* Input Spent Amount (For Interactivity) */}
            {isEditing && (
              <View style={{ marginBottom: 14 }}>
                <CustomText style={[styles.inputLabel, { color: colors.secondary }]}>
                  CURRENT SPENT AMOUNT
                </CustomText>
                <View style={[styles.inputFieldContainer, { backgroundColor: colors.inputBg, opacity: 0.7 }]}>
                  <FontAwesome5 name="wallet" size={15} color={colors.secondary} style={styles.inputFieldIcon} />
                  <CustomText style={{ color: colors.text, fontSize: 15, paddingVertical: 14 }}>
                    ₹{Number(formSpent).toLocaleString("en-IN")}
                  </CustomText>
                </View>
              </View>
            )}

            {/* Month Picker Selection */}
            <CustomText style={[styles.inputLabel, { color: colors.secondary }]}>
              BUDGET PERIOD
            </CustomText>
            <View style={styles.categoriesSelectorContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesSelectorScroll}
              >
                {MONTHS.map((m) => {
                  const isSelected = formMonth === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      activeOpacity={0.8}
                      onPress={submitting ? null : () => setFormMonth(m)}
                      style={[
                        styles.monthSelectBtn,
                        {
                          backgroundColor: isSelected ? "#41B3A2" : colors.inputBg,
                        },
                      ]}
                      disabled={submitting}
                    >
                      <CustomText
                        style={[
                          styles.monthSelectBtnText,
                          {
                            color: isSelected ? "#FFFFFF" : colors.text,
                            fontWeight: isSelected ? "700" : "500",
                          },
                        ]}
                      >
                        {m}
                      </CustomText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Save Buttons */}
            <TouchableOpacity
              onPress={submitting ? null : onSave}
              activeOpacity={0.85}
              style={[styles.saveBtn, { backgroundColor: "#41B3A2" }, submitting && { opacity: 0.6 }]}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <CustomText style={styles.saveBtnText}>
                  {isEditing ? "Save Changes" : "Create Budget"}
                </CustomText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={submitting ? null : handleClose}
              activeOpacity={0.8}
              style={[styles.cancelBtn, { borderColor: dark ? "rgba(255,255,255,0.12)" : "#E5E7EB" }, submitting && { opacity: 0.6 }]}
              disabled={submitting}
            >
              <CustomText style={[styles.cancelBtnText, { color: colors.text }]}>
                Cancel
              </CustomText>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Poppins_Bold",
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_Medium",
    marginTop: 2,
  },
  statsCard: {
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statsLeft: {
    flex: 1,
    paddingRight: 10,
  },
  statsLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    fontFamily: "Poppins_Bold",
  },
  statsValue: {
    fontSize: 26,
    fontFamily: "Poppins_Bold",
    marginTop: 4,
  },
  statsBreakdown: {
    flexDirection: "column",
    marginTop: 10,
    gap: 4,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  breakdownText: {
    fontSize: 11,
    fontFamily: "Poppins_Medium",
  },
  statsRight: {
    alignItems: "center",
    justifyContent: "center",
  },
  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  listTitle: {
    fontSize: 18,
    fontFamily: "Poppins_Bold",
  },
  addTextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addTextBtnText: {
    color: "#41B3A2",
    fontSize: 13,
    fontFamily: "Poppins_Bold",
  },
  emptyContainer: {
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Poppins_Bold",
    textAlign: "center",
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    fontFamily: "Poppins_Medium",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: "#41B3A2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins_Bold",
  },
  demoBtn: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  demoBtnText: {
    color: "#41B3A2",
    fontSize: 12,
    fontFamily: "Poppins_Bold",
    textDecorationLine: "underline",
  },
  budgetCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  catIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Poppins_Bold",
  },
  cardMonth: {
    fontSize: 10,
    fontFamily: "Poppins_Medium",
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  statusBadgeText: {
    fontSize: 9,
    fontFamily: "Poppins_Bold",
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  deleteBtnMargin: {
    marginLeft: 4,
  },
  cardProgressSection: {
    marginTop: 2,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 6,
  },
  progressRatioText: {
    fontSize: 13,
    fontFamily: "Poppins_Bold",
  },
  progressPercentText: {
    fontSize: 12,
    fontFamily: "Poppins_Bold",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: "100%",
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  cardFooterText: {
    fontSize: 11,
    fontFamily: "Poppins_Medium",
    fontWeight: "500",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  backdropPressable: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  keyboardAvoid: {
    justifyContent: "flex-end",
  },
  bottomSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  grabHandle: {
    width: 38,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 10,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingVertical: 4,
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: "Poppins_Bold",
  },
  closeBtn: {
    padding: 4,
  },
  sheetForm: {
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: "Poppins_Bold",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 14,
  },
  categoriesSelectorContainer: {
    marginHorizontal: -20,
    marginBottom: 10,
  },
  categoriesSelectorScroll: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    gap: 8,
  },
  catSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
  },
  catSelectIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  catSelectBtnText: {
    fontSize: 12,
    fontFamily: "Poppins_Medium",
  },
  monthSelectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  monthSelectBtnText: {
    fontSize: 12,
    fontFamily: "Poppins_Medium",
  },
  inputFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 6,
  },
  inputFieldIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_Medium",
    height: "100%",
  },
  saveBtn: {
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#41B3A2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Poppins_Bold",
  },
  cancelBtn: {
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1.2,
    backgroundColor: "transparent",
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: "Poppins_Bold",
  },
});
