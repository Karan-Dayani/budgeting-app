import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Redirect, router } from "expo-router";
import { supabase } from "../lib/supabase";

const index = () => {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/(tabs)/");
      } else {
        console.log("no user");
      }
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/(tabs)/");
      } else {
        console.log("no user");
        router.replace("/(auth)/login");
      }
    });
  });
};

export default index;
