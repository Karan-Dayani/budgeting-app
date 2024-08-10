import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const NoDataLoad = () => {
  return (
    <View style={styles.animationContainer}>
      <LottieView
        autoPlay
        loop
        style={{
          width: 278,
          height: 400,
          backgroundColor: "#0F0F0F",
        }}
        source={require("../assets/animations/Animation - 1719999846178 (1).json")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    backgroundColor: "#0F0F0F",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NoDataLoad;
