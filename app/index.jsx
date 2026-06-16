import { View, Animated } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import { supabase } from "../lib/supabase";
import SplashScreenLoad from "../screens/splashScreenLoad";

const Index = () => {
  const { colors } = useTheme();
  const [fadeAnim] = useState(() => new Animated.Value(1));
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const [targetRoute, setTargetRoute] = useState(null);

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

  // Perform session check immediately on mount
  useEffect(() => {
    let active = true;

    const performAuthCheck = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;

        if (session) {
          const hasIncome = await checkUserIncome(session.user.email);
          if (hasIncome) {
            setTargetRoute("/(tabs)/Home");
          } else {
            setTargetRoute("/UserDetails/");
          }
        } else {
          setTargetRoute("/(auth)/login");
        }
      } catch (e) {
        console.error("Error in auth check:", e);
        setTargetRoute("/(auth)/login");
      } finally {
        if (active) {
          setIsSessionLoaded(true);
        }
      }
    };

    performAuthCheck();

    // Setup listener for real-time auth changes
    const authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      try {
        if (session) {
          const hasIncome = await checkUserIncome(session.user.email);
          if (hasIncome) {
            setTargetRoute("/(tabs)/Home");
          } else {
            setTargetRoute("/UserDetails/");
          }
        } else {
          setTargetRoute("/(auth)/login");
        }
      } catch (e) {
        console.error("Error in onAuthStateChange check:", e);
        setTargetRoute("/(auth)/login");
      }
    });

    // Safety timeout: force progress after 3 seconds in case video listener fails
    const safetyTimeout = setTimeout(() => {
      if (active) {
        setIsVideoFinished(true);
      }
    }, 3000);

    return () => {
      active = false;
      clearTimeout(safetyTimeout);
      if (authListener.data?.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

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
  const rootBg = targetRoute === "/(auth)/login"
    ? "#FFFFFF" // Login screen background color
    : colors.background || "#121212"; // Home screen theme background color

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
