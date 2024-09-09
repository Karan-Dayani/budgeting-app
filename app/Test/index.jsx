import React, { useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const Testpage = () => {
  const scrollY = useRef(new Animated.Value(0)).current;

  // Interpolating animations
  const rightTextOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],  // Fades out as we scroll down
    extrapolate: 'clamp',
  });

  const leftTextTranslateX = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 150],  // Moves to center
    extrapolate: 'clamp',
  });

  const leftTextOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.7],  // Slight fade to keep it smooth
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header]}>
        {/* Left Text - Will move to center */}
        <Animated.Text
          style={[
            styles.leftText,
            { transform: [{ translateX: leftTextTranslateX }], opacity: leftTextOpacity }
          ]}
        >
          Left Text
        </Animated.Text>

        {/* Right Text - Will fade out */}
        <Animated.Text style={[styles.rightText, { opacity: rightTextOpacity }]}>
          Right Text
        </Animated.Text>
      </Animated.View>

      {/* Change ScrollView to Animated.ScrollView */}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={{ height: 1000 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  leftText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  rightText: {
    fontSize: 18,
    color: '#333',
  },
});

export default Testpage;
