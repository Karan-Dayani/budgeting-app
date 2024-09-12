import React from "react";
import { StyleSheet, StatusBar, View } from "react-native";
import { Video } from "expo-av";
import { useTheme } from "@react-navigation/native";

const SplashScreenLoad = ({ onAnimationFinish = (isCancelled) => {} }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <Video
        source={require("../assets/videos/CointTrack.mp4")}
        style={styles.video}
        resizeMode="cover"
        shouldPlay
        isLooping={false}
        isMuted={true}
        useNativeControls={false}
        progressUpdateIntervalMillis={500}
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish) {
            onAnimationFinish(false);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

export default SplashScreenLoad;
