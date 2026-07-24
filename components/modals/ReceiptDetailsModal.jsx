import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";
import CustomText from "../CustomText";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const mapExtractedCategory = (catStr) => {
  if (!catStr) return "Other";
  const cat = String(catStr).toLowerCase();
  if (cat.includes("food") || cat.includes("drink") || cat.includes("restaurant") || cat.includes("cafe") || cat.includes("coffee")) return "Food";
  if (cat.includes("grocer") || cat.includes("supermarket")) return "Groceries";
  if (cat.includes("cloth") || cat.includes("apparel") || cat.includes("fashion") || cat.includes("shop")) return "Clothing";
  if (cat.includes("entertain") || cat.includes("movie") || cat.includes("game")) return "Entertainment";
  if (cat.includes("bill") || cat.includes("utilit") || cat.includes("electric") || cat.includes("water") || cat.includes("gas")) return "Utilities";
  if (cat.includes("travel") || cat.includes("transport") || cat.includes("flight") || cat.includes("cab") || cat.includes("taxi")) return "Travel";
  if (cat.includes("rent") || cat.includes("housing")) return "Rent";
  if (cat.includes("educat") || cat.includes("book") || cat.includes("school")) return "Education";
  return "Other";
};

const ReceiptDetailsModal = ({
  visible,
  onClose,
  scannedData,
  onApply,
}) => {
  const { colors, dark } = useTheme();

  // Local state for editable merchant, amount, category, etc.
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [date, setDate] = useState("");
  const [items, setItems] = useState([]);
  const [imageUri, setImageUri] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (scannedData) {
      setMerchant(scannedData.merchant || "");
      setAmount(scannedData.amount ? String(scannedData.amount) : "");
      setCategory(mapExtractedCategory(scannedData.category));
      setDate(scannedData.date || "");
      setItems(Array.isArray(scannedData.items) ? scannedData.items : []);
      setImageUri(scannedData.imageUri || null);
    }
  }, [scannedData]);

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

  const handleCloseModal = (callback) => {
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
      }),
    ]).start(() => {
      if (typeof callback === "function") callback();
      onClose();
    });
  };

  const handleDeleteItem = (indexToDelete) => {
    const updated = items.filter((_, idx) => idx !== indexToDelete);
    setItems(updated);
    const newTotal = updated.reduce((sum, item) => sum + Number(item.price ?? item.amount ?? 0), 0);
    if (newTotal > 0) {
      setAmount(String(newTotal));
    }
  };

  const handleApplyDetails = () => {
    handleCloseModal(() => {
      onApply({
        merchant: merchant.trim(),
        amount: parseFloat(amount) || 0,
        category: category,
        date: date,
        items: items.map((it) => ({
          name: it.name || "Item",
          amount: Number(it.price ?? it.amount ?? 0),
          price: Number(it.price ?? it.amount ?? 0),
          quantity: Number(it.quantity || 1),
          category: it.category || category,
        })),
        items_count: items.length,
      });
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={() => handleCloseModal()}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdropPressable} onPress={() => handleCloseModal()}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </Pressable>

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: colors.expenseForm || colors.card,
              borderColor: colors.background + "15",
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Grab Handle */}
          <View
            style={[
              styles.grabHandle,
              {
                backgroundColor: dark
                  ? "rgba(255, 255, 255, 0.15)"
                  : "rgba(0, 0, 0, 0.15)",
              },
            ]}
          />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={styles.sparkleIconBadge}>
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              </View>
              <CustomText
                style={[styles.headerTitle, { color: colors.text, fontFamily: "Poppins_Bold" }]}
              >
                Receipt Details
              </CustomText>
            </View>
            <Pressable
              onPress={() => handleCloseModal()}
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Image Preview & Quick Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: colors.expenseInput, borderColor: colors.inputBg }]}>
              {imageUri && (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: imageUri }} style={styles.receiptImage} resizeMode="cover" />
                  <View style={styles.imageOverlayBadge}>
                    <CustomText style={styles.imageOverlayText}>AI Scanned</CustomText>
                  </View>
                </View>
              )}

              <View style={styles.summaryDetails}>
                {/* Total Extracted Amount */}
                <CustomText style={[styles.label, { color: colors.text + "80" }]}>
                  Extracted Total
                </CustomText>
                <View style={styles.amountRow}>
                  <CustomText style={[styles.currencySymbol, { color: "#57A6A1" }]}>₹</CustomText>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={colors.text + "50"}
                    style={[styles.amountInput, { color: colors.text }]}
                  />
                </View>
              </View>
            </View>

            {/* Merchant / Store Title */}
            <View style={styles.fieldWrapper}>
              <CustomText style={[styles.fieldLabel, { color: colors.text }]}>
                Merchant / Store Name
              </CustomText>
              <View style={[styles.inputContainer, { backgroundColor: colors.expenseInput, borderColor: colors.inputBg }]}>
                <Ionicons name="storefront-outline" size={20} color={colors.text + "70"} style={{ marginRight: 10 }} />
                <TextInput
                  value={merchant}
                  onChangeText={setMerchant}
                  placeholder="e.g. Grand Hotel, Starbucks"
                  placeholderTextColor={colors.text + "50"}
                  style={[styles.textInput, { color: colors.text }]}
                />
              </View>
            </View>

            {/* Category & Date Row */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <CustomText style={[styles.fieldLabel, { color: colors.text }]}>
                  Category
                </CustomText>
                <View style={[styles.badgeContainer, { backgroundColor: colors.expenseInput, borderColor: colors.inputBg }]}>
                  <FontAwesome5 name="tags" size={14} color="#57A6A1" style={{ marginRight: 8 }} />
                  <CustomText style={[styles.badgeText, { color: colors.text }]}>
                    {category}
                  </CustomText>
                </View>
              </View>

              {date ? (
                <View style={{ flex: 1 }}>
                  <CustomText style={[styles.fieldLabel, { color: colors.text }]}>
                    Date
                  </CustomText>
                  <View style={[styles.badgeContainer, { backgroundColor: colors.expenseInput, borderColor: colors.inputBg }]}>
                    <Ionicons name="calendar-outline" size={16} color="#57A6A1" style={{ marginRight: 8 }} />
                    <CustomText style={[styles.badgeText, { color: colors.text }]}>
                      {date}
                    </CustomText>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Extracted Line Items Section */}
            {items.length > 0 && (
              <View style={styles.itemsSection}>
                <View style={styles.itemsSectionHeader}>
                  <Ionicons name="receipt-outline" size={18} color="#57A6A1" style={{ marginRight: 6 }} />
                  <CustomText style={[styles.itemsTitle, { color: colors.text }]}>
                    Scanned Line Items ({items.length})
                  </CustomText>
                </View>

                <View style={[styles.itemsCard, { backgroundColor: colors.expenseInput, borderColor: colors.inputBg }]}>
                  {items.map((item, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.itemRow,
                        idx < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.inputBg }
                      ]}
                    >
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <CustomText style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                          {item.name || `Item ${idx + 1}`}
                        </CustomText>
                        {item.quantity && item.quantity > 1 && (
                          <CustomText style={[styles.itemQty, { color: colors.text + "70" }]}>
                            Qty: {item.quantity}
                          </CustomText>
                        )}
                      </View>
                      <CustomText style={[styles.itemPrice, { color: colors.text, marginRight: 10 }]}>
                        ₹{item.price ?? item.amount ?? 0}
                      </CustomText>
                      <Pressable onPress={() => handleDeleteItem(idx)} style={{ padding: 4 }}>
                        <Ionicons name="trash-outline" size={16} color="#EF5350" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Primary Action Button: Confirm & Attach Details */}
            <Pressable
              onPress={handleApplyDetails}
              style={({ pressed }) => [
                styles.applyButton,
                { transform: [{ scale: pressed ? 0.98 : 1 }] }
              ]}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
              <CustomText style={styles.applyButtonText}>
                Attach & Fill Details ({items.length} Items)
              </CustomText>
            </Pressable>

            {/* Secondary Action: Discard */}
            <Pressable
              onPress={() => handleCloseModal()}
              style={({ pressed }) => [
                styles.discardButton,
                pressed && { opacity: 0.7 }
              ]}
            >
              <CustomText style={[styles.discardButtonText, { color: colors.text + "70" }]}>
                Discard
              </CustomText>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
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
    paddingBottom: 36,
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 24,
    borderTopWidth: 1,
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
  sparkleIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#57A6A1",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins_Bold",
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  imageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  receiptImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlayBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(87, 166, 161, 0.85)",
    paddingVertical: 2,
    alignItems: "center",
  },
  imageOverlayText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "Poppins_Bold",
  },
  summaryDetails: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontFamily: "Poppins_Medium",
    marginBottom: 2,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 24,
    fontFamily: "Poppins_Bold",
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: "Poppins_Bold",
    padding: 0,
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
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 52,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins_Medium",
    height: "100%",
    padding: 0,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 52,
  },
  badgeText: {
    fontSize: 14,
    fontFamily: "Poppins_SemiBold",
  },
  itemsSection: {
    marginBottom: 20,
  },
  itemsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itemsTitle: {
    fontSize: 14,
    fontFamily: "Poppins_SemiBold",
  },
  itemsCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  itemName: {
    fontSize: 14,
    fontFamily: "Poppins_Medium",
  },
  itemQty: {
    fontSize: 11,
    fontFamily: "Poppins_Regular",
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: "Poppins_SemiBold",
  },
  applyButton: {
    backgroundColor: "#57A6A1",
    borderRadius: 20,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#57A6A1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_Bold",
  },
  discardButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  discardButtonText: {
    fontSize: 14,
    fontFamily: "Poppins_Medium",
  },
});

export default ReceiptDetailsModal;
