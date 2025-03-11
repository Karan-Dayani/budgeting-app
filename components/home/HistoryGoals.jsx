import React from "react";
import { View } from "react-native";
import CustomText from "../CustomText";
import { AntDesign } from "@expo/vector-icons";
import { numberWithCommas } from "../../app/utils";
import CircularProgress from "react-native-circular-progress-indicator";

const HistoryGoals = ({ colors, userData }) => {
    const historyGoal = userData[0]?.goals?.slice(0, 4);
    return (
        <View>
            <View
                className="rounded-3xl  justify-center p-3 mt-3 mb-32"
                style={{ backgroundColor: colors.chartBg }}
            >
                <View className="items-center justify-between flex-row mb-4 px-2 py-2">
                    <CustomText className="text-2xl" style={{ color: colors.text }}>
                        Goals
                    </CustomText>
                    <AntDesign
                        name="right"
                        size={14}
                        color="white"
                        style={{ marginRight: 10 }}
                    />
                </View>
                <View className="mx-2 mb-2">
                    {historyGoal?.length > 0 ? (
                        historyGoal?.map((item, i) => {
                            return (
                                <View
                                    key={i}
                                    className="mb-3 p-4 rounded-3xl bg-gray-700 "
                                    style={{ backgroundColor: colors.homeCardItem }}
                                >
                                    <View className="flex-row justify-between">
                                        <View className="justify-center">
                                            <CustomText
                                                className="text-xl w-40 "
                                                style={{ color: colors.text }}
                                            >
                                                {item.goalName}
                                            </CustomText>
                                            <CustomText
                                                className="text-md mt-2 "
                                                style={{ color: colors.text }}
                                            >
                                                ₹{numberWithCommas(Number(item.goalSavedMoney))} /
                                                ₹{numberWithCommas(Number(item.goalTargetMoney))}
                                            </CustomText>
                                        </View>
                                        <View className="">
                                            <CircularProgress
                                                value={Math.round(
                                                    (item.goalSavedMoney / item.goalTargetMoney) *
                                                    100
                                                )}
                                                radius={35}
                                                valueSuffix={"%"}
                                            />
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <CustomText className=" text-xl" style={{ color: colors.text }}>
                            No Goals added till yet
                        </CustomText>
                    )}
                </View>
            </View>
        </View>
    )
}

export default HistoryGoals