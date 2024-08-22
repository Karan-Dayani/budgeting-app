import React from "react";
import { View, StyleSheet, Text } from "react-native";
import LottieView from "lottie-react-native";
import { useTheme } from "@react-navigation/native";

const NoDataLoad = () => {
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
          bottom: 65,
          paddingHorizontal: 100,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 30, fontFamily: "Jost" }}>
          No data
        </Text>
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
