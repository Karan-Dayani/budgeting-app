import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native'
import CustomText from '../CustomText'

const AddGoal = ({ handleAddGoalChange, setModalVisible, goal, handleAddGoal, loading }) => {
    const { colors } = useTheme()
    return (
        <View className="flex-1 justify-center items-center bg-opacity-50 p-3" style={{ backgroundColor: colors.background }}>
            <View className=" p-6 rounded-xl w-11/12" style={{ backgroundColor: colors.inputBg }}>
                <CustomText className="text-xl mb-4 text-center" style={{ color: colors.text }}>
                    Set a Goal
                </CustomText>
                <TextInput
                    value={goal.goalName}
                    onChangeText={(value) => handleAddGoalChange("goalName", value)}
                    className="rounded-xl mb-4 text-white p-4 bg-[#212121]"
                    placeholderTextColor="white"
                    placeholder="Enter your goal"
                />
                <TextInput
                    value={goal.goalTargetMoney}
                    onChangeText={(value) => handleAddGoalChange("goalTargetMoney", value)}
                    className="rounded-xl mb-4 text-white p-4 bg-[#212121]"
                    placeholderTextColor="white"
                    placeholder="Target amount"
                    keyboardType="numeric"
                />
                {loading
                    ?
                    <ActivityIndicator color="white" size={30} className="py-5" />
                    :
                    <View className="flex-row gap-x-3 mt-3">
                        <Pressable
                            className="flex-1 p-3 bg-red-500 items-center rounded-xl"
                            onPress={() => setModalVisible(false)}
                        >
                            <CustomText className="text-white text-lg">Cancel</CustomText>
                        </Pressable>
                        <Pressable
                            className="flex-1 p-3 bg-blue-500 items-center rounded-xl"
                            onPress={handleAddGoal}
                        >
                            <CustomText className="text-white text-lg">Save</CustomText>
                        </Pressable>
                    </View>
                }

            </View>
        </View>
    )
}

export default AddGoal