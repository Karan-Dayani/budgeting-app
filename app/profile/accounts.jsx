import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
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
  Pressable,
} from "react-native";
import { Stack, router } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  FontAwesome,
  AntDesign,
  Feather,
} from "@expo/vector-icons";
import CustomText from "../../components/CustomText";
import { useBudgetStore } from "../../components/globalState/budgetStore";
import { useAuthStore } from "../../components/globalState/authStore";

const { width } = Dimensions.get("window");

const ProfileAccounts = () => {
  const { colors, dark } = useTheme();
  const { user } = useAuthStore();
  const {
    accounts,
    addAccount,
    deleteAccount,
    updateAccount,
    submitting,
  } = useBudgetStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState("Bank");
  const [newAccountBalance, setNewAccountBalance] = useState("");
  
  // Quick top-up modal states
  const [isTopUpVisible, setIsTopUpVisible] = useState(false);
  const [topUpAccount, setTopUpAccount] = useState(null);
  const [topUpValue, setTopUpValue] = useState("");

  // Options action sheet states
  const [isActionsVisible, setIsActionsVisible] = useState(false);
  const [selectedActionAccount, setSelectedActionAccount] = useState(null);

  const [isNewNameFocused, setIsNewNameFocused] = useState(false);
  const [isNewBalanceFocused, setIsNewBalanceFocused] = useState(false);

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  // Helper to get type icon
  const getTypeIcon = (type, color) => {
    const iconColor = color || "#41B3A2";
    switch (type) {
      case "Bank":
        return <FontAwesome name="bank" size={16} color={iconColor} />;
      case "Digital Wallet":
        return <FontAwesome name="google-wallet" size={18} color={iconColor} />;
      case "Cash":
        return <FontAwesome name="money" size={18} color={iconColor} />;
      case "Credit Card":
        return <FontAwesome name="credit-card" size={18} color={iconColor} />;
      default:
        return <Ionicons name="help-circle-outline" size={18} color={iconColor} />;
    }
  };

  // Add or Edit account action
  const handleAddAccount = async () => {
    if (!newAccountName.trim()) {
      Alert.alert("Invalid Input", "Please enter a name for the account.");
      return;
    }
    if (
      !newAccountBalance.trim() ||
      isNaN(Number(newAccountBalance)) ||
      Number(newAccountBalance) < 0
    ) {
      Alert.alert("Invalid Input", "Please enter a valid balance.");
      return;
    }

    let success = false;
    if (editingAccount) {
      success = await updateAccount(
        user?.email || "",
        editingAccount.id,
        newAccountName.trim(),
        newAccountType,
        parseFloat(newAccountBalance)
      );
    } else {
      success = await addAccount(
        user?.id || "",
        user?.email || "",
        newAccountName.trim(),
        newAccountType,
        parseFloat(newAccountBalance)
      );
    }

    if (success) {
      handleCloseModal();
    } else {
      Alert.alert("Error", `Failed to ${editingAccount ? "update" : "add"} account. Please try again.`);
    }
  };

  const handleTriggerTopUp = (account) => {
    setTopUpAccount(account);
    setTopUpValue("");
    setIsTopUpVisible(true);
  };

  const handleQuickTopUp = async () => {
    const val = parseFloat(topUpValue);
    if (isNaN(val) || val <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid positive amount to add.");
      return;
    }

    const updatedBalance = topUpAccount.balance + val;
    const success = await updateAccount(
      user?.email || "",
      topUpAccount.id,
      topUpAccount.name,
      topUpAccount.type,
      updatedBalance
    );

    if (success) {
      setIsTopUpVisible(false);
      setTopUpAccount(null);
      setTopUpValue("");
    } else {
      Alert.alert("Error", "Failed to update account balance. Please try again.");
    }
  };

  const handleShowAccountActions = (account) => {
    setSelectedActionAccount(account);
    setIsActionsVisible(true);
  };

  const handleActionAddMoney = () => {
    setIsActionsVisible(false);
    handleTriggerTopUp(selectedActionAccount);
  };

  const handleActionEdit = () => {
    setIsActionsVisible(false);
    handleEditAccount(selectedActionAccount);
  };

  const handleActionDelete = () => {
    setIsActionsVisible(false);
    handleDeleteAccount(selectedActionAccount);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setNewAccountName(account.name);
    setNewAccountType(account.type);
    setNewAccountBalance(String(account.balance));
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setNewAccountName("");
    setNewAccountBalance("");
    setNewAccountType("Bank");
    setEditingAccount(null);
    setIsModalVisible(false);
  };

  // Delete account action
  const handleDeleteAccount = (account) => {
    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete "${account.name}"? The balance of ₹${account.balance} will be deducted from your total savings.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteAccount(
              user?.email || "",
              account.id,
              account.balance
            );
            if (!success) {
              Alert.alert("Error", "Failed to delete account. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" translucent />

      {/* Styled Top Banner - Matches Profile page style */}
      <View style={styles.headerBanner}>
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <AntDesign name="arrow-left" size={22} color="white" />
          </TouchableOpacity>
          <CustomText style={styles.headerTitle}>
            Accounts
          </CustomText>
          <View style={{ width: 42 }} />
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Assets Summary Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.inputBg }]}>
          <View style={styles.balanceHeader}>
            <Feather name="credit-card" size={16} color="#41B3A2" />
            <CustomText style={styles.balanceLabel}>Total Savings Balance</CustomText>
          </View>
          <CustomText style={[styles.balanceValue, { color: colors.text }]}>
            ₹{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </CustomText>
        </View>

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <CustomText style={[styles.sectionTitle, { color: colors.text }]}>
            Configured Accounts
          </CustomText>
        </View>

        {/* Accounts List Container - Styled like the Profile Settings block */}
        <View style={[styles.listContainer, { backgroundColor: colors.inputBg }]}>
          {accounts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="wallet-outline"
                size={28}
                color="#41B3A2"
                style={{ marginBottom: 6 }}
              />
              <CustomText style={styles.emptyText}>
                No accounts added yet.
              </CustomText>
            </View>
          ) : (
            accounts.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleShowAccountActions(item)}
                activeOpacity={0.65}
                style={[
                  styles.accountRow,
                  index < accounts.length - 1 && styles.borderBottom,
                  index < accounts.length - 1 && { borderBottomColor: colors.background + '22' }
                ]}
              >
                <View style={styles.accountRowLeft}>
                  <View style={styles.iconBackground}>
                    {getTypeIcon(item.type)}
                  </View>
                  <View style={styles.textContainer}>
                    <CustomText style={[styles.accountNameText, { color: colors.text }]}>
                      {item.name}
                    </CustomText>
                    <CustomText style={styles.accountTypeText}>
                      {item.type}
                    </CustomText>
                  </View>
                </View>

                <View style={styles.accountRowRight}>
                  <Text style={[styles.balanceText, { color: colors.text }]}>
                    ₹{item.balance.toLocaleString("en-IN")}
                  </Text>
                  <Feather
                    name="more-vertical"
                    size={18}
                    color={colors.text + '66'}
                    style={{ marginLeft: 4 }}
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Add Account CTA - Clean Full-width Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <CustomText style={styles.addButtonText}>Add Account</CustomText>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Account Modal Pop-up */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleCloseModal}
      >
        <Pressable
          onPress={handleCloseModal}
          style={styles.modalOverlay}
        >
          <Pressable
            onPress={() => { }}
            style={[styles.modalContentCard, { backgroundColor: colors.expenseForm }]}
          >
            <CustomText style={[styles.modalTitle, { color: colors.text }]}>
              {editingAccount ? "Edit Account" : "Add Account"}
            </CustomText>

            {/* Account Name */}
            <CustomText style={[styles.modalInputLabel, { color: colors.text + 'aa' }]}>
              Account Name
            </CustomText>
            <TextInput
              style={[
                styles.modalTextInput,
                {
                  backgroundColor: colors.expenseInput,
                  color: colors.text,
                  borderColor: isNewNameFocused ? "#41B3A2" : colors.inputBg
                },
              ]}
              value={newAccountName}
              onChangeText={setNewAccountName}
              placeholder="e.g. SBI Savings, Paytm Wallet"
              placeholderTextColor={colors.text + '66'}
              onFocus={() => setIsNewNameFocused(true)}
              onBlur={() => setIsNewNameFocused(false)}
            />

            {/* Account Type Selection */}
            <CustomText style={[styles.modalInputLabel, { color: colors.text + 'aa', marginTop: 14 }]}>
              Account Type
            </CustomText>
            <View style={styles.chipsContainer}>
              {["Bank", "Digital Wallet", "Cash", "Credit Card"].map((type) => {
                const isSelected = newAccountType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setNewAccountType(type)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? "#41B3A2" : colors.expenseInput,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <View style={styles.chipContent}>
                      {getTypeIcon(type, isSelected ? "#FFFFFF" : colors.text + '99')}
                      <CustomText
                        style={[
                          styles.chipText,
                          {
                            color: isSelected ? "#FFFFFF" : colors.text,
                            marginLeft: 6,
                          },
                        ]}
                      >
                        {type}
                      </CustomText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Starting/Current Balance */}
            <CustomText style={[styles.modalInputLabel, { color: colors.text + 'aa', marginTop: 14 }]}>
              {editingAccount ? "Current Balance (₹)" : "Starting Balance (₹)"}
            </CustomText>
            <TextInput
              style={[
                styles.modalTextInput,
                {
                  backgroundColor: colors.expenseInput,
                  color: colors.text,
                  borderColor: isNewBalanceFocused ? "#41B3A2" : colors.inputBg
                },
              ]}
              value={newAccountBalance}
              onChangeText={setNewAccountBalance}
              placeholder="e.g. 5000"
              placeholderTextColor={colors.text + '66'}
              inputMode="numeric"
              keyboardType="numeric"
              onFocus={() => setIsNewBalanceFocused(true)}
              onBlur={() => setIsNewBalanceFocused(false)}
            />

            {/* Modal actions */}
            <View style={styles.modalActionsRow}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={handleCloseModal}
              >
                <CustomText style={styles.modalCancelBtnText}>Cancel</CustomText>
              </Pressable>
              <Pressable
                style={[styles.modalSubmitBtn, submitting && { opacity: 0.6 }]}
                onPress={submitting ? null : handleAddAccount}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <CustomText style={styles.modalSubmitBtnText}>Submit</CustomText>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Quick Top-up Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isTopUpVisible}
        onRequestClose={() => {
          setIsTopUpVisible(false);
          setTopUpAccount(null);
          setTopUpValue("");
        }}
      >
        <Pressable
          onPress={() => {
            setIsTopUpVisible(false);
            setTopUpAccount(null);
            setTopUpValue("");
          }}
          style={styles.modalOverlay}
        >
          <Pressable
            onPress={() => { }}
            style={[styles.modalContentCard, { backgroundColor: colors.expenseForm }]}
          >
            <CustomText style={[styles.modalTitle, { color: colors.text }]}>
              Add Money
            </CustomText>
            {topUpAccount && (
              <CustomText style={{ fontSize: 13, fontFamily: "Poppins_Medium", color: colors.text + '88', textAlign: "center", marginTop: -14, marginBottom: 20 }}>
                To Account: {topUpAccount.name}
              </CustomText>
            )}

            <CustomText style={[styles.modalInputLabel, { color: colors.text + 'aa' }]}>
              Amount to Add (₹)
            </CustomText>
            <TextInput
              style={[
                styles.modalTextInput,
                {
                  backgroundColor: colors.expenseInput,
                  color: colors.text,
                  borderColor: "#41B3A2"
                },
              ]}
              value={topUpValue}
              onChangeText={setTopUpValue}
              placeholder="e.g. 1000"
              placeholderTextColor={colors.text + '66'}
              inputMode="numeric"
              keyboardType="numeric"
              autoFocus
            />

            <View style={styles.modalActionsRow}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => {
                  setIsTopUpVisible(false);
                  setTopUpAccount(null);
                  setTopUpValue("");
                }}
              >
                <CustomText style={styles.modalCancelBtnText}>Cancel</CustomText>
              </Pressable>
              <Pressable
                style={[styles.modalSubmitBtn, submitting && { opacity: 0.6 }]}
                onPress={submitting ? null : handleQuickTopUp}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <CustomText style={styles.modalSubmitBtnText}>Add Balance</CustomText>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Account Actions Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isActionsVisible}
        onRequestClose={() => {
          setIsActionsVisible(false);
          setSelectedActionAccount(null);
        }}
      >
        <Pressable
          onPress={() => {
            setIsActionsVisible(false);
            setSelectedActionAccount(null);
          }}
          style={styles.actionSheetOverlay}
        >
          <Pressable
            onPress={() => { }}
            style={[
              styles.actionSheetContainer,
              { 
                backgroundColor: colors.expenseForm || colors.card,
                borderTopColor: colors.background + '15' 
              }
            ]}
          >
            {/* Grab handle */}
            <View style={[styles.grabHandle, { backgroundColor: dark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)" }]} />

            {selectedActionAccount && (
              <>
                <View style={styles.actionSheetHeader}>
                  <CustomText style={[styles.actionSheetTitle, { color: colors.text }]}>
                    {selectedActionAccount.name}
                  </CustomText>
                  <CustomText style={styles.actionSheetSubtitle}>
                    {selectedActionAccount.type} • Current Balance: ₹{selectedActionAccount.balance.toLocaleString("en-IN")}
                  </CustomText>
                </View>

                {/* Large Touchable Action Rows */}
                <TouchableOpacity
                  style={[styles.actionRowBtn, { borderBottomColor: colors.background + '15' }]}
                  onPress={handleActionAddMoney}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: "rgba(65, 179, 162, 0.1)" }]}>
                    <Ionicons name="add-circle" size={22} color="#41B3A2" />
                  </View>
                  <CustomText style={[styles.actionText, { color: colors.text }]}>
                    Add Money (Top-up)
                  </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionRowBtn, { borderBottomColor: colors.background + '15' }]}
                  onPress={handleActionEdit}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: "rgba(65, 179, 162, 0.1)" }]}>
                    <Feather name="edit-2" size={18} color="#41B3A2" />
                  </View>
                  <CustomText style={[styles.actionText, { color: colors.text }]}>
                    Edit Account Details
                  </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionRowBtn}
                  onPress={handleActionDelete}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </View>
                  <CustomText style={[styles.actionText, { color: "#EF4444" }]}>
                    Delete Account
                  </CustomText>
                </TouchableOpacity>
              </>
            )}

            {/* Cancel Button */}
            <TouchableOpacity
              style={[styles.actionCancelBtn, { backgroundColor: dark ? "rgba(255, 255, 255, 0.08)" : "#F3F4F6" }]}
              onPress={() => {
                setIsActionsVisible(false);
                setSelectedActionAccount(null);
              }}
              activeOpacity={0.7}
            >
              <CustomText style={[styles.actionCancelText, { color: colors.text }]}>
                Close
              </CustomText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Loading Overlay */}
      {submitting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="white" />
            <CustomText style={styles.loadingText}>Syncing Ledger...</CustomText>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  headerBanner: {
    backgroundColor: "#41B3A2",
    pt: 12,
    pb: 16,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    paddingTop: Platform.OS === "ios" ? 44 : 24,
    paddingBottom: 24,
  },
  headerSafeArea: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Poppins_SemiBold",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 24,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 6,
    fontFamily: "Poppins_Medium",
  },
  balanceValue: {
    fontSize: 26,
    fontWeight: "bold",
    fontFamily: "Poppins_Bold",
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Poppins_SemiBold",
  },
  listContainer: {
    borderRadius: 28,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 24,
  },
  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  accountRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBackground: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(65, 179, 162, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    marginLeft: 12,
    flexShrink: 1,
  },
  accountNameText: {
    fontSize: 14,
    fontFamily: "Poppins_Medium",
  },
  accountTypeText: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 1,
  },
  accountRowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceText: {
    fontSize: 15,
    fontFamily: "Poppins_SemiBold",
    marginRight: 8,
  },
  deleteButton: {
    padding: 6,
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280",
    fontFamily: "Poppins_Medium",
  },
  addButton: {
    backgroundColor: "#41B3A2",
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#41B3A2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Poppins_SemiBold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContentCard: {
    width: width - 48,
    pb: 8,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  actionSheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Poppins_Bold",
    textAlign: "center",
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 12,
    fontFamily: "Poppins_SemiBold",
    marginBottom: 6,
  },
  modalTextInput: {
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    fontFamily: "Poppins_Medium",
    borderWidth: 1,
    marginBottom: 14,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
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
  modalActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: "#EF4444",
    alignItems: "center",
    borderRadius: 26,
  },
  modalCancelBtnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "Poppins_SemiBold",
  },
  modalSubmitBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: "#41B3A2",
    alignItems: "center",
    borderRadius: 26,
  },
  modalSubmitBtnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "Poppins_SemiBold",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingCard: {
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontFamily: "Poppins_SemiBold",
    marginTop: 10,
  },
  grabHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 20,
  },
  actionSheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    width: "100%",
    position: "absolute",
    bottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
  },
  actionSheetHeader: {
    marginBottom: 20,
    alignItems: "center",
  },
  actionSheetTitle: {
    fontSize: 20,
    fontFamily: "Poppins_Bold",
    marginBottom: 4,
  },
  actionSheetSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    fontFamily: "Poppins_Medium",
  },
  actionRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  actionText: {
    fontSize: 15,
    fontFamily: "Poppins_SemiBold",
  },
  actionCancelBtn: {
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  actionCancelText: {
    fontSize: 15,
    fontFamily: "Poppins_SemiBold",
  },
});

export default ProfileAccounts;
