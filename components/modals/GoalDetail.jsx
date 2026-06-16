import { View, TextInput, Pressable, ActivityIndicator, Animated, StyleSheet, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useTheme } from "expo-router/react-navigation";
import { Ionicons, Feather } from "@expo/vector-icons";

import CustomText from '../CustomText';
import CustomCircularProgress from '../CustomCircularProgress';
import { numberWithCommas } from '../../lib/utils';

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const GoalDetail = ({
    selectedGoal,
    setGoalDetailModal,
    setConfirmModal,
    handleGoalAmountAdd,
    loading
}) => {
    const { colors, dark } = useTheme();
    const [amount, setAmount] = useState("");

    // Animation values
    const [fadeAnim] = useState(() => new Animated.Value(0));
    const [slideAnim] = useState(() => new Animated.Value(SCREEN_HEIGHT * 0.7));

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
                toValue: SCREEN_HEIGHT * 0.7,
                duration: 180,
                useNativeDriver: true,
            })
        ]).start(() => {
            setGoalDetailModal(false);
        });
    };

    const handleAddMoney = () => {
        const numericAmount = Number(amount);
        handleGoalAmountAdd(numericAmount, handleClose);
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
                        numberOfLines={1}
                        style={[styles.headerTitle, { color: colors.text, fontFamily: "Poppins_Bold", flex: 1, marginRight: 12 }]}
                    >
                        {selectedGoal.goalName}
                    </CustomText>
                    <View style={styles.headerActions}>
                        <Pressable
                            onPress={() => setConfirmModal(true)}
                            style={({ pressed }) => [
                                styles.deleteBtn,
                                pressed && { opacity: 0.7 }
                            ]}
                        >
                            <Feather name="trash-2" size={20} color="#EF4444" />
                        </Pressable>
                    </View>
                </View>

                {/* Circular Progress & Info */}
                <View className="items-center mb-6">
                    <View className="mb-4">
                        <CustomCircularProgress
                            key={selectedGoal.goalId}
                            value={
                                selectedGoal.goalTargetMoney > 0
                                    ? Math.round(
                                        (Number(selectedGoal.goalSavedMoney) /
                                            Number(selectedGoal.goalTargetMoney)) *
                                        100
                                    )
                                    : 0
                            }
                            radius={80}
                            valueSuffix={"%"}
                            activeStrokeColor={colors.progressCircleColor}
                            inActiveStrokeColor={colors.progressInActive}
                            progressValueColor={colors.text}
                            maxValue={100}
                            inActiveStrokeOpacity={0.3}
                        />
                    </View>
                    <CustomText
                        className="text-2xl font-bold mt-2"
                        style={{ color: colors.text, fontFamily: "Poppins_Bold" }}
                    >
                        ₹{numberWithCommas(Number(selectedGoal.goalSavedMoney))}
                    </CustomText>
                    <CustomText className="text-sm mt-1 text-gray-500" style={{ fontFamily: "Jost" }}>
                        saved of ₹{numberWithCommas(Number(selectedGoal.goalTargetMoney))}
                    </CustomText>
                </View>

                {/* Add Savings input */}
                <CustomText className="text-base mb-2 font-semibold" style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}>
                    Add Savings
                </CustomText>
                <TextInput
                    placeholder="Enter amount to add"
                    value={amount}
                    className="p-4 mb-5 rounded-[20px] w-full text-base border"
                    placeholderTextColor={colors.text + '66'}
                    keyboardType="numeric"
                    onChangeText={setAmount}
                    style={{
                        backgroundColor: colors.expenseInput,
                        color: colors.text,
                        borderColor: colors.inputBg,
                        fontFamily: "Jost"
                    }}
                />

                {/* Actions Footer */}
                {loading ? (
                    <ActivityIndicator color="#41B3A2" size="large" className="py-4" />
                ) : (
                    <View className="flex-row gap-3">
                        <Pressable
                            style={{ backgroundColor: colors.expenseInput }}
                            className={`flex-1 p-4 items-center rounded-[20px] active:scale-95 transition-transform`}
                            onPress={handleClose}
                        >
                            <CustomText className="text-base font-semibold" style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}>
                                Cancel
                            </CustomText>
                        </Pressable>
                        <Pressable

                            className="flex-1 p-4 items-center rounded-[20px] shadow-sm bg-[#41B3A2] active:bg-[#379288] active:scale-95 transistion-transform"
                            onPress={handleAddMoney}
                        >
                            <CustomText className="text-white text-base font-bold" style={{ fontFamily: "Poppins_Bold" }}>
                                Add Money
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
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    deleteBtn: {
        padding: 6,
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderRadius: 20,
    },
    closeBtn: {
        padding: 4,
    }
});

export default GoalDetail;
