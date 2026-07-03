import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Stack, router } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import CustomText from "../../components/CustomText";
import { useSetupStore } from "../../components/globalState/setupStore";
import { useAuthStore } from "../../components/globalState/authStore";

const { width } = Dimensions.get("window");

interface LocalAccount {
  id: string;
  name: string;
  type: "Bank" | "Digital Wallet" | "Cash" | "Credit Card";
  balance: string;
}

const AccountManage = () => {
  const { colors, dark } = useTheme() as any;
  const { user } = useAuthStore();

  const { accounts, addAccount, removeAccount, submitAccounts, submitDetails, loading } =
    useSetupStore();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState<
    "Bank" | "Digital Wallet" | "Cash" | "Credit Card"
  >("Bank");
  const [newAccountBalance, setNewAccountBalance] = useState("");

  // Focus states for styling
  const [isNewNameFocused, setIsNewNameFocused] = useState(false);
  const [isNewBalanceFocused, setIsNewBalanceFocused] = useState(false);

  // Helper to get type icon
  const getTypeIcon = (type: string, color?: string) => {
    const iconColor = color || colors.primary;
    switch (type) {
      case "Bank":
        return <FontAwesome name="bank" size={16} color={iconColor} />;
      case "Digital Wallet":
        return <Ionicons name="wallet-outline" size={18} color={iconColor} />;
      case "Cash":
        return <Ionicons name="cash-outline" size={18} color={iconColor} />;
      case "Credit Card":
        return <Ionicons name="card-outline" size={18} color={iconColor} />;
      default:
        return (
          <Ionicons name="help-circle-outline" size={18} color={iconColor} />
        );
    }
  };

  // Add account action
  const handleAddAccount = () => {
    if (!newAccountName.trim()) {
      Alert.alert("Invalid Input", "Please enter a name for the account.");
      return;
    }
    if (
      !newAccountBalance.trim() ||
      isNaN(Number(newAccountBalance)) ||
      Number(newAccountBalance) < 0
    ) {
      Alert.alert("Invalid Input", "Please enter a valid starting balance.");
      return;
    }

    addAccount(
      newAccountName.trim(),
      newAccountType,
      parseFloat(newAccountBalance),
    );

    setNewAccountName("");
    setNewAccountBalance("");
    setNewAccountType("Bank");
    setIsModalVisible(false);
  };

  // Delete account action
  const handleDeleteAccount = (id: string) => {
    removeAccount(id);
  };

  // Continue action
  const handleFinish = async () => {
    if (accounts.length === 0) {
      Alert.alert(
        "No Accounts Added",
        "Please add at least one account to get started (e.g. Bank Account, Wallet, or Cash).",
      );
      return;
    }

    // Submit user details (username and income)
    const detailsSuccess = await submitDetails(user?.email || "");
    if (!detailsSuccess) {
      Alert.alert("Error", "Failed to save profile details. Please try again.");
      return;
    }

    // Submit the accounts batch insert
    const accountsSuccess = await submitAccounts(user?.id || "");

    if (accountsSuccess) {
      Alert.alert(
        "Setup Completed",
        "Your profile and accounts have been configured successfully!",
        [
          {
            text: "Let's Go",
            onPress: () => {
              router.replace("/(tabs)/Home");
            },
          },
        ],
      );
    } else {
      Alert.alert("Error", "Failed to save accounts. Please try again.");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/CoinTrackLogin.png")}
      style={styles.backgroundImage}
    >
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: dark
              ? "rgba(0,0,0,0.82)"
              : "rgba(255,255,255,0.45)",
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <StatusBar
            barStyle={dark ? "light-content" : "dark-content"}
            backgroundColor="transparent"
            translucent
          />
          <Stack.Screen options={{ headerShown: false }} />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.mainContainer}>
                {/* Main Card Wrapper */}
                <View
                  style={[
                    styles.formCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: dark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                    },
                  ]}
                >
                  {/* Top Header Block */}
                  <View style={styles.headerBlock}>
                    <Text style={[styles.cardHeader, { color: colors.text }]}>
                      Set Up Accounts
                    </Text>

                    {/* Informative Callout */}
                    <View
                      style={[
                        styles.infoCallout,
                        {
                          backgroundColor: dark
                            ? "rgba(65, 179, 162, 0.08)"
                            : "rgba(65, 179, 162, 0.05)",
                        },
                      ]}
                    >
                      <Ionicons
                        name="information-circle-outline"
                        size={20}
                        color={colors.primary}
                        style={{ marginRight: 10, marginTop: 2 }}
                      />
                      <Text
                        style={[
                          styles.infoCalloutText,
                          { color: dark ? "#CBD5E0" : "#4A5568" },
                        ]}
                      >
                        Tell us about all your bank accounts, digital wallets,
                        cash, or cards. We'll sum their starting balances to
                        initialize your savings.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sectionDivider} />

                  {/* Accounts List Section */}
                  <View style={styles.additionalHeaderRow}>
                    <Text
                      style={[styles.sectionTitleText, { color: colors.text }]}
                    >
                      Your Configured Accounts
                    </Text>
                    <Text
                      style={[
                        styles.additionalCountText,
                        { color: colors.primary },
                      ]}
                    >
                      {accounts.length} Added
                    </Text>
                  </View>

                  {accounts.length === 0 ? (
                    <View
                      style={[
                        styles.emptyContainer,
                        {
                          borderColor: dark
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(0,0,0,0.05)",
                        },
                      ]}
                    >
                      <Ionicons
                        name="wallet-outline"
                        size={28}
                        color={dark ? "#4A5568" : "#A0AEC0"}
                        style={{ marginBottom: 6 }}
                      />
                      <Text
                        style={[
                          styles.emptyText,
                          { color: dark ? "#718096" : "#A0AEC0" },
                        ]}
                      >
                        No extra wallets, cash or cards added yet.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.accountsList}>
                      {accounts.map((item) => (
                        <View
                          key={item.id}
                          style={[
                            styles.accountListItem,
                            {
                              backgroundColor: dark
                                ? "rgba(255,255,255,0.02)"
                                : "rgba(0,0,0,0.02)",
                              borderColor: dark
                                ? "rgba(255,255,255,0.06)"
                                : "rgba(0,0,0,0.05)",
                            },
                          ]}
                        >
                          <View style={styles.accountListItemLeft}>
                            <View
                              style={[
                                styles.typeIconBox,
                                { backgroundColor: `${colors.primary}12` },
                              ]}
                            >
                              {getTypeIcon(item.type)}
                            </View>
                            <View style={{ marginLeft: 12, flexShrink: 1 }}>
                              <Text
                                style={[
                                  styles.accountListNameText,
                                  { color: colors.text },
                                ]}
                                numberOfLines={1}
                              >
                                {item.name}
                              </Text>
                              <Text
                                style={[
                                  styles.accountListTypeText,
                                  { color: dark ? "#718096" : "#8A9Aad" },
                                ]}
                              >
                                {item.type}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.accountListItemRight}>
                            <Text
                              style={[
                                styles.accountListBalanceText,
                                { color: colors.text },
                              ]}
                            >
                              ₹{item.balance}
                            </Text>
                            <TouchableOpacity
                              onPress={() => handleDeleteAccount(item.id)}
                              style={styles.deleteButton}
                              activeOpacity={0.7}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={16}
                                color="#EF4444"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Modal Trigger for Additional Accounts */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.modalTriggerButton,
                      { borderColor: colors.primary },
                    ]}
                    onPress={() => setIsModalVisible(true)}
                  >
                    <Ionicons
                      name="add-circle"
                      size={18}
                      color={colors.primary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.modalTriggerButtonText,
                        { color: colors.primary },
                      ]}
                    >
                      Add Account
                    </Text>
                  </TouchableOpacity>

                  {/* Finish Setup CTA */}
                  <View style={{ marginTop: 24 }}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={[
                        styles.buttonPrimary,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={handleFinish}
                    >
                      <Text style={styles.buttonText}>Finish Setup</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Add Secondary Account Modal Popup */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalContentCard,
                  { backgroundColor: colors.card },
                ]}
              >
                {/* Modal Header */}
                <View style={styles.modalHeaderRow}>
                  <Text style={[styles.modalTitleText, { color: colors.text }]}>
                    Add Account
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsModalVisible(false)}
                    style={styles.modalCloseButton}
                  >
                    <Ionicons name="close" size={22} color={colors.text} />
                  </TouchableOpacity>
                </View>

                {/* Account Name */}
                <View style={styles.modalInputGroup}>
                  <Text
                    style={[styles.modalInputLabel, { color: colors.text }]}
                  >
                    Account Name
                  </Text>
                  <TextInput
                    style={[
                      styles.modalTextInput,
                      {
                        color: colors.text,
                        backgroundColor: colors.loginInput,
                        borderColor: isNewNameFocused
                          ? colors.primary
                          : "transparent",
                        borderWidth: 1.2,
                      },
                    ]}
                    value={newAccountName}
                    onChangeText={setNewAccountName}
                    placeholder="e.g. Paytm Wallet, Pocket Cash"
                    placeholderTextColor={dark ? "#718096" : "#A0AEC0"}
                    cursorColor={colors.primary}
                    onFocus={() => setIsNewNameFocused(true)}
                    onBlur={() => setIsNewNameFocused(false)}
                  />
                </View>

                {/* Account Type Selector */}
                <View style={styles.modalInputGroup}>
                  <Text
                    style={[
                      styles.modalInputLabel,
                      { color: colors.text, marginBottom: 8 },
                    ]}
                  >
                    Account Type
                  </Text>
                  <View style={styles.modalChipsContainer}>
                    {(
                      ["Bank", "Digital Wallet", "Cash", "Credit Card"] as const
                    ).map((type) => {
                      const isSelected = newAccountType === type;
                      return (
                        <TouchableOpacity
                          key={type}
                          onPress={() => setNewAccountType(type)}
                          style={[
                            styles.modalChip,
                            {
                              backgroundColor: isSelected
                                ? colors.primary
                                : colors.loginInput,
                            },
                          ]}
                          activeOpacity={0.8}
                        >
                          <View style={styles.chipContent}>
                            {getTypeIcon(
                              type,
                              isSelected
                                ? "#FFFFFF"
                                : dark
                                  ? "#A0AEC0"
                                  : "#4B5563",
                            )}
                            <Text
                              style={[
                                styles.modalChipText,
                                {
                                  color: isSelected
                                    ? "#FFFFFF"
                                    : dark
                                      ? "#A0AEC0"
                                      : "#4B5563",
                                  marginLeft: 6,
                                },
                              ]}
                            >
                              {type}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Starting Balance */}
                <View style={styles.modalInputGroup}>
                  <Text
                    style={[styles.modalInputLabel, { color: colors.text }]}
                  >
                    Starting Balance (₹)
                  </Text>
                  <TextInput
                    style={[
                      styles.modalTextInput,
                      {
                        color: colors.text,
                        backgroundColor: colors.loginInput,
                        borderColor: isNewBalanceFocused
                          ? colors.primary
                          : "transparent",
                        borderWidth: 1.2,
                      },
                    ]}
                    value={newAccountBalance}
                    onChangeText={setNewAccountBalance}
                    placeholder="e.g. 2500"
                    placeholderTextColor={dark ? "#718096" : "#A0AEC0"}
                    inputMode="numeric"
                    keyboardType="numeric"
                    cursorColor={colors.primary}
                    onFocus={() => setIsNewBalanceFocused(true)}
                    onBlur={() => setIsNewBalanceFocused(false)}
                  />
                </View>

                {/* Save CTA */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.modalSubmitButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleAddAccount}
                >
                  <Text style={styles.modalSubmitButtonText}>Add Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {loading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.text }]}>
                  Configuring your workspace...
                </Text>
                <Text style={styles.loadingSubtext}>
                  Saving profile and account settings
                </Text>
              </View>
            </View>
          )}
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

const styles: any = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  formCard: {
    padding: 20,
    borderRadius: 30,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  headerBlock: {
    marginBottom: 14,
  },
  cardHeader: {
    fontSize: 22,
    fontFamily: "Poppins_Bold",
    textAlign: "center",
    marginBottom: 10,
  },
  infoCallout: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 12,
  },
  infoCalloutText: {
    fontSize: 12,
    fontFamily: "Nunito",
    flex: 1,
    lineHeight: 16,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "rgba(128,128,128,0.1)",
    marginBottom: 16,
  },
  sectionTitleText: {
    fontSize: 15,
    fontFamily: "Poppins_SemiBold",
  },
  primaryFormCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(128,128,128,0.06)",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabelLabel: {
    fontSize: 13,
    fontFamily: "Poppins_SemiBold",
    marginBottom: 6,
    opacity: 0.95,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontFamily: "Nunito",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  chipContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Poppins_SemiBold",
  },
  additionalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  additionalCountText: {
    fontSize: 12,
    fontFamily: "Poppins_SemiBold",
  },
  emptyContainer: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 12,
    fontFamily: "Nunito",
    textAlign: "center",
  },
  accountsList: {
    marginBottom: 14,
  },
  accountListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  accountListItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  typeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  accountListNameText: {
    fontSize: 14,
    fontFamily: "Poppins_SemiBold",
  },
  accountListTypeText: {
    fontSize: 11,
    fontFamily: "Nunito",
  },
  accountListItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  accountListBalanceText: {
    fontSize: 14,
    fontFamily: "Poppins_SemiBold",
    marginRight: 10,
  },
  deleteButton: {
    padding: 6,
  },
  modalTriggerButton: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  modalTriggerButtonText: {
    fontSize: 13,
    fontFamily: "Poppins_SemiBold",
  },
  buttonPrimary: {
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_SemiBold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContentCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 34,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitleText: {
    fontSize: 18,
    fontFamily: "Poppins_Bold",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalInputGroup: {
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 13,
    fontFamily: "Poppins_SemiBold",
    opacity: 0.9,
    marginBottom: 6,
  },
  modalTextInput: {
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    fontFamily: "Nunito",
  },
  modalChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  modalChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  modalChipText: {
    fontSize: 12,
    fontFamily: "Poppins_SemiBold",
  },
  modalSubmitButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  modalSubmitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Poppins_SemiBold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingCard: {
    padding: 30,
    borderRadius: 20,
    backgroundColor: "rgba(30, 41, 59, 0.95)",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Poppins_SemiBold",
    marginTop: 16,
    textAlign: "center",
  },
  loadingSubtext: {
    fontSize: 12,
    color: "#94A3B8",
    fontFamily: "Poppins_Regular",
    marginTop: 6,
    textAlign: "center",
  },
});

export default AccountManage;
