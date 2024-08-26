import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { useTheme } from "@react-navigation/native";

const SplashScreenLoad = ({ onAnimationFinish = (isCancelled) => {} }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.background,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LottieView
        autoPlay
        loop={false}
        style={{
          width: 298,
          height: 298,
          backgroundColor: colors.background,
          marginBottom: 85,
        }}
        source={require("../assets/animations/Animation - 1719931728055.json")}
        onAnimationFinish={onAnimationFinish}
      />
    </View>
  );
};

export default SplashScreenLoad;
