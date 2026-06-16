import React, { useState } from "react";
import {
  Alert,
  View,
  ActivityIndicator,
  Pressable,
  ImageBackground,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { supabase } from "../../lib/supabase";
import { Stack, router } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Auth() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { colors } = useTheme();

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
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      Alert.alert(error.message);
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

  async function signUpWithEmail() {
    setLoading(true);
    const { data: { session, user }, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    const addUser = async () => {
      const { data, err } = await supabase
        .from("User Data")
        .upsert({ email: email, income: 0, username: email.split("@")[0], savings: 0, expenses: [], goals: [] });
    };

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }

    if (!session) {
      await addUser();
      Alert.alert("Please check your inbox for email verification!");
    } else {
      await addUser();
      router.replace("/UserDetails/");
    }
    setLoading(false);
  }

  return (
    <ImageBackground
      source={require("../../assets/images/CoinTrackLogin.png")}
      className="flex-1 bg-cover"
    >
      <SafeAreaView className="flex-1 px-8">
        <Stack.Screen options={{ headerShown: false }} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View className="justify-between flex-1">


              <View className="pt-16">

                <Text
                  className="text-3xl text-center mt-5"
                  style={{ fontFamily: "Poppins_SemiBold", color: "black" }}
                >
                  Welcome!
                </Text>
                <Text
                  className="text-gray-600 text-md text-center mt-3 mb-3"
                  style={{ fontFamily: "Poppins_SemiBold", color: "black" }}
                >
                  Please sign in to your account
                </Text>
              </View>

              <View className="px-8 py-10 mb-16 rounded-3xl" style={{ backgroundColor: colors.expenseForm }}>
                <View>
                  <View >
                    <Text
                      className="text-xl mb-2 "
                      style={{ fontFamily: "Nunito", color: colors.text }}
                    >
                      Email
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.loginInput,
                        borderRadius: 20,
                        paddingHorizontal: 16
                      }}
                    >
                      <MaterialIcons name="person" size={20} color="#9ca3af" style={{ marginRight: 8 }} />
                      <TextInput
                        style={{
                          flex: 1,
                          color: colors.text,
                          paddingVertical: 16,
                          fontSize: 16
                        }}
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        placeholder="email@address.com"
                        placeholderTextColor="#A0AEC0"
                        autoCapitalize="none"
                        cursorColor={colors.text}
                      />
                    </View>
                  </View>
                  <View>
                    <Text
                      className="text-xl mb-2 mt-2"
                      style={{ fontFamily: "Nunito", color: colors.text }}
                    >
                      Password
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.loginInput,
                        borderRadius: 20,
                        paddingHorizontal: 16,
                        marginBottom: 32
                      }}
                    >
                      <TextInput
                        style={{
                          flex: 1,
                          color: colors.text,
                          paddingVertical: 16,
                          fontSize: 16
                        }}
                        secureTextEntry={!show}
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        placeholder="Password"
                        placeholderTextColor="#A0AEC0"
                        autoCapitalize="none"
                        cursorColor={colors.text}
                      />
                      <Pressable onPress={() => setShow(!show)}>
                        <MaterialIcons
                          name={show ? "visibility" : "visibility-off"}
                          size={20}
                          color="#9ca3af"
                          style={{ marginLeft: 8 }}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
                <View>
                  {loading ? (
                    <ActivityIndicator color="white" className="pt-10" size={25} />
                  ) : (
                    <>
                      <View className="mt-5 mb-2" >
                        <Pressable
                          className="bg-[#41B3A2] px-3 py-4 rounded-[20px] items-center"
                          disabled={loading}
                          onPress={() => signInWithEmail()}
                        >
                          <Text
                            className="text-lg text-white"
                            style={{ fontFamily: "Nunito" }}
                          >
                            Sign In
                          </Text>
                        </Pressable>
                      </View>
                      <View className="mt-3">
                        <Pressable
                          className="bg-red-500 px-3 py-4 rounded-[20px] items-center"
                          disabled={loading}
                          onPress={() => signUpWithEmail()}
                        >
                          <Text
                            className="text-lg text-white"
                            style={{ fontFamily: "Nunito" }}
                          >
                            Sign Up
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground >
  );
}

