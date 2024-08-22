import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native'

const AddGoal = ({ handleAddGoalChange, setModalVisible, goal, handleAddGoal, loading }) => {
    const { colors } = useTheme()
    return (
        <View className="flex-1 justify-center items-center bg-opacity-50" style={{ backgroundColor: colors.background }}>
            <View className=" p-5 rounded-3xl w-11/12" style={{ backgroundColor: colors.inputBg }}>
                <Text className=" text-xl mb-3" style={{ fontFamily: "Nunito", color: colors.text }}>
                    Set a Goal
                </Text>
                <TextInput
                    value={goal.goalName}
                    onChangeText={(value) => handleAddGoalChange("goalName", value)}
                    className="rounded-3xl mb-4 text-white p-4 bg-[#31363F]"
                    placeholderTextColor="white"
                    placeholder="Enter your goal"
                />
                <TextInput
                    value={goal.goalTargetMoney}
                    onChangeText={(value) => handleAddGoalChange("goalTargetMoney", value)}
                    className="rounded-3xl mb-4 text-white p-4 bg-[#31363F]"
                    placeholderTextColor="white"
                    placeholder="Target amount"
                    keyboardType="numeric"
                />
                {loading
                    ?
                    <ActivityIndicator color="white" size={30} className="py-5" />
                    :
                    <View className="flex-row gap-2">
                        <Pressable
                            className="flex-1 p-3 bg-red-500 items-center rounded-3xl"
                            onPress={() => setModalVisible(false)}
                        >
                            <Text className="text-white text-lg">Cancel</Text>
                        </Pressable>
                        <Pressable
                            className="flex-1 p-3 bg-blue-500 items-center rounded-3xl"
                            onPress={handleAddGoal}
                        >
                            <Text className="text-white text-lg">Save</Text>
                        </Pressable>
                    </View>
                }

            </View>
        </View>
    )
}

export default AddGoal