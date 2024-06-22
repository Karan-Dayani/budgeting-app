import React from "react";
import { View, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const TotalIncome = ({ user }) => {

    const income = new Intl.NumberFormat("en-IN", {
        maximumSignificantDigits: 3,
    }).format(user[0].income);

    return (
        <View className="">
            <View className="rounded-xl bg-cardColor justify-center p-2 mb-2">
                <View className="items-center justify-between flex-row mb-4">
                    <Text
                        className="text-white text-xl"
                        style={{ fontFamily: "Red_Hat" }}
                    >
                        Monthly Income
                    </Text>
                    <AntDesign
                        name="right"
                        size={14}
                        color="white"
                        style={{ marginRight: 10 }}
                    />
                </View>
                {income ? (
                    <Text
                        className="text-white text-3xl"
                        style={{ fontFamily: "Red_Hat" }}
                    >
                        ₹{income}
                    </Text>
                ) : (
                    <Text
                        className="text-white text-3xl"
                        style={{ fontFamily: "Red_Hat" }}
                    >
                        Not mentioned
                    </Text>
                )}
            </View>
            <View className="flex-row w-full justify-between">
                <View className="flex-1 rounded-xl bg-green-800 p-2 shadow-2xl mr-2">
                    <View className="items-center justify-between flex-row mb-4">
                        <View className="flex-row items-center gap-2">
                            <Text
                                className="text-white text-xl"
                                style={{ fontFamily: "Red_Hat" }}
                            >
                                Savings
                            </Text>
                        </View>
                        <AntDesign
                            name="right"
                            size={14}
                            color="white"
                            style={{ marginRight: 10 }}
                        />
                    </View>
                    <Text
                        className="text-white text-3xl"
                        style={{ fontFamily: "Red_Hat" }}
                    >
                        ₹20,000
                    </Text>
                </View>
                <View className="flex-1 rounded-xl bg-red-700 p-2 shadow-2xl ml-0">
                    <View className="items-center justify-between flex-row mb-4">
                        <Text
                            className="text-white text-xl"
                            style={{ fontFamily: "Red_Hat" }}
                        >
                            Expenses
                        </Text>
                        <AntDesign
                            name="right"
                            size={14}
                            color="white"
                            style={{ marginRight: 10 }}
                        />
                    </View>
                    <Text
                        className="text-white text-3xl"
                        style={{ fontFamily: "Red_Hat" }}
                    >
                        ₹9,900
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default TotalIncome;
