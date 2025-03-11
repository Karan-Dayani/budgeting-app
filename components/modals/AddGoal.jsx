import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native'
import React from 'react'
import CustomText from '../CustomText'

const AddGoal = ({ handleAddGoalChange, setModalVisible, goal, handleAddGoal, loading, colors }) => {

    return (
        <View className="flex-1 justify-end  bg-opacity-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
            <CustomText
                className="text-white text-3xl pl-3 pb-2 font-semibold"
                style={{ fontFamily: "Poppins_SemiBold" }}
            >
                Add Goal
            </CustomText>
            <View className=" p-6 rounded-t-3xl w-full pb-10" style={{ backgroundColor: colors.expenseForm }}>
                <View className="mb-2">
                    <CustomText className="text-2xl mb-2" style={{ color: colors.text }}>
                        Name
                    </CustomText>
                    <TextInput
                        value={goal.goalName}
                        onChangeText={(value) => handleAddGoalChange("goalName", value)}
                        className="rounded-3xl mb-4 text-white p-4"
                        placeholderTextColor="#6b7280"
                        placeholder="Name"
                        style={{ backgroundColor: colors.expenseInput }}
                    />
                </View>
                <View className="mb-2">
                    <CustomText className="text-2xl mb-2" style={{ color: colors.text }}>
                        Goal
                    </CustomText>
                    <TextInput
                        value={goal.goalTargetMoney}
                        onChangeText={(value) => handleAddGoalChange("goalTargetMoney", value)}
                        className="rounded-3xl mb-4 text-white p-4"
                        placeholderTextColor="#6b7280"
                        placeholder="Goal"
                        keyboardType="numeric"
                        style={{ backgroundColor: colors.expenseInput }}
                    />
                </View>

                {loading
                    ?
                    <ActivityIndicator color="white" size={30} className="py-5" />
                    :
                    <View className="flex-row gap-x-3 mt-5">
                        {/* <Pressable
                            className="flex-1 p-3 bg-red-500 items-center rounded-xl"
                            onPress={() => setModalVisible(false)}
                        >
                            <CustomText className="text-white text-lg">Cancel</CustomText>
                        </Pressable> */}
                        <Pressable
                            className="flex-1 p-3 bg-[#57A6A1] items-center rounded-3xl"
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