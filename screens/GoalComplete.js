import React from "react";
import { View, Text, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { useTheme } from "native-base";

const GoalComplete = () => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        height: "100%",
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{
          height: "90%",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: "100%",
            alignItems: "center",
          }}
        >
          <LottieView
            autoPlay
            loop={false}
            style={{
              width: 278,
              height: 300,
            }}
            source={require("../assets/animations/goalComplete.json")}
          />
          <View
            style={{
              backgroundColor: colors.background,
              position: "absolute",
              bottom: 10,
              alignItems: "center",
              width: "100%",
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontFamily: "Jost",
                fontSize: 30,
              }}
            >
              Goal Completed
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default GoalComplete;
