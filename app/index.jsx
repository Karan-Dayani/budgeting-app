import { View, Animated } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import { supabase } from "../lib/supabase";
import SplashScreenLoad from "../screens/splashScreenLoad";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../components/globalState/authStore";

const Index = () => {
  const { colors } = useTheme();
  const [fadeAnim] = useState(() => new Animated.Value(1));
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const [targetRoute, setTargetRoute] = useState(null);

  const { user, loading: authLoading } = useAuthStore();

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
    let active = true;

    const performAuthCheck = async () => {
      if (authLoading) return;

      try {
        if (user) {
          const hasIncome = await checkUserIncome(user.email);
          if (!active) return;
          if (hasIncome) {
            setTargetRoute("/(tabs)/Home");
          } else {
            setTargetRoute("/UserDetails");
          }
        } else {
          const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");
          if (!active) return;
          if (hasSeenOnboarding === "true") {
            setTargetRoute("/(auth)/login");
          } else {
            setTargetRoute("/onboarding");
          }
        }
      } catch (e) {
        console.error("Error in auth check:", e);
        if (active) setTargetRoute("/(auth)/login");
      } finally {
        if (active) {
          setIsSessionLoaded(true);
        }
      }
    };

    performAuthCheck();

    // Safety timeout: force progress after 3 seconds in case video listener fails
    const safetyTimeout = setTimeout(() => {
      if (active) {
        setIsVideoFinished(true);
      }
    }, 3000);

    return () => {
      active = false;
      clearTimeout(safetyTimeout);
    };
  }, [user, authLoading]);

  // Trigger smooth transition when both the video is finished and auth status is resolved
  useEffect(() => {
    if (isSessionLoaded && isVideoFinished && targetRoute) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        router.replace(targetRoute);
      });
    }
  }, [isSessionLoaded, isVideoFinished, targetRoute]);

  // Determine root background color to match the landing page (prevents flashbang)
  const rootBg = colors.background || "#121212";

  const initialBg = colors.background || "#121212";

  return (
    <View style={{ flex: 1, backgroundColor: isSessionLoaded ? rootBg : initialBg }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <SplashScreenLoad onAnimationFinish={() => setIsVideoFinished(true)} />
      </Animated.View>
    </View>
  );
};

export default Index;
