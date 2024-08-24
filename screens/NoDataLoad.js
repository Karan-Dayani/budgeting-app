import React from "react";
import { View, StyleSheet, Text } from "react-native";
import LottieView from "lottie-react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "../components/CustomText";

const NoDataLoad = ({ selectedDate }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.animationContainer}>
      <LottieView
        autoPlay
        loop
        style={{
          width: 278,
          height: 400,
        }}
        source={require("../assets/animations/Animation - 1719999846178 (1).json")}
      />
      <View
        style={{
          backgroundColor: colors.background,
          position: "absolute",
          bottom: 55,
          alignItems: "center",
          width: "100%",
        }}
      >
        <CustomText style={{ color: colors.text, fontSize: 20 }}>
          No data
        </CustomText>
        <CustomText style={{ color: colors.text, fontSize: 20 }}>
          {selectedDate}
        </CustomText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NoDataLoad;
