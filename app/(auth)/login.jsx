import React, { useState } from "react";
import {
  Alert,
  View,
  ActivityIndicator,
  Pressable,
  ImageBackground,
  Text
} from "react-native";
import { supabase } from "../../lib/supabase";
import { Stack } from "expo-router";
import { Icon, Input, useTheme } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";

export default function Auth() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { colors } = useTheme();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    setLoading(false);
    if (error) Alert.alert(error.message);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { data: { session }, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    const addUser = async () => {
      const { data, err } = await supabase
        .from("User Data")
        .insert([{ email: email }]);
    };

    if (error) Alert.alert(error.message);
    if (!session) {
      addUser();
      Alert.alert("Please check your inbox for email verification!");
    }
    setLoading(false);
  }

  return (
    <ImageBackground
      source={require("../../assets/images/CoinTrackLogin.png")}
      className="flex-1 bg-cover"
    >
      <View className="h-full pt-24 px-8 pb-24 justify-between">
        <Stack.Screen options={{ headerShown: false }} />
        <View>

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
        <View className="px-8 py-10 rounded-3xl jus" style={{ backgroundColor: colors.expenseForm }}>
          <View>
            <View >
              <Text
                className="text-xl mb-2 "
                style={{ fontFamily: "Nunito", color: colors.text }}
              >
                Email
              </Text>
              <Input
                label="Email"
                InputLeftElement={
                  <Icon
                    as={<MaterialIcons name="person" />}
                    size={5}
                    ml="5"
                    color="muted.400"
                  />
                }
                color={colors.text}
                onChangeText={(text) => setEmail(text)}
                value={email}
                rounded="20px"
                padding="4"
                borderWidth="0"
                backgroundColor={colors.loginInput}
                placeholder="email@address.com"
                autoCapitalize={"none"}
                cursorColor={colors.text}
              />
            </View>
            <View>
              <Text
                className="text-xl mb-2 mt-2"
                style={{ fontFamily: "Nunito", color: colors.text }}
              >
                Password
              </Text>
              <Input
                label="Password"
                type={show ? "text" : "password"}
                InputRightElement={
                  <Pressable onPress={() => setShow(!show)}>
                    <Icon
                      as={
                        <MaterialIcons
                          name={show ? "visibility" : "visibility-off"}
                        />
                      }
                      size={5}
                      mr="5"
                      color="muted.400"
                    />
                  </Pressable>
                }
                color={colors.text}
                rounded="20px"
                padding="4"
                onChangeText={(text) => setPassword(text)}
                value={password}
                borderWidth="0"
                backgroundColor={colors.loginInput}
                placeholder="Password"
                autoCapitalize={"none"}
                cursorColor={colors.text}
                marginBottom={8}
              />
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
    </ImageBackground>
  );
}

