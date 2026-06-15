import React from "react";
import { StyleSheet, StatusBar, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEventListener } from "expo";
import { useTheme } from "expo-router/react-navigation";

const SplashScreenLoad = ({ onAnimationFinish = (isCancelled) => { } }) => {
  const { colors } = useTheme();

  const player = useVideoPlayer(require("../assets/videos/CointTrack.mp4"), (playerInstance) => {
    playerInstance.loop = false;
    playerInstance.muted = true;
    playerInstance.play();
  });

  useEventListener(player, "playToEnd", () => {
    onAnimationFinish(false);
  });

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <VideoView
        player={player}
        style={styles.video}
        nativeControls={false}
        contentFit="cover"
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
