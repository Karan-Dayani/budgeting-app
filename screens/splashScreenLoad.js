import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const SplashScreenLoad = ({ onAnimationFinish = (isCancelled) => {} }) => {
  return (
    <View style={styles.animationContainer}>
      <LottieView
        autoPlay
        loop={false}
        style={{
          width: 278,
          height: 278,
          backgroundColor: "#191A19",
          marginBottom: 85,
        }}
        source={require("../assets/animations/Animation - 1719931728055.json")}
        onAnimationFinish={onAnimationFinish}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    backgroundColor: "#191A19",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SplashScreenLoad;
