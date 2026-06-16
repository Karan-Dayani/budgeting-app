import { View, Pressable, Animated, StyleSheet, Dimensions } from "react-native";
import React, { useState, useEffect } from "react";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";

import CustomText from "../CustomText";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Specific category thematic colors (Primary color & Pastel Tint for background)
const categoryThemes = {
  "Food": { primary: "#FF7043", tint: "rgba(255, 112, 67, 0.12)" },
  "Clothing": { primary: "#AB47BC", tint: "rgba(171, 71, 188, 0.12)" },
  "Entertainment": { primary: "#29B6F6", tint: "rgba(41, 182, 246, 0.12)" },
  "Groceries": { primary: "#66BB6A", tint: "rgba(102, 187, 106, 0.12)" },
  "Utilities": { primary: "#FFA726", tint: "rgba(255, 167, 38, 0.12)" },
  "Travel": { primary: "#26A69A", tint: "rgba(38, 166, 154, 0.12)" },
  "Rent": { primary: "#EC407A", tint: "rgba(236, 64, 122, 0.12)" },
  "Education": { primary: "#5C6BC0", tint: "rgba(92, 107, 192, 0.12)" },
  "Other": { primary: "#8D6E63", tint: "rgba(141, 110, 99, 0.12)" },
};

const CategoryGridItem = ({ item, isSelected, colors, onPress }) => {
  const [scale] = useState(() => new Animated.Value(1));
  const themeInfo = categoryThemes[item.label] || { primary: "#41B3A2", tint: "rgba(65, 179, 162, 0.12)" };

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={styles.gridItemWrapper}
    >
      <Animated.View
        style={[
          styles.gridItem,
          {
            backgroundColor: isSelected
              ? themeInfo.primary
              : colors.inputBg,
            borderColor: "transparent",
            transform: [{ scale }]
          }
        ]}
      >
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isSelected
                ? "rgba(255, 255, 255, 0.22)"
                : themeInfo.tint,
            }
          ]}
        >
          <FontAwesome5
            name={item.icon}
            size={18}
            color={isSelected ? "#FFFFFF" : themeInfo.primary}
          />
        </View>
        <CustomText
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.gridItemText,
            {
              color: isSelected ? "#FFFFFF" : colors.text,
              fontWeight: isSelected ? "700" : "500",
            }
          ]}
        >
          {item.label}
        </CustomText>
        {isSelected && (
          <View style={styles.checkmarkBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const CategoryPicker = ({ setShowModal, setFilters, filters }) => {
  const { colors, dark } = useTheme();

  const CategoryData = [
    { label: "Food", value: "Food", icon: "utensils" },
    { label: "Clothing", value: "Clothing", icon: "font-awesome-alt" },
    { label: "Entertainment", value: "Entertainment", icon: "film" },
    { label: "Groceries", value: "Groceries", icon: "shopping-cart" },
    { label: "Utilities", value: "Utilities", icon: "bolt" },
    { label: "Travel", value: "Travel", icon: "plane" },
    { label: "Rent", value: "Rent", icon: "home" },
    { label: "Education", value: "Education", icon: "book" },
    { label: "Other", value: "Other", icon: "ellipsis-h" },
  ];

  // Animation values
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(SCREEN_HEIGHT * 0.4));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT * 0.4,
        duration: 180,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowModal(null);
    });
  };

  return (
    <View style={styles.modalOverlay}>
      {/* Absolute Backdrop Pressable covering the full screen */}
      <Pressable
        style={styles.backdropPressable}
        onPress={handleClose}
      >
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            }
          ]}
        />
      </Pressable>

      {/* Bottom Sheet Container */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            backgroundColor: colors.card,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        {/* Visual Grab Handle */}
        <View
          style={[
            styles.grabHandle,
            {
              backgroundColor: dark
                ? "rgba(255, 255, 255, 0.15)"
                : "rgba(0, 0, 0, 0.15)",
              }
            ]}
          />

          {/* Header Row */}
          <View style={styles.header}>
            <CustomText
              style={[styles.headerTitle, { color: colors.text }]}
            >
              Select Category
            </CustomText>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && { opacity: 0.7 }
              ]}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          {/* Grid Wrapper */}
          <View style={styles.gridContainer}>
            {CategoryData.map((item, i) => (
              <CategoryGridItem
                key={i}
                item={item}
                isSelected={filters.category === item.label}
                colors={colors}
                onPress={() => {
                  setFilters({ ...filters, category: item.label });
                  handleClose();
                }}
              />
            ))}
          </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  backdropPressable: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 24,
  },
  grabHandle: {
    width: 38,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  gridItemWrapper: {
    width: "31%",
    marginVertical: 6,
  },
  gridItem: {
    width: "100%",
    aspectRatio: 0.95,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  gridItemText: {
    fontSize: 14,
    textAlign: "center",
  },
  checkmarkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
  }
});

export default CategoryPicker;
