import { View } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import SplashScreenLoad from "../screens/splashScreenLoad";

const Index = () => {
  const checkUserIncome = async (email) => {
    try {
      const { data, error } = await supabase
        .from("User Data")
        .select("income")
        .eq("email", email);
      if (error) {
        console.error("Error checking user income:", error);
        return null;
      }
      return data && data[0] ? data[0].income : null;
    } catch (err) {
      console.error("Unexpected error in checkUserIncome:", err);
      return null;
    }
  };
  useEffect(() => {
    let subscription = null;
    const delay = setTimeout(() => {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        try {
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
        } catch (e) {
          console.error("Error in getSession check:", e);
          router.replace("/(auth)/login");
        }
      }).catch((err) => {
        console.error("Failed to get session:", err);
        router.replace("/(auth)/login");
      });

      const authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
        try {
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
        } catch (e) {
          console.error("Error in onAuthStateChange check:", e);
          router.replace("/(auth)/login");
        }
      });
      subscription = authListener.data?.subscription;
    }, 2000);

    return () => {
      clearTimeout(delay);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#41B3A2" }}>
      <SplashScreenLoad />
    </View>
  );
};

export default Index;
