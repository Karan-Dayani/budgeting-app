import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  AppState,
  TextInput,
  Button,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../lib/supabase";

import { Redirect, Stack } from "expo-router";
import { Icon, Input } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [show, setShow] = React.useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
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
    <View className="h-full justify-center px-5 ">
      <Stack.Screen options={{ headerShown: false }} />
      <View className=" bg-[#191A19] pb-8 justify-center rounded-xl px-5">

        <Text
          className="text-white text-2xl text-center mt-5"
          style={{ fontFamily: "Nunito" }}
        >
          Login
        </Text>
        <View className="">
          <Text
            className="text-xl text-white mb-2 mt-5"
            style={{ fontFamily: "Nunito" }}
          >
            Email
          </Text>
          <Input
            label="Email"
            InputLeftElement={
              <Icon
                as={<MaterialIcons name="person" />}
                size={5}
                ml="2"
                color="muted.400"
              />
            }
            color="muted.50"
            onChangeText={(text) => setEmail(text)}
            value={email}
            rounded="lg"
            placeholder="email@address.com"
            autoCapitalize={"none"}
          />
        </View>
        <View>
          <Text
            className="text-xl text-white mb-2 mt-2"
            style={{ fontFamily: "Nunito" }}
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
                  mr="2"
                  color="muted.400"
                />
              </Pressable>
            }
            color="muted.50"
            rounded="lg"
            onChangeText={(text) => setPassword(text)}
            value={password}

            placeholder="Password"
            autoCapitalize={"none"}
          />
        </View>
        {loading ? (
          <ActivityIndicator color="white" className="pt-10" size={25} />
        ) : (
          <>
            <View className="mt-5 ">
              <Pressable
                className="bg-cardColor p-2 rounded-lg items-center"
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
                className="bg-green-600 p-2 rounded-lg items-center"
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
  );
}
