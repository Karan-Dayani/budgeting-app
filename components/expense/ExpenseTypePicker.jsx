import { View, Pressable, Animated, Dimensions } from 'react-native'
import React, { useEffect, useRef } from 'react'
import CustomText from '../CustomText'
import { useTheme } from 'native-base'

const ExpenseTypePicker = ({ setActiveTab, activeTab }) => {
    const { colors } = useTheme()
    const screenWidth = Dimensions.get('window').width


    const slideAnim = useRef(new Animated.Value(0)).current
    const tabWidth = (screenWidth - 36) / 2

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: activeTab === "Recurring" ? tabWidth : 0,
            duration: 200,
            useNativeDriver: true,
        }).start()
    }, [activeTab])

    return (
        <View className="relative flex-row mt-2 mb-4  rounded-3xl" style={{ backgroundColor: colors.inputBg }} >
            {/* Sliding background */}
            <Animated.View
                style={{
                    position: 'absolute',
                    width: tabWidth,
                    height: '100%',
                    backgroundColor: "#57A6A1",
                    borderRadius: 50,
                    transform: [{ translateX: slideAnim }],
                }}
            />

            {/* Non-Recurring Tab */}
            <Pressable
                className="flex-1 p-3 rounded-3xl z-10"
                onPress={() => setActiveTab("Non-Recurring")}

            >
                <CustomText
                    style={{
                        color: activeTab === "Non-Recurring" ? "#fff" : colors.text,
                    }}
                    className="text-lg text-center"
                >
                    Non-Recurring
                </CustomText>
            </Pressable>

            {/* Recurring Tab */}
            <Pressable
                className="flex-1 p-3 rounded-3xl"
                onPress={() => setActiveTab("Recurring")}

            >
                <CustomText
                    style={{
                        color: activeTab === "Recurring" ? "#fff" : colors.text,
                    }}
                    className="text-lg text-center"
                >
                    Recurring
                </CustomText>
            </Pressable>
        </View>
    )
}

export default ExpenseTypePicker
