import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar
} from "react-native";
import { Stack, router } from "expo-router";
import { supabase } from "../../lib/supabase";
import CustomText from "../../components/CustomText";
import { useTheme } from "expo-router/react-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSetupStore } from "../../components/globalState/setupStore";

const { width, height } = Dimensions.get("window");

const Profile = () => {
  const {
    username,
    setUsername,
    income,
    setIncome,
    error,
    setError,
  } = useSetupStore();

  // Input focus states
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isIncomeFocused, setIsIncomeFocused] = useState(false);

  const { colors, dark } = useTheme();

  const handleSubmit = () => {
    if (!username || !username.trim()) {
      setError("Please enter a username.");
      return;
    }

    const incomeStr = String(income);
    if (isNaN(incomeStr) || incomeStr.trim() === "" || Number(incomeStr) <= 0) {
      setError("Please enter a valid monthly income.");
      return;
    }

    setError("");
    router.replace("/UserDetails/accountManage");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/CoinTrackLogin.png")}
      style={styles.backgroundImage}
    >
      <View style={[styles.overlay, { backgroundColor: dark ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.4)" }]}>
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

                {/* Form Card */}
                <View
                  style={[
                    styles.formCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                    }
                  ]}
                >
                  {/* Decorative Setup Image */}
                  <View style={styles.imageContainer}>
                    <Image
                      source={require("../../assets/images/UserDetails.png")}
                      style={styles.setupImage}
                      resizeMode="contain"
                    />
                  </View>

                  <Text style={[styles.cardHeader, { color: colors.text }]}>
                    Set Up Profile
                  </Text>

                  <Text style={[styles.cardSubheader, { color: dark ? "#A0AEC0" : "#4B5563" }]}>
                    Let's personalize your budgeting dashboard
                  </Text>

                  {/* Username Input */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Username
                    </Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        {
                          backgroundColor: colors.loginInput,
                          borderColor: isNameFocused ? colors.primary : "transparent",
                          borderWidth: 1.5,
                        }
                      ]}
                    >
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color={isNameFocused ? colors.primary : "#9ca3af"}
                        style={{ marginRight: 10 }}
                      />
                      <TextInput
                        style={[styles.textInput, { color: colors.text }]}
                        value={username}
                        onChangeText={(value) => setUsername(value)}
                        placeholder="Choose a username"
                        placeholderTextColor={dark ? "#718096" : "#A0AEC0"}
                        cursorColor={colors.primary}
                        onFocus={() => setIsNameFocused(true)}
                        onBlur={() => setIsNameFocused(false)}
                      />
                    </View>
                  </View>

                  {/* Income Input */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Monthly Income
                    </Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        {
                          backgroundColor: colors.loginInput,
                          borderColor: isIncomeFocused ? colors.primary : "transparent",
                          borderWidth: 1.5,
                        }
                      ]}
                    >
                      <Ionicons
                        name="cash-outline"
                        size={20}
                        color={isIncomeFocused ? colors.primary : "#9ca3af"}
                        style={{ marginRight: 10 }}
                      />
                      <TextInput
                        style={[styles.textInput, { color: colors.text }]}
                        value={income ? income.toString() : ""}
                        onChangeText={(value) => setIncome(value)}
                        placeholder="e.g. 5000"
                        placeholderTextColor={dark ? "#718096" : "#A0AEC0"}
                        inputMode="numeric"
                        keyboardType="numeric"
                        cursorColor={colors.primary}
                        onFocus={() => setIsIncomeFocused(true)}
                        onBlur={() => setIsIncomeFocused(false)}
                      />
                    </View>

                    {error ? (
                      <CustomText style={styles.errorText}>{error}</CustomText>
                    ) : (
                      <CustomText style={[styles.helpText, { color: dark ? "#718096" : "#718096" }]}>
                        This baseline will be used to track monthly savings and limits.
                      </CustomText>
                    )}
                  </View>

                  {/* Submit Button */}
                  <View style={{ marginTop: 10 }}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={[styles.buttonPrimary, { backgroundColor: colors.primary }]}
                      onPress={handleSubmit}
                    >
                      <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>
                  </View>

                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
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
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  formCard: {
    padding: 24,
    borderRadius: 30,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  setupImage: {
    width: width * 0.45,
    height: width * 0.45,
  },
  cardHeader: {
    fontSize: 22,
    fontFamily: "Poppins_Bold",
    textAlign: "center",
  },
  cardSubheader: {
    fontSize: 14,
    fontFamily: "Nunito",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Poppins_SemiBold",
    marginBottom: 8,
    opacity: 0.9,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 56,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    fontFamily: "Nunito",
  },
  helpText: {
    fontSize: 13,
    fontFamily: "Nunito",
    marginTop: 8,
    lineHeight: 18,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Poppins_SemiBold",
    color: "#EF4444",
    marginTop: 8,
  },
  buttonPrimary: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_SemiBold",
  },
});

export default Profile;
