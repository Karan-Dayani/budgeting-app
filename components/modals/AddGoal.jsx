import { View, TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import React from 'react'
import CustomText from '../CustomText'

const AddGoal = ({ handleAddGoalChange, setModalVisible, goal, handleAddGoal, loading, colors }) => {
    return (
        <Pressable
            onPress={() => setModalVisible(false)}
            className="flex-1 justify-end" 
            style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
            <Pressable onPress={() => { }}>
                <CustomText
                    className="text-white text-3xl pl-3 pb-2 font-semibold"
                    style={{ fontFamily: "Poppins_SemiBold" }}
                >
                    Add Goal
                </CustomText>
                
                <View 
                    className="p-5 rounded-t-[28px] w-full" 
                    style={{ backgroundColor: colors.expenseForm, paddingBottom: 30 }}
                >
                    <View className="mt-3">
                        {/* Name Input */}
                        <CustomText className="text-xl mb-1" style={{ color: colors.text }}>
                            Name
                        </CustomText>
                        <TextInput
                            value={goal.goalName}
                            onChangeText={(value) => handleAddGoalChange("goalName", value)}
                            className="p-4 mb-4 rounded-3xl shadow-sm text-xl"
                            placeholderTextColor="gray"
                            placeholder="Enter goal name"
                            style={{ 
                                backgroundColor: colors.expenseInput, 
                                color: colors.text,
                                fontFamily: "Jost"
                            }}
                        />
                    </View>
                    
                    <View>
                        {/* Target Amount Input */}
                        <CustomText className="text-xl mb-1" style={{ color: colors.text }}>
                            Goal Amount
                        </CustomText>
                        <TextInput
                            value={goal.goalTargetMoney ? String(goal.goalTargetMoney) : ""}
                            onChangeText={(value) => handleAddGoalChange("goalTargetMoney", value)}
                            className="p-4 mb-4 rounded-3xl shadow-sm text-xl"
                            placeholderTextColor="gray"
                            placeholder="Enter target amount"
                            keyboardType="numeric"
                            style={{ 
                                backgroundColor: colors.expenseInput, 
                                color: colors.text,
                                fontFamily: "Jost"
                            }}
                        />
                    </View>

                    {loading ? (
                        <ActivityIndicator color={colors.text} size="large" className="py-5" />
                    ) : (
                        <Pressable
                            className="bg-[#57A6A1] p-4 rounded-3xl mt-4"
                            onPress={handleAddGoal}
                        >
                            <CustomText className="text-lg text-center text-white font-bold">
                                Save Goal
                            </CustomText>
                        </Pressable>
                    )}
                </View>
            </Pressable>
        </Pressable>
    )
}

export default AddGoal