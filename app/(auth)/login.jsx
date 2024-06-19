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
} from "react-native";
import { supabase } from "../../lib/supabase";

import { Redirect, Stack } from "expo-router";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
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

    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
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
          <TextInput
            label="Email"
            leftIcon={{ type: "font-awesome", name: "envelope" }}
            onChangeText={(text) => setEmail(text)}
            value={email}
            className="placeholder-white border-2 p-2 rounded-lg bg-white text-black"
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
          <TextInput
            label="Password"
            leftIcon={{ type: "font-awesome", name: "lock" }}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            className="placeholder-white border-2 p-2 rounded-lg bg-white text-black"
            placeholder="Password"
            autoCapitalize={"none"}
          />
        </View>
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
      </View>
    </View>
  );
}
