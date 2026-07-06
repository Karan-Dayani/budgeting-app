import { View, TextInput, Pressable, ActivityIndicator, Animated, StyleSheet, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useTheme } from "expo-router/react-navigation";
import { Ionicons } from "@expo/vector-icons";

import CustomText from '../CustomText';

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const AddGoal = ({ handleAddGoalChange, setModalVisible, goal, handleAddGoal, loading }) => {
    const { colors, dark } = useTheme();

    // Animation values
    const [fadeAnim] = useState(() => new Animated.Value(0));
    const [slideAnim] = useState(() => new Animated.Value(SCREEN_HEIGHT * 0.6));

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
                toValue: SCREEN_HEIGHT * 0.6,
                duration: 180,
                useNativeDriver: true,
            })
        ]).start(() => {
            setModalVisible(false);
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
                        backgroundColor: colors.expenseForm,
                        borderColor: colors.background + '15',
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
                        style={[styles.headerTitle, { color: colors.text, fontFamily: "Poppins_Bold" }]}
                    >
                        Create Goal
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

                {/* Goal Name Input */}
                <View className="mb-4">
                    <CustomText className="text-base mb-2 font-semibold" style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}>
                        Goal Name
                    </CustomText>
                    <TextInput
                        value={goal.goalName}
                        onChangeText={(value) => handleAddGoalChange("goalName", value)}
                        className="p-4 rounded-[20px] text-base border"
                        placeholderTextColor={colors.text + '66'}
                        placeholder="e.g. Travel Fund"
                        style={{
                            backgroundColor: colors.expenseInput,
                            color: colors.text,
                            borderColor: colors.inputBg,
                            fontFamily: "Poppins_Medium"
                        }}
                    />
                </View>

                {/* Target Amount Input */}
                <View className="mb-6">
                    <CustomText className="text-base mb-2 font-semibold" style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}>
                        Target Amount
                    </CustomText>
                    <TextInput
                        value={goal.goalTargetMoney ? String(goal.goalTargetMoney) : ""}
                        onChangeText={(value) => handleAddGoalChange("goalTargetMoney", value)}
                        className="p-4 rounded-[20px] text-base border"
                        placeholderTextColor={colors.text + '66'}
                        placeholder="₹0"
                        keyboardType="numeric"
                        style={{
                            backgroundColor: colors.expenseInput,
                            color: colors.text,
                            borderColor: colors.inputBg,
                            fontFamily: "Poppins_Medium"
                        }}
                    />
                </View>

                {loading ? (
                    <ActivityIndicator color="#41B3A2" size="large" className="py-4" />
                ) : (
                    <View className="flex-row gap-3">
                        <Pressable
                            style={{ backgroundColor: colors.expenseInput }}
                            className={`flex-1 p-4 items-center rounded-[20px] active:scale-95 transition-transform`}
                            onPress={() => setModalVisible(false)}
                        >
                            <CustomText className="text-base font-semibold" style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}>
                                Cancel
                            </CustomText>
                        </Pressable>
                        <Pressable
                            className="flex-1 p-4 items-center rounded-[20px] shadow-sm bg-[#41B3A2] active:bg-[#379288] active:scale-95 transition-transform"
                            onPress={handleAddGoal}
                        >
                            <CustomText className="text-white text-base font-bold" style={{ fontFamily: "Poppins_Bold" }}>
                                Create Goal
                            </CustomText>
                        </Pressable>
                    </View>
                )}
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
        borderTopWidth: 1,
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
        marginBottom: 20,
        paddingVertical: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    closeBtn: {
        padding: 4,
    }
});

export default AddGoal;