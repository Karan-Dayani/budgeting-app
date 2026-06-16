import { View, Pressable, Animated, StyleSheet, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useTheme } from "expo-router/react-navigation";
import { Ionicons } from "@expo/vector-icons";

import CustomText from '../CustomText';

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const MonthGridItem = ({ item, isSelected, colors, onPress }) => {
    const [scale] = useState(() => new Animated.Value(1));

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
                            ? (colors.tabBarBtActive || "#41B3A2")
                            : colors.inputBg,
                        borderColor: "transparent",
                        transform: [{ scale }]
                    }
                ]}
            >
                <CustomText
                    style={[
                        styles.gridItemText,
                        {
                            color: isSelected ? "#FFFFFF" : colors.text,
                            fontWeight: isSelected ? "700" : "500",
                        }
                    ]}
                >
                    {item.slice(0, 3)}
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

const MonthPicker = ({ setShowModal, setFilters, filters }) => {
    const { colors, dark } = useTheme();

    // Months list
    const months = Array.from({ length: 12 }, (_, i) =>
        new Date(2000, i).toLocaleString("default", { month: "long" })
    );

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
                        Select Month
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
                    {months.map((item, i) => (
                        <MonthGridItem
                            key={i}
                            item={item}
                            isSelected={filters.month === item}
                            colors={colors}
                            onPress={() => {
                                setFilters({ ...filters, month: item });
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
        aspectRatio: 1.35,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        position: "relative",
    },
    gridItemText: {
        fontSize: 16,
    },
    checkmarkBadge: {
        position: "absolute",
        top: 6,
        right: 6,
    }
});

export default MonthPicker;
