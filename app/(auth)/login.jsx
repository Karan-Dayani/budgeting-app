import React, { useState } from "react";
import {
  Alert,
  View,
  ActivityIndicator,
  Pressable,
  ImageBackground,
  Image,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from "react-native";

const { width, height } = Dimensions.get("window");
import { supabase } from "../../lib/supabase";
import { Stack, router } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // States for input focus state styling
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const { colors, dark } = useTheme();

  const checkUserIncome = async (userEmail) => {
    try {
      const { data, error } = await supabase
        .from("User Data")
        .select("income")
        .eq("email", userEmail);
      if (error) return null;
      return data && data[0] ? data[0].income : null;
    } catch {
      return null;
    }
  };

  async function signInWithEmail() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });
    
    if (error) {
      Alert.alert("Sign In Failed", error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const hasIncome = await checkUserIncome(data.user.email);
      if (hasIncome) {
        router.replace("/(tabs)/Home");
      } else {
        router.replace("/UserDetails/");
      }
    }
    setLoading(false);
  }

  return (
    <ImageBackground
      source={require("../../assets/images/CoinTrackLogin.png")}
      style={styles.backgroundImage}
    >
      {/* Dark overlay for rich visual contrast, especially in dark mode */}
      <View style={[styles.overlay, { backgroundColor: dark ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.4)" }]}>
        <SafeAreaView style={styles.safeArea}>
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
                
                {/* Header/Branding Area */}
                <View style={styles.headerArea}>
                  <Image
                    source={require("../../assets/images/cointrack_logo.png")}
                    style={{ width: 80, height: 80, borderRadius: 20, marginBottom: 12 }}
                    resizeMode="contain"
                  />
                  <Text style={[styles.brandTitle, { color: colors.text }]}>
                    CoinTrack
                  </Text>
                  <Text style={[styles.brandSubtitle, { color: dark ? "#A0AEC0" : "#4B5563" }]}>
                    Sign in to continue tracking your budget
                  </Text>
                </View>

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
                  <Text style={[styles.cardHeader, { color: colors.text }]}>
                    Welcome Back
                  </Text>

                  {/* Email Input */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Email Address
                    </Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        {
                          backgroundColor: colors.loginInput,
                          borderColor: isEmailFocused
                            ? colors.primary
                            : "transparent",
                          borderWidth: 1.5,
                        }
                      ]}
                    >
                      <MaterialIcons
                        name="alternate-email"
                        size={20}
                        color={isEmailFocused ? colors.primary : "#9ca3af"}
                        style={{ marginRight: 10 }}
                      />
                      <TextInput
                        style={[styles.textInput, { color: colors.text }]}
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        placeholder="yourname@example.com"
                        placeholderTextColor={dark ? "#718096" : "#A0AEC0"}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        cursorColor={colors.primary}
                        onFocus={() => setIsEmailFocused(true)}
                        onBlur={() => setIsEmailFocused(false)}
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Password
                    </Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        {
                          backgroundColor: colors.loginInput,
                          borderColor: isPasswordFocused
                            ? colors.primary
                            : "transparent",
                          borderWidth: 1.5,
                        }
                      ]}
                    >
                      <MaterialIcons
                        name="lock-outline"
                        size={20}
                        color={isPasswordFocused ? colors.primary : "#9ca3af"}
                        style={{ marginRight: 10 }}
                      />
                      <TextInput
                        style={[styles.textInput, { color: colors.text }]}
                        secureTextEntry={!showPassword}
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        placeholder="••••••••"
                        placeholderTextColor={dark ? "#718096" : "#A0AEC0"}
                        autoCapitalize="none"
                        cursorColor={colors.primary}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                      />
                      <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                        <MaterialIcons
                          name={showPassword ? "visibility" : "visibility-off"}
                          size={20}
                          color="#9ca3af"
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={{ marginTop: 12 }}>
                    {loading ? (
                      <ActivityIndicator color={colors.primary} size="large" style={{ marginVertical: 14 }} />
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={[styles.buttonPrimary, { backgroundColor: colors.primary }]}
                        onPress={signInWithEmail}
                      >
                        <Text style={styles.buttonText}>Sign In</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Footer Section */}
                <View style={styles.footerContainer}>
                  <Text style={[styles.footerText, { color: dark ? "#718096" : "#4B5563" }]}>
                    Don't have an account?{" "}
                  </Text>
                  <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                    <Text style={[styles.footerLink, { color: colors.primary }]}>
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>

              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

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
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerArea: {
    alignItems: "center",
    marginTop: height * 0.04,
  },
  logoIconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 26,
    fontFamily: "Poppins_Bold",
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_Medium",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 20,
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
    marginVertical: 24,
  },
  cardHeader: {
    fontSize: 20,
    fontFamily: "Poppins_SemiBold",
    marginBottom: 20,
    textAlign: "center",
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
    fontFamily: "Poppins_Medium",
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
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  footerText: {
    fontSize: 15,
    fontFamily: "Poppins_Medium",
  },
  footerLink: {
    fontSize: 15,
    fontFamily: "Poppins_Bold",
  },
});
