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
import * as ImagePicker from 'expo-image-picker';
import { supabase } from "../../lib/supabase";
import ReceiptDetailsModal from "./ReceiptDetailsModal";

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
  const [slideAnim] = useState(() => new Animated.Value(SCREEN_HEIGHT));

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
        toValue: SCREEN_HEIGHT,
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
  const [addExpenseModals, setAddExpenseModals] = useState(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);


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
  const [slideAnim] = useState(() => new Animated.Value(SCREEN_HEIGHT));

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



  const animateClose = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 180,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (typeof callback === "function") callback();
    });
  };

  // Main close function (incorporating parent's discard prompt)
  const handleClose = () => {
    const hasInputs = amount !== "" || expense.expense_name !== "" || expense.category !== "" || expense.payment_mode !== "";

    if (hasInputs && handleInputs) {
      handleInputs();
    } else {
      animateClose(() => {
        setShowModal(null);
      });
    }
  };

  // Main save function
  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Missing Amount", "Please enter a valid amount");
      return;
    }
    if (!expense.expense_name) {
      Alert.alert("Missing Title", "Please enter an expense name");
      return;
    }
    if (!expense.category) {
      Alert.alert("Missing Category", "Please select a category");
      return;
    }
    if (!expense.payment_mode) {
      if (accounts && accounts.length > 0) {
        handleExpenseChange("payment_mode", accounts[0].name);
      } else {
        Alert.alert("Missing Payment Mode", "Please select a payment mode/account");
        return;
      }
    }

    // Button tactile feedback animation
    Animated.sequence([
      Animated.timing(saveBtnScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(saveBtnScale, { toValue: 1, duration: 80, useNativeDriver: true })
    ]).start();

    const success = await handleSaveExpense();
    if (success) {
      animateClose(() => {
        setShowModal(null);
      });
    }
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

  const pickReceipt = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the media library is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setScanning(true);
      try {
        const asset = result.assets[0];
        const { data, error } = await supabase.functions.invoke("scan-receipt", {
          body: {
            image: asset.base64,
            mimeType: asset.mimeType,
          },
        });

        if (error) {
          console.error("Function Error:", error);
          Alert.alert("Extraction Error", "Failed to extract details from receipt.");
        } else if (data?.receipt) {
          console.log("Extracted Receipt Data:", JSON.stringify(data, null, 2));
          setScannedData({
            ...data.receipt,
            imageUri: asset.uri,
          });
          setAddExpenseModals("scannedDetails");
        } else {
          Alert.alert("Extraction Error", "No details could be extracted from the receipt.");
        }
      } catch (err) {
        console.error("Failed to invoke scan-receipt:", err);
        Alert.alert("Connection Error", "Could not reach the scan service.");
      } finally {
        setScanning(false);
      }
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the camera is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setScanning(true);
      try {
        const asset = result.assets[0];
        const { data, error } = await supabase.functions.invoke("scan-receipt", {
          body: {
            image: asset.base64,
            mimeType: asset.mimeType,
          },
        });

        if (error) {
          console.error("Function Error:", error);
          Alert.alert("Extraction Error", "Failed to extract details from receipt.");
        } else if (data?.receipt) {
          console.log("Extracted Receipt Data:", JSON.stringify(data, null, 2));
          setScannedData({
            ...data.receipt,
            imageUri: asset.uri,
          });
          setAddExpenseModals("scannedDetails");
        } else {
          Alert.alert("Extraction Error", "No details could be extracted from the receipt.");
        }
      } catch (err) {
        console.error("Failed to invoke scan-receipt:", err);
        Alert.alert("Connection Error", "Could not reach the scan service.");
      } finally {
        setScanning(false);
      }
    }
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


          {/* Receipt Auto-fill Banner with Options */}
          <View style={[styles.scanBanner, { backgroundColor: colors.expenseInput, borderColor: "#57A6A1" }]}>
            {scanning ? (
              <View style={styles.scanningLoader}>
                <ActivityIndicator size="small" color="#57A6A1" style={{ marginRight: 10 }} />
                <CustomText style={[styles.scanningText, { color: colors.text }]}>
                  Extracting receipt details...
                </CustomText>
              </View>
            ) : (
              <>
                <View style={styles.scanBannerHeader}>
                  <Ionicons name="scan" size={20} color="#57A6A1" style={{ marginRight: 8 }} />
                  <CustomText style={[styles.scanTitle, { color: colors.text }]}>
                    Scan Receipt to Auto-Fill
                  </CustomText>
                </View>
                <CustomText style={[styles.scanSubtitle, { color: colors.text + '80', marginBottom: 12 }]}>
                  We'll automatically extract amount, title & category from your bill.
                </CustomText>

                <View style={styles.scanButtonsRow}>
                  <Pressable
                    onPress={takePhoto}
                    style={({ pressed }) => [
                      styles.scanOptionButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.inputBg,
                        opacity: pressed ? 0.85 : 1,
                      }
                    ]}
                  >
                    <Ionicons name="camera-outline" size={18} color="#57A6A1" style={{ marginRight: 6 }} />
                    <CustomText style={[styles.scanOptionText, { color: colors.text }]}>
                      Take Photo
                    </CustomText>
                  </Pressable>

                  <Pressable
                    onPress={pickReceipt}
                    style={({ pressed }) => [
                      styles.scanOptionButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.inputBg,
                        opacity: pressed ? 0.85 : 1,
                      }
                    ]}
                  >
                    <Ionicons name="images-outline" size={18} color="#57A6A1" style={{ marginRight: 6 }} />
                    <CustomText style={[styles.scanOptionText, { color: colors.text }]}>
                      From Library
                    </CustomText>
                  </Pressable>
                </View>
              </>
            )}
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

          {/* Attached Receipt Items Banner */}
          {expense.items && expense.items.length > 0 && (
            <View
              style={{
                backgroundColor: "rgba(87, 166, 161, 0.12)",
                borderRadius: 18,
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(87, 166, 161, 0.3)",
                marginBottom: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Ionicons name="receipt-outline" size={20} color="#57A6A1" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <CustomText style={{ fontSize: 13, fontFamily: "Poppins_Bold", color: "#57A6A1" }}>
                    {expense.items.length} Receipt Line Items Attached
                  </CustomText>
                  <CustomText style={{ fontSize: 11, fontFamily: "Poppins_Medium", color: colors.text, opacity: 0.8 }} numberOfLines={1}>
                    {expense.items.map((i) => i.name).join(", ")}
                  </CustomText>
                </View>
              </View>
              <Pressable
                onPress={() => setAddExpenseModals("scannedDetails")}
                style={{
                  backgroundColor: "#57A6A1",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  marginLeft: 8,
                }}
              >
                <CustomText style={{ color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_SemiBold" }}>
                  View
                </CustomText>
              </Pressable>
            </View>
          )}



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

      {/* Nested Scanned Receipt Details Modal */}
      <ReceiptDetailsModal
        visible={addExpenseModals === "scannedDetails"}
        onClose={() => setAddExpenseModals(null)}
        scannedData={scannedData}
        onApply={(extracted) => {
          if (extracted.amount > 0) {
            setAmount(String(extracted.amount));
            handleExpenseChange("amount", extracted.amount);
          }
          if (extracted.merchant) {
            handleExpenseChange("expense_name", extracted.merchant);
          }
          if (extracted.category) {
            handleExpenseChange("category", extracted.category);
          }
          if (extracted.items && extracted.items.length > 0) {
            handleExpenseChange("items", extracted.items);
          } else {
            handleExpenseChange("items", []);
          }
          if (!expense.payment_mode && accounts && accounts.length > 0) {
            handleExpenseChange("payment_mode", accounts[0].name);
            setSelectedPaymentMode(
              accounts[0].type === "Bank"
                ? "bank"
                : accounts[0].type === "Cash"
                  ? "money"
                  : accounts[0].type === "Credit Card"
                    ? "credit-card"
                    : "globe"
            );
          }
          setAddExpenseModals(null);
        }}
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
  },
  scanBanner: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  scanBannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  scanTitle: {
    fontSize: 15,
    fontFamily: "Poppins_Bold",
  },
  scanSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins_Medium",
  },
  scanButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  scanOptionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  scanOptionText: {
    fontSize: 13,
    fontFamily: "Poppins_SemiBold",
  },
  scanningLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  scanningText: {
    fontSize: 14,
    fontFamily: "Poppins_SemiBold",
  }
});

export default AddExpenseModal;
