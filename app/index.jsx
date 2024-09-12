import { View } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import SplashScreenLoad from "../screens/splashScreenLoad";

const Index = () => {
  const checkUserIncome = async (email) => {
    const { data, error } = await supabase
      .from("User Data")
      .select("income")
      .eq("email", email);
    return data && data[0].income;
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          const hasIncome = await checkUserIncome(session.user.email);
          if (hasIncome) {
            router.replace("/(tabs)/Home");
          } else {
            router.replace("/UserDetails/");
          }
        } else {
          router.replace("/(auth)/login");
        }
      });

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          const hasIncome = await checkUserIncome(session.user.email);
          if (hasIncome) {
            router.replace("/(tabs)/Home");
          } else {
            router.replace("/UserDetails/");
          }
        } else {
          router.replace("/(auth)/login");
        }
      });
    }, 2000);

    return () => clearTimeout(delay);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#41B3A2" }}>
      <SplashScreenLoad />
    </View>
  );
};

export default Index;
