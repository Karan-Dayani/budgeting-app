import React from "react";
import { View, StyleSheet, Text } from "react-native";
import LottieView from "lottie-react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "../components/CustomText";

const SuccessAlert = () => {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: "center" }}>
      <LottieView
        autoPlay
        loop={false}
        style={{
          width: 278,
          height: 200,
        }}
        source={require("../assets/animations/Check.json")}
      />
      <View
        style={{
          width: "100%",
          alignItems: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.inputBg,
            position: "absolute",
            bottom: 2,
            right: 35,
            alignItems: "center",
            width: "25%",
            height: 15,
            borderRadius: 200,
          }}
        >
          <CustomText style={{ color: colors.text, fontSize: 20 }} />
        </View>
      </View>
    </View>
  );
};

export default SuccessAlert;
