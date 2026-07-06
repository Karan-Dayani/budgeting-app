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
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "expo-router/react-navigation";
import CustomText from "../CustomText";
import { useBudgetStore } from "../globalState/budgetStore";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

// Custom category themes (matching CategoryPicker.jsx)
const categoryThemes = {
  "Food": { primary: "#FF7043", tint: "rgba(255, 112, 67, 0.12)" },
  "Clothing": { primary: "#AB47BC", tint: "rgba(171, 71, 188, 0.12)" },
  "Entertainment": { primary: "#29B6F6", tint: "rgba(41, 182, 246, 0.12)" },
  "Groceries": { primary: "#66BB6A", tint: "rgba(102, 187, 106, 0.12)" },
  "Utilities": { primary: "#FFA726", tint: "rgba(255, 167, 38, 0.12)" },
  "Travel": { primary: "#26A69A", tint: "rgba(38, 166, 154, 0.12)" },
  "Rent": { primary: "#EC407A", tint: "rgba(236, 64, 122, 0.12)" },
  "Education": { primary: "#5C6BC0", tint: "rgba(92, 107, 192, 0.12)" },
  "Other": { primary: "#8D6E63", tint: "rgba(141, 110, 99, 0.12)" },
};

// Payment mode themes
const paymentThemes = {
  "Cash": { primary: "#66BB6A", tint: "rgba(102, 187, 106, 0.12)", icon: "cash-outline" },
  "Online": { primary: "#29B6F6", tint: "rgba(41, 182, 246, 0.12)", icon: "globe-outline" },
  "Card": { primary: "#AB47BC", tint: "rgba(171, 71, 188, 0.12)", icon: "card-outline" },
};

// Category Grid Item Component
const CategoryGridItem = ({ item, isSelected, colors, onPress }) => {
  const [scale] = useState(() => new Animated.Value(1));
  const themeInfo = categoryThemes[item.label] || { primary: "#41B3A2", tint: "rgba(65, 179, 162, 0.12)" };

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={styles.gridItemWrapper}
    >
      <Animated.View
        style={[
          styles.gridItem,
          {
            backgroundColor: isSelected ? themeInfo.primary : colors.inputBg,
            transform: [{ scale }]
          }
        ]}
      >
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isSelected
                ? "rgba(255, 255, 255, 0.22)"
                : themeInfo.tint,
            }
          ]}
        >
          <FontAwesome5
            name={item.icon}
            size={18}
            color={isSelected ? "#FFFFFF" : themeInfo.primary}
          />
        </View>
        <CustomText
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.gridItemText,
            {
              color: isSelected ? "#FFFFFF" : colors.text,
              fontWeight: isSelected ? "700" : "500",
              fontFamily: isSelected ? "Poppins_Bold" : "Poppins_Medium",
            }
          ]}
        >
          {item.label}
        </CustomText>
        {isSelected && (
          <View style={styles.checkmarkBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

// Payment Mode Grid Item Component
const PaymentModeGridItem = ({ item, isSelected, colors, onPress, itemCount }) => {
  const [scale] = useState(() => new Animated.Value(1));
  const themeInfo = paymentThemes[item.label] || { primary: "#41B3A2", tint: "rgba(65, 179, 162, 0.12)" };

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  const wrapperWidth = itemCount <= 2 ? "48%" : "31%";

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[styles.gridItemWrapper, { width: wrapperWidth }]}
    >
      <Animated.View
        style={[
          styles.gridItem,
          {
            backgroundColor: isSelected ? themeInfo.primary : colors.inputBg,
            transform: [{ scale }]
          }
        ]}
      >
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isSelected
                ? "rgba(255, 255, 255, 0.22)"
                : themeInfo.tint,
            }
          ]}
        >
          <FontAwesome
            name={item.icon}
            size={20}
            color={isSelected ? "#FFFFFF" : themeInfo.primary}
          />
        </View>
        <CustomText
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.gridItemText,
            {
              color: isSelected ? "#FFFFFF" : colors.text,
              fontWeight: isSelected ? "700" : "500",
              fontFamily: isSelected ? "Poppins_Bold" : "Poppins_Medium",
            }
          ]}
        >
          {item.label}
        </CustomText>
        {isSelected && (
          <View style={styles.checkmarkBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

// Nested Picker modal helper
const ThemedPickerModal = ({ visible, title, onClose, children, colors, dark }) => {
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(SCREEN_HEIGHT * 0.5));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const handleClose = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT * 0.5,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (typeof callback === 'function') {
        callback();
      }
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={() => handleClose()}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdropPressable} onPress={() => handleClose()}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </Pressable>
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: colors.expenseForm || colors.card,
              borderColor: colors.background + '15',
              borderTopWidth: 1,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View
            style={[
              styles.grabHandle,
              {
                backgroundColor: dark
                  ? "rgba(255, 255, 255, 0.15)"
                  : "rgba(0, 0, 0, 0.15)",
              }
            ]}
          />
          <View style={styles.header}>
            <CustomText
              style={[styles.headerTitle, { color: colors.text, fontFamily: "Poppins_Bold" }]}
            >
              {title}
            </CustomText>
            <Pressable
              onPress={() => handleClose()}
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && { opacity: 0.7 }
              ]}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>
          {children(handleClose)}
        </Animated.View>
      </View>
    </Modal>
  );
};

const AddExpenseModal = ({
  expense,
  handleExpenseChange,
  handleSaveExpense,
  setShowModal,
  handleInputs,
  colors: propColors,
  accounts
}) => {
  // Resolve theme colors directly
  const { colors, dark } = useTheme();
  const { submitting } = useBudgetStore();

  // const PaymentModeData = [
  //   { label: "Cash", value: "Cash", icon: "cash-outline" },
  //   { label: "Online", value: "Online", icon: "globe-outline" },
  //   { label: "Card", value: "Card", icon: "card-outline" },
  // ];

  const PaymentModeData = accounts.map((acc) => {
    return {
      label: acc.name,
      value: acc.name,
      icon:
        acc.type === "Bank"
          ? "bank"
          : acc.type === "Cash"
          ? "money"
          : acc.type === "Credit Card"
          ? "credit-card"
          : "globe",
    };
  });


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

  // Initialize local amount state
  const [amount, setAmount] = useState(expense.amount > 0 ? String(expense.amount) : "");
  const [formType, setFormType] = useState(expense.expense_type || "Non-Recurring");
  const [addExpenseModals, setAddExpenseModals] = useState(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);

  // Find the selected account object from props
  const selectedAccount = accounts.find((acc) => acc.name === expense.payment_mode);

  // Sync amount when editing/re-opening
  useEffect(() => {
    setAmount(expense.amount > 0 ? String(expense.amount) : "");
  }, [expense.amount]);

  // Sync payment mode icon
  useEffect(() => {
    if (expense.payment_mode) {
      const mode = PaymentModeData.find(item => item.value === expense.payment_mode);
      if (mode) {
        setSelectedPaymentMode(mode.icon);
      }
    } else {
      setSelectedPaymentMode(null);
    }
  }, [expense.payment_mode]);

  // Main sheet animation values
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(SCREEN_HEIGHT * 0.7));

  // Segmented control animation values
  const containerWidth = SCREEN_WIDTH - 40; // bottomSheet paddingHorizontal is 20
  const tabWidth = containerWidth / 2;
  const tabSlideAnim = useRef(new Animated.Value(0)).current;

  // Save button animation scale
  const saveBtnScale = useRef(new Animated.Value(1)).current;

  // Entry animations
  useEffect(() => {
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
      })
    ]).start();
  }, []);

  // Sliding tab animation
  useEffect(() => {
    Animated.spring(tabSlideAnim, {
      toValue: formType === "Recurring" ? tabWidth : 0,
      tension: 100,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [formType]);

  // Main close function (incorporating parent's discard prompt)
  const handleClose = () => {
    const hasInputs = amount !== "" || expense.expense_name !== "" || expense.category !== "" || expense.payment_mode !== "";

    if (hasInputs && handleInputs) {
      handleInputs();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT * 0.7,
          duration: 180,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowModal(null);
      });
    }
  };

  // Main save function (incorporating exit animation snippet)
  const handleSave = () => {
    if (!amount || !expense.expense_name) {
      Alert.alert("Error", "Please enter an amount and title");
      return;
    }

    // Snappy tactile response
    Animated.sequence([
      Animated.timing(saveBtnScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(saveBtnScale, { toValue: 1, duration: 80, useNativeDriver: true })
    ]).start(() => {
      // Slide down sheet first
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT * 0.7,
          duration: 180,
          useNativeDriver: true,
        })
      ]).start(() => {
        handleSaveExpense();
      });
    });
  };

  const handleCategorySelect = (categoryVal, modalClose) => {
    modalClose(() => {
      handleExpenseChange("category", categoryVal);
    });
  };

  const handlePaymentModeSelect = (mode, modalClose) => {
    modalClose(() => {
      setSelectedPaymentMode(mode.icon);
      handleExpenseChange("payment_mode", mode.value);
    });
  };

  return (
    <View style={styles.modalOverlay}>
      {/* Full screen backdrop */}
      <Pressable style={styles.backdropPressable} onPress={handleClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </Pressable>

      {/* Bottom Sheet Container */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            backgroundColor: colors.expenseForm || colors.card,
            borderColor: colors.background + '15',
            borderTopWidth: 1,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        {/* Visual Grab Handle */}
        <View
          style={[
            styles.grabHandle,
            {
              backgroundColor: dark
                ? "rgba(255, 255, 255, 0.15)"
                : "rgba(0, 0, 0, 0.15)",
            }
          ]}
        />

        {/* Header Row */}
        <View style={styles.header}>
          <CustomText
            style={[styles.headerTitle, { color: colors.text, fontFamily: "Poppins_Bold" }]}
          >
            Add Expense
          </CustomText>
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && { opacity: 0.7 }
            ]}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Segmented Control Selector */}
          <View style={[styles.segmentedContainer, { backgroundColor: colors.expenseInput, borderColor: colors.inputBg }]}>
            <Animated.View
              style={[
                styles.segmentedPill,
                {
                  width: tabWidth - 4,
                  transform: [{ translateX: tabSlideAnim }],
                }
              ]}
            />
            <Pressable
              style={styles.segmentedTab}
              onPress={() => {
                setFormType("Non-Recurring");
                handleExpenseChange("expense_type", "Non-Recurring");
              }}
            >
              <CustomText
                style={[
                  styles.segmentedText,
                  {
                    color: formType === "Non-Recurring" ? "#FFFFFF" : colors.text + '80',
                  }
                ]}
              >
                Non-Recurring
              </CustomText>
            </Pressable>
            <Pressable
              style={styles.segmentedTab}
              onPress={() => {
                setFormType("Recurring");
                handleExpenseChange("expense_type", "Recurring");
                handleExpenseChange("times", 1);
              }}
            >
              <CustomText
                style={[
                  styles.segmentedText,
                  {
                    color: formType === "Recurring" ? "#FFFFFF" : colors.text + '80',
                  }
                ]}
              >
                Recurring
              </CustomText>
            </Pressable>
          </View>

          {/* Amount & Mode row */}
          <View style={styles.row}>
            {/* Amount input */}
            <View style={styles.amountField}>
              <CustomText style={[styles.fieldLabel, { color: colors.text }]}>
                Amount
              </CustomText>
              <View style={[styles.inputContainer, { backgroundColor: colors.expenseInput, borderColor: colors.inputBg }]}>
                <CustomText style={[styles.currencySymbol, { color: colors.text }]}>
                  ₹
                </CustomText>
                <TextInput
                  value={amount}
                  onChangeText={(text) => {
                    const cleanText = text.replace(/[^0-9.]/g, "");
                    setAmount(cleanText);
                    handleExpenseChange("amount", parseFloat(cleanText) || 0);
                  }}
                  placeholder="0"
                  placeholderTextColor={colors.text + '55'}
                  keyboardType="decimal-pad"
                  style={[styles.amountInput, { color: colors.text }]}
                />
              </View>
            </View>

            {/* Mode selector button */}
            <View style={styles.modeField}>
              <CustomText style={[styles.fieldLabel, { color: colors.text }]}>
                Mode
              </CustomText>
              <Pressable
                onPress={() => setAddExpenseModals("paymentMode")}
                style={[styles.modeButton, { backgroundColor: colors.expenseInput, borderColor: colors.inputBg }]}
              >
                {selectedPaymentMode ? (
                  <FontAwesome name={selectedPaymentMode} size={24} color={colors.text} />
                ) : (
                  <FontAwesome name="rupee" size={22} color={colors.text} />
                )}
              </Pressable>
            </View>
          </View>

          {/* Expense Title */}
          <View style={styles.fieldWrapper}>
            <CustomText style={[styles.fieldLabel, { color: colors.text }]}>
              Title
            </CustomText>
            <View style={[styles.inputContainer, { backgroundColor: colors.expenseInput, borderColor: colors.inputBg }]}>
              <TextInput
                placeholder="Enter expense name"
                value={expense.expense_name}
                onChangeText={(text) => handleExpenseChange("expense_name", text)}
                placeholderTextColor={colors.text + '55'}
                style={[styles.titleInput, { color: colors.text }]}
              />
            </View>
          </View>

          {/* Expense Category */}
          <View style={styles.fieldWrapper}>
            <CustomText style={[styles.fieldLabel, { color: colors.text }]}>
              Category
            </CustomText>
            <Pressable
              onPress={() => setAddExpenseModals("category")}
              style={[styles.selectButton, { backgroundColor: colors.expenseInput, borderColor: colors.inputBg }]}
            >
              <CustomText
                style={[
                  styles.selectButtonText,
                  { color: expense.category ? colors.text : colors.text + '55' }
                ]}
              >
                {expense.category || "Select Category"}
              </CustomText>
              <Ionicons name="chevron-down" size={18} color={colors.text + '80'} />
            </Pressable>
          </View>

          {/* Overdraft / Low Balance Warnings */}
          {selectedAccount && (
            (() => {
              const parsedAmt = parseFloat(amount) || 0;
              const willGoNegative = parsedAmt > selectedAccount.balance;
              const willGoLow = (selectedAccount.balance - parsedAmt) < 1000;

              if (willGoNegative) {
                return (
                  <View
                    style={{
                      backgroundColor: "rgba(239, 83, 80, 0.1)",
                      borderRadius: 16,
                      padding: 12,
                      borderWidth: 1.2,
                      borderColor: "rgba(239, 83, 80, 0.3)",
                      marginBottom: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <Ionicons name="warning" size={20} color="#EF5350" style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <CustomText style={{ fontSize: 13, fontFamily: "Poppins_Bold", color: "#EF5350" }}>
                        OVERDRAFT WARNING
                      </CustomText>
                      <CustomText style={{ fontSize: 11, fontFamily: "Poppins_Medium", color: colors.text, marginTop: 2, opacity: 0.85 }}>
                        This transaction exceeds the current balance of {selectedAccount.name} (₹{selectedAccount.balance.toLocaleString("en-IN")}) by ₹{(parsedAmt - selectedAccount.balance).toLocaleString("en-IN")}. The balance will go negative.
                      </CustomText>
                    </View>
                  </View>
                );
              }

              if (willGoLow) {
                return (
                  <View
                    style={{
                      backgroundColor: "rgba(255, 179, 0, 0.1)",
                      borderRadius: 16,
                      padding: 12,
                      borderWidth: 1.2,
                      borderColor: "rgba(255, 179, 0, 0.3)",
                      marginBottom: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <Ionicons name="information-circle" size={20} color="#FFB300" style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <CustomText style={{ fontSize: 13, fontFamily: "Poppins_Bold", color: "#FB8C00" }}>
                        LOW BALANCE WARNING
                      </CustomText>
                      <CustomText style={{ fontSize: 11, fontFamily: "Poppins_Medium", color: colors.text, marginTop: 2, opacity: 0.85 }}>
                        This transaction will leave {selectedAccount.name} with a low balance of ₹{(selectedAccount.balance - parsedAmt).toLocaleString("en-IN")}.
                      </CustomText>
                    </View>
                  </View>
                );
              }

              return null;
            })()
          )}

          {/* Save Button */}
          <Animated.View style={{ transform: [{ scale: saveBtnScale }] }}>
            <Pressable
              onPress={submitting ? null : handleSave}
              style={[styles.saveButton, { backgroundColor: "#57A6A1", opacity: submitting ? 0.75 : 1 }]}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <CustomText style={styles.saveButtonText}>
                  Save Expense
                </CustomText>
              )}
            </Pressable>
          </Animated.View>
        </ScrollView>
      </Animated.View>

      {/* Nested Themed Category Picker Modal */}
      <CategoryPickerModal
        visible={addExpenseModals === "category"}
        onClose={() => setAddExpenseModals(null)}
        onSelect={(categoryVal, modalClose) => handleCategorySelect(categoryVal, modalClose)}
        selectedValue={expense.category}
        colors={colors}
        dark={dark}
      />

      {/* Nested Themed Payment Mode Picker Modal */}
      <PaymentModePickerModal
        visible={addExpenseModals === "paymentMode"}
        onClose={() => setAddExpenseModals(null)}
        onSelect={(mode, modalClose) => handlePaymentModeSelect(mode, modalClose)}
        selectedValue={expense.payment_mode}
        colors={colors}
        dark={dark}
        accounts={accounts}
      />
    </View>
  );
};

// Category Picker Bottom Sheet Wrapper
const CategoryPickerModal = ({ visible, onClose, onSelect, selectedValue, colors, dark }) => {
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

  return (
    <ThemedPickerModal
      visible={visible}
      title="Select Category"
      onClose={onClose}
      colors={colors}
      dark={dark}
    >
      {(modalClose) => (
        <View style={styles.gridContainer}>
          {CategoryData.map((item, i) => (
            <CategoryGridItem
              key={i}
              item={item}
              isSelected={selectedValue === item.value}
              colors={colors}
              onPress={() => onSelect(item.value, modalClose)}
            />
          ))}
        </View>
      )}
    </ThemedPickerModal>
  );
};

// Payment Mode Picker Bottom Sheet Wrapper
const PaymentModePickerModal = ({ visible, onClose, onSelect, selectedValue, colors, dark, accounts }) => {
  // const PaymentModeData = [
  //   { label: "Cash", value: "Cash", icon: "cash-outline" },
  //   { label: "Online", value: "Online", icon: "globe-outline" },
  //   { label: "Card", value: "Card", icon: "card-outline" },
  // ];

  const PaymentModeData = accounts.map((acc) => {
    return {
      label: acc.name,
      value: acc.name,
      icon:
        acc.type === "Bank"
          ? "bank"
          : acc.type === "Cash"
          ? "money"
          : acc.type === "Credit Card"
          ? "credit-card"
          : "globe",
    };
  });

  return (
    <ThemedPickerModal
      visible={visible}
      title="Select Mode"
      onClose={onClose}
      colors={colors}
      dark={dark}
    >
      {(modalClose) => (
        <View style={styles.gridContainer}>
          {PaymentModeData.map((item, i) => (
            <PaymentModeGridItem
              key={i}
              item={item}
              isSelected={selectedValue === item.value}
              colors={colors}
              onPress={() => onSelect(item, modalClose)}
              itemCount={PaymentModeData.length}
            />
          ))}
        </View>
      )}
    </ThemedPickerModal>
  );
};

const styles = StyleSheet.create({
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
  bottomSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 24,
  },
  grabHandle: {
    width: 38,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  segmentedContainer: {
    flexDirection: "row",
    borderRadius: 24,
    padding: 4,
    position: "relative",
    height: 52,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
  },
  segmentedPill: {
    position: "absolute",
    top: 4,
    left: 4,
    height: 42,
    borderRadius: 20,
    backgroundColor: "#57A6A1",
  },
  segmentedTab: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  segmentedText: {
    fontSize: 15,
    fontFamily: "Poppins_SemiBold",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  amountField: {
    flex: 1,
  },
  modeField: {
    width: 80,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Poppins_SemiBold",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 56,
  },
  currencySymbol: {
    fontSize: 20,
    fontFamily: "Poppins_SemiBold",
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Poppins_SemiBold",
    height: "100%",
    padding: 0,
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins_Medium",
    height: "100%",
    padding: 0,
  },
  modeButton: {
    borderWidth: 1,
    borderRadius: 20,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 56,
  },
  selectButtonText: {
    fontSize: 16,
    fontFamily: "Poppins_Medium",
  },
  saveButton: {
    borderRadius: 20,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    shadowColor: "#57A6A1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_Bold",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  gridItemWrapper: {
    width: "31%",
    marginVertical: 6,
  },
  gridItem: {
    width: "100%",
    aspectRatio: 0.95,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  gridItemText: {
    fontSize: 13,
    textAlign: "center",
  },
  checkmarkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
  }
});

export default AddExpenseModal;
