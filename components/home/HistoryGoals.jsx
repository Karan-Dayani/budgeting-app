import React from "react";
import { TouchableOpacity, View } from "react-native";
import CustomText from "../CustomText";
import { AntDesign } from "@expo/vector-icons";
import { numberWithCommas } from "../../lib/utils";
import CustomCircularProgress from "../CustomCircularProgress";
import { useNavigation } from "expo-router";

const HistoryGoals = ({ colors, userData }) => {
    const historyGoal = userData[0]?.goals?.slice(0, 4);
    const navigation = useNavigation();

    return (
        <View className="mt-4 mb-10">
            <View
                className="rounded-[28px] p-5 shadow-sm"
                style={{ backgroundColor: colors.chartBg }}
            >
                <View className="items-center justify-between flex-row mb-5">
                    <CustomText 
                        className="text-lg font-bold" 
                        style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}
                    >
                        Active Goals
                    </CustomText>
                    <TouchableOpacity 
                        className="p-1 rounded-full"
                        onPress={() => navigation.navigate("Goals")}
                    >
                        <AntDesign
                            name="right"
                            size={16}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                </View>
                
                <View className="gap-y-3">
                    {historyGoal?.length > 0 ? (
                        historyGoal.map((item, i) => {
                            const percent = item.goalTargetMoney > 0
                                ? Math.round((Number(item.goalSavedMoney) / Number(item.goalTargetMoney)) * 100)
                                : 0;
                            return (
                                <View
                                    key={i}
                                    className="p-4 rounded-[20px] flex-row justify-between items-center"
                                    style={{ backgroundColor: colors.homeCardItem }}
                                >
                                    <View className="flex-1 mr-4">
                                        <CustomText
                                            className="text-base font-bold"
                                            style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}
                                            numberOfLines={1}
                                        >
                                            {item.goalName}
                                        </CustomText>
                                        <CustomText
                                            className="text-xs text-gray-400 mt-1"
                                            style={{ fontFamily: "Red_Hat" }}
                                        >
                                            ₹{numberWithCommas(Number(item.goalSavedMoney))} saved of ₹{numberWithCommas(Number(item.goalTargetMoney))}
                                        </CustomText>
                                    </View>
                                    
                                    <View className="items-center justify-center">
                                        <CustomCircularProgress
                                            value={percent}
                                            radius={28}
                                            valueSuffix={"%"}
                                            activeStrokeColor={colors.progressCircleColor}
                                            inActiveStrokeColor={colors.progressInActive}
                                            progressValueColor={colors.text}
                                            maxValue={100}
                                            inActiveStrokeOpacity={0.15}
                                        />
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <CustomText className="text-sm text-gray-500 text-center italic" style={{ color: colors.text }}>
                            No active goals recorded yet.
                        </CustomText>
                    )}
                </View>
            </View>
        </View>
    );
};

export default HistoryGoals;