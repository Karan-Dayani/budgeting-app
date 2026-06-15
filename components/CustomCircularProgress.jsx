import React, { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import CustomText from "./CustomText";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CustomCircularProgress = ({
  value = 0,
  radius = 35,
  strokeWidth,
  activeStrokeColor = "#57A6A1",
  inActiveStrokeColor = "#e6e6e6",
  progressValueColor = "#000",
  valueSuffix = "",
  maxValue = 100,
  inActiveStrokeOpacity = 1,
  duration = 800,
}) => {
  // Use a proportional stroke width if not specified
  const actualStrokeWidth = strokeWidth !== undefined ? strokeWidth : radius * 0.15;
  const circumference = 2 * Math.PI * radius;
  const halfCircle = radius + actualStrokeWidth;
  const size = halfCircle * 2;

  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Animate the value using timing
    Animated.timing(animatedValue, {
      toValue: Math.min(value, maxValue),
      duration: duration,
      useNativeDriver: false, // SVG strokeDashoffset is not supported by native animated driver
    }).start();

    // Listen to animated changes to animate the text in center
    const listenerId = animatedValue.addListener((v) => {
      setDisplayValue(Math.round(v.value));
    });

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [value, maxValue]);

  // Interpolate the dash offset from fully empty (circumference) to fully filled (0)
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, maxValue],
    outputRange: [circumference, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center", position: "relative" }}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <G transform={`rotate(-90 ${halfCircle} ${halfCircle})`}>
          {/* Inactive Circle */}
          <Circle
            cx={halfCircle}
            cy={halfCircle}
            r={radius}
            fill="transparent"
            stroke={inActiveStrokeColor}
            strokeWidth={actualStrokeWidth}
            strokeOpacity={inActiveStrokeOpacity}
          />
          {/* Active Circle */}
          <AnimatedCircle
            cx={halfCircle}
            cy={halfCircle}
            r={radius}
            fill="transparent"
            stroke={activeStrokeColor}
            strokeWidth={actualStrokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      {/* Text inside the circle */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CustomText
          style={{
            fontSize: radius * 0.45,
            fontFamily: "Poppins_SemiBold",
            color: progressValueColor,
            textAlign: "center",
          }}
        >
          {displayValue}
          {valueSuffix}
        </CustomText>
      </View>
    </View>
  );
};

export default CustomCircularProgress;
