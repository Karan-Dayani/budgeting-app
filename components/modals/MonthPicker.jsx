import { View, Text, ScrollView, Pressable } from 'react-native';
import React from 'react';
import { useTheme } from '@react-navigation/native';
import CustomText from '../CustomText';

const MonthPicker = ({ setMonthModal, setFilters, filters }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

    // List of months
    const months = Array.from({ length: 12 }, (_, i) =>
        new Date(-1, i).toLocaleString("default", { month: "long" })
    );

    const { colors } = useTheme();

    return (
        <View
            className="flex-1 justify-center items-center bg-opacity-80"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
            <View
                className="rounded-3xl p-4 w-10/12 max-h-1/2"
                style={{ backgroundColor: colors.chartBg }}
            >
                <CustomText
                    className="text-xl text-center mb-4"
                    style={{ color: colors.text }}
                >
                    Select Month
                </CustomText>
                <View className="flex-row justify-between mb-4">
                    <View className="w-full">
                        <ScrollView
                            style={{ maxHeight: 300 }}
                            nestedScrollEnabled={true}
                        >
                            {months.map((item, i) => (
                                <View
                                    key={i}
                                    className="my-2 py-4 px-4 rounded-3xl"
                                    style={{
                                        backgroundColor:
                                            filters.month === item ? "blue" : colors.homeCardItem,
                                    }}
                                >
                                    <Pressable
                                        onPress={() => {
                                            setFilters({ ...filters, month: item });
                                            setMonthModal(false); // Close the modal after selection
                                        }}
                                    >
                                        <CustomText
                                            className="text-lg"
                                            style={{
                                                color:
                                                    filters.month === item ? "white" : colors.text,
                                            }}
                                        >
                                            {item}
                                        </CustomText>
                                    </Pressable>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
                <Pressable
                    className="bg-red-500 rounded-3xl p-4 items-center mt-3"
                    onPress={() => setMonthModal(false)}
                >
                    <CustomText className="text-white">Close</CustomText>
                </Pressable>
            </View>
        </View>
    );
};

export default MonthPicker;
