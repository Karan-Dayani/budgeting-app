import { View, Pressable, Animated, Dimensions } from 'react-native'
import React, { useEffect, useRef } from 'react'
import CustomText from '../CustomText'
import { useTheme } from "expo-router/react-navigation"

const ExpenseTypePicker = ({ setActiveTab, activeTab }) => {
    const { colors } = useTheme()
    const screenWidth = Dimensions.get('window').width
    const containerWidth = screenWidth - 48 // 24px padding on each side (px-6)
    const padding = 4
    const tabWidth = (containerWidth - (padding * 2)) / 2

    const slideAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: activeTab === "Recurring" ? tabWidth : 0,
            duration: 200,
            useNativeDriver: true,
        }).start()
    }, [activeTab, tabWidth])

    return (
        <View 
            className="relative flex-row mt-2 mb-4 rounded-full" 
            style={{ 
                backgroundColor: colors.inputBg,
                padding: padding,
                width: containerWidth,
                height: 50,
                alignItems: 'center'
            }} 
        >
            {/* Sliding background */}
            <Animated.View
                style={{
                    position: 'absolute',
                    width: tabWidth,
                    height: 42, // container height 50 - 8 (top/bottom padding)
                    backgroundColor: "#41B3A2",
                    borderRadius: 21,
                    top: padding,
                    left: padding,
                    transform: [{ translateX: slideAnim }],
                    shadowColor: "#41B3A2",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 4,
                }}
            />

            {/* Non-Recurring Tab */}
            <Pressable
                className="flex-1 h-full justify-center items-center z-10"
                onPress={() => setActiveTab("Non-Recurring")}
            >
                <CustomText
                    style={{
                        color: activeTab === "Non-Recurring" ? "#fff" : colors.text,
                        fontFamily: "Poppins_SemiBold",
                    }}
                    className="text-base text-center"
                >
                    Non-Recurring
                </CustomText>
            </Pressable>

            {/* Recurring Tab */}
            <Pressable
                className="flex-1 h-full justify-center items-center z-10"
                onPress={() => setActiveTab("Recurring")}
            >
                <CustomText
                    style={{
                        color: activeTab === "Recurring" ? "#fff" : colors.text,
                        fontFamily: "Poppins_SemiBold",
                    }}
                    className="text-base text-center"
                >
                    Recurring
                </CustomText>
            </Pressable>
        </View>
    )
}

export default ExpenseTypePicker;
