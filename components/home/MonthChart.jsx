import React, { useState, useEffect } from "react";
import { Dimensions, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import CustomText from "../CustomText";

const MonthChart = ({ colors, userData }) => {
    const [monthlyExpenses, setMonthlyExpenses] = useState([]);

    const processExpenses = (expenses) => {
        const months = Array(12).fill(0);
        const monthMap = {
            January: 0, Jan: 0, February: 1, Feb: 1, March: 2, Mar: 2,
            April: 3, Apr: 3, May: 4, June: 5, Jun: 5, July: 6, Jul: 6,
            August: 7, Aug: 7, September: 8, Sep: 8, October: 9, Oct: 9,
            November: 10, Nov: 10, December: 11, Dec: 11,
        };

        expenses?.forEach((expense) => {
            let date;
            if (typeof expense.expenseDate === "string") {
                const parts = expense.expenseDate.split(" ");
                const [monthStr, day, year] = parts;
                const normalizedMonthStr = monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase();
                const month = monthMap[normalizedMonthStr];

                if (month !== undefined) {
                    date = new Date(year, month, day);
                }
            }

            if (date instanceof Date && !isNaN(date)) {
                months[date.getMonth()] += expense.expenseAmount;
            } else {
                console.log("Invalid date:", expense.expenseDate);
            }
        });

        const currentMonth = new Date().getMonth();
        const lastFourMonths = [
            (currentMonth - 3 + 12) % 12,
            (currentMonth - 2 + 12) % 12,
            (currentMonth - 1 + 12) % 12,
            currentMonth,
        ];

        setMonthlyExpenses(lastFourMonths.map((monthIndex) => Math.round(months[monthIndex])));
    };

    useEffect(() => {
        if (userData.length > 0) {
            let barData = userData[0]?.expenses?.filter((expense) => expense.expenseType === "Non-Recurring");
            processExpenses(barData);
        }
    }, [userData]);

    const chartConfig = {
        backgroundGradientFrom: colors.chartBg,
        backgroundGradientTo: colors.chartBg,
        decimalPlaces: 0,
        color: () => "#41B3A2",
        labelColor: () => colors.text,
        strokeWidth: 3,
        propsForBackgroundLines: { stroke: "transparent" },
        fillShadowGradient: "#41B3A2",
        fillShadowGradientOpacity: 0.7,
    };

    const generateLabels = () => {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const currentMonth = new Date().getMonth();
        const startMonth = (currentMonth - 3 + 12) % 12;
        return Array(4).fill().map((_, i) => monthNames[(startMonth + i) % 12]);
    };

    const data = {
        labels: generateLabels(),
        datasets: [
            {
                data: monthlyExpenses.slice(-4),
                color: () => `#41B3A2`,
                strokeWidth: 1,
            },
        ],
    };

    const checkDataLength = data?.datasets[0]?.data.filter((x) => x > 0).length;

    return (
        <View>
            <View className="w-full p-5 rounded-3xl mt-3 h-[22rem]" style={{ backgroundColor: colors.chartBg }}>
                <CustomText className="text-2xl mb-8" style={{ color: colors.text }}>
                    Monthly Expense Chart
                </CustomText>
                <View className={`${checkDataLength > 0 ? "items-center justify-center" : "justify-center"}`}>
                    {checkDataLength ? (
                        <BarChart
                            data={data}
                            width={Dimensions.get("window").width - 90}
                            height={240}
                            chartConfig={chartConfig}
                            bezier
                            style={{ paddingLeft: 60, paddingRight: 50 }}
                            yAxisLabel="₹ "
                            fromZero
                        />
                    ) : (
                        <CustomText className="text-xl" style={{ color: colors.text }}>
                            No Expense added till yet
                        </CustomText>
                    )}
                </View>
            </View>
        </View>
    );
};

export default MonthChart;
