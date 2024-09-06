import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native'
import CustomText from '../CustomText'

const ExpenseTypePicker = ({ setActiveTab, activeTab }) => {

    const { colors } = useTheme()

    return (
        <View className="flex-row mt-2 mb-4 gap-x-4">
            <Pressable
                className="flex-1 p-3 rounded-3xl"
                onPress={() => setActiveTab("Non-Recurring")}
                style={{
                    backgroundColor:
                        activeTab === "Non-Recurring" ? "#57A6A1" : colors.inputBg,
                }}
            >
                <CustomText
                    style={{ color: colors.text }}
                    className="text-lg text-center"
                >
                    Non-Recurring
                </CustomText>
            </Pressable>

            <Pressable
                className="flex-1 p-3 rounded-3xl"
                onPress={() => setActiveTab("Recurring")}
                style={{
                    backgroundColor:
                        activeTab === "Recurring" ? "#57A6A1" : colors.inputBg,
                }}
            >
                <CustomText
                    style={{ color: colors.text }}
                    className="text-lg text-center"
                >
                    Recurring
                </CustomText>
            </Pressable>
        </View>
    )
}

export default ExpenseTypePicker