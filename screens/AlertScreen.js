import React from "react";
import { View, StyleSheet, Text } from "react-native";
import LottieView from "lottie-react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "../components/CustomText";

const AlertScreen = () => {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: "center" }}>
      <LottieView
        autoPlay
        loop
        style={{
          width: 278,
          height: 200,
        }}
        source={require("../assets/animations/Alert3.json")}
      />
      <View
        style={{
          width: "100%",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: colors.inputBg,
            position: "absolute",
            bottom: 0,
            alignItems: "center",
            width: "80%",
          }}
        >
          <CustomText style={{ color: colors.text, fontSize: 20 }} />
        </View>
      </View>
    </View>
  );
};

export default AlertScreen;
