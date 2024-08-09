import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Redirect, router } from "expo-router";
import { supabase } from "../lib/supabase";
import SplashScreenLoad from "../screens/splashScreenLoad";

const Index = () => {

  const checkUserIncome = async (email) => {
    const { data, error } = await supabase
      .from('User Data')
      .select('income')
      .eq('email', email);

    return data && data[0].income;
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          const hasIncome = await checkUserIncome(session.user.email)
          if (hasIncome) {
            router.replace("/(tabs)/");
          } else {
            router.replace("/profile/");
          }
        } else {
          router.replace("/(auth)/login");
        }
      });
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          const hasIncome = await checkUserIncome(session.user.email)
          if (hasIncome) {
            router.replace("/(tabs)/");
          } else {
            router.replace("/profile/");
          }
        } else {
          router.replace("/(auth)/login");
        }
      });
    }, 2000); // 2000 milliseconds = 2 seconds

    return () => clearTimeout(delay); // Clear timeout on unmount
  }, []);

  return <SplashScreenLoad />;
};

export default Index;
