import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const ONBOARDING_DATA = [
  {
    id: "1",
    title: "Smart Spending",
    subtitle: "Take absolute control of your money",
    description: "Instantly track your daily expenses, view intuitive categorization, and monitor your monthly limits without any hassle.",
    icon: "wallet-outline",
    iconColor: "#41B3A2",
    bgCircle: "rgba(65, 179, 162, 0.15)"
  },
  {
    id: "2",
    title: "Interactive Goals",
    subtitle: "Turn savings into a fun habit",
    description: "Create custom milestones, transfer liquid funds, and watch your targets fill up with gorgeous, animated progress rings.",
    icon: "trophy-outline",
    iconColor: "#42A5F5",
    bgCircle: "rgba(66, 165, 245, 0.15)"
  },
  {
    id: "3",
    title: "Intelligent Guard",
    subtitle: "Your financial sentinel",
    description: "Never worry about overspending. CoinTrack automatically blocks overdraft transactions and alerts you when your liquid savings run low.",
    icon: "shield-checkmark-outline",
    iconColor: "#FF7043",
    bgCircle: "rgba(255, 112, 67, 0.15)"
  }
];

export default function Onboarding() {
  const { colors, dark } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = async () => {
    if (activeIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      await completeOnboarding();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error setting onboarding complete", error);
      router.replace("/(auth)/login");
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.slide, { width }]}>
        {/* Visual Illustration Container */}
        <View style={styles.imageContainer}>
          <View style={[styles.iconBg, { backgroundColor: item.bgCircle }]}>
            <Ionicons name={item.icon} size={90} color={item.iconColor} />
          </View>
        </View>

        {/* Text Contents */}
        <View style={styles.textContainer}>
          <Text style={[styles.subtitle, { color: item.iconColor }]} numberOfLines={1}>
            {item.subtitle.toUpperCase()}
          </Text>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.description, { color: dark ? "#A0AEC0" : "#4B5563" }]}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={dark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header with Skip Button */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={[styles.logoDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.logoText, { color: colors.text }]}>CoinTrack</Text>
        </View>
        
        {activeIndex < ONBOARDING_DATA.length - 1 && (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.primary }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Pager FlatList */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
        bounces={false}
      />

      {/* Footer Area with Dots & Action Button */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.indicatorContainer}>
          {ONBOARDING_DATA.map((_, index) => {
            const isActive = index === activeIndex;
            return (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: isActive
                      ? colors.primary
                      : dark
                      ? "#374151"
                      : "#E5E7EB",
                    width: isActive ? 24 : 8,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.primaryButtonText}>
            {activeIndex === ONBOARDING_DATA.length - 1
              ? "Get Started"
              : "Continue"}
          </Text>
          <Ionicons
            name={
              activeIndex === ONBOARDING_DATA.length - 1
                ? "arrow-forward"
                : "chevron-forward"
            }
            size={18}
            color="#FFFFFF"
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    height: 60,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  logoText: {
    fontSize: 18,
    fontFamily: "Poppins_Bold",
    letterSpacing: 0.5,
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  skipText: {
    fontSize: 15,
    fontFamily: "Poppins_SemiBold",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  imageContainer: {
    height: height * 0.35,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBg: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: (width * 0.5) / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Poppins_Bold",
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins_Bold",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 34,
  },
  description: {
    fontSize: 15,
    fontFamily: "Nunito",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: height * 0.05,
    alignItems: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 28,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_SemiBold",
    letterSpacing: 0.5,
  },
});
