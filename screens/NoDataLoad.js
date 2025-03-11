import React from "react";
import { View, StyleSheet, Text } from "react-native";
import LottieView from "lottie-react-native";
import CustomText from "../components/CustomText";
import { useTheme } from "native-base";

const NoDataLoad = ({ filters }) => {
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
        source={require("../assets/animations/NoData.json")}
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
          {filters?.date}
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
