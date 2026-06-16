import { TouchableOpacity, View, StyleSheet } from "react-native";
import CustomText from "../CustomText";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useNavigation } from "expo-router";

const HistoryExpense = ({ colors, dark, userData }) => {
    const historyExpense = userData[0]?.expenses?.slice(0, 4);
    const navigation = useNavigation();

    const getCategoryIcon = (category, name) => {
        const checkStr = (category + " " + name).toLowerCase();
        if (checkStr.includes("food") || checkStr.includes("eat") || checkStr.includes("dine") || checkStr.includes("restaurant") || checkStr.includes("cafe") || checkStr.includes("coffee")) {
            return { name: "coffee", color: "#FF9800", bg: "rgba(255, 152, 0, 0.12)" };
        }
        if (checkStr.includes("car") || checkStr.includes("travel") || checkStr.includes("ride") || checkStr.includes("transport") || checkStr.includes("taxi") || checkStr.includes("auto") || checkStr.includes("fuel") || checkStr.includes("petrol")) {
            return { name: "map-pin", color: "#2196F3", bg: "rgba(33, 150, 243, 0.12)" };
        }
        if (checkStr.includes("shop") || checkStr.includes("buy") || checkStr.includes("cloth") || checkStr.includes("grocery") || checkStr.includes("groceries") || checkStr.includes("mall")) {
            return { name: "shopping-bag", color: "#E91E63", bg: "rgba(233, 30, 99, 0.12)" };
        }
        if (checkStr.includes("bill") || checkStr.includes("util") || checkStr.includes("pay") || checkStr.includes("rent") || checkStr.includes("recharge") || checkStr.includes("electricity") || checkStr.includes("water")) {
            return { name: "file-text", color: "#9C27B0", bg: "rgba(156, 39, 176, 0.12)" };
        }
        if (checkStr.includes("gift") || checkStr.includes("present") || checkStr.includes("donation")) {
            return { name: "gift", color: "#4CAF50", bg: "rgba(76, 175, 80, 0.12)" };
        }
        return { name: "credit-card", color: "#607D8B", bg: "rgba(96, 125, 137, 0.12)" };
    };

    return (
        <View className="mt-4">
            <View
                className="rounded-[28px] p-5 shadow-sm"
                style={{ 
                    backgroundColor: colors.chartBg,
                    borderWidth: dark ? 0 : 1,
                    borderColor: '#E5E7EB',
                }}
            >
                <View className="items-center justify-between flex-row mb-5">
                    <CustomText 
                        className="text-lg font-bold" 
                        style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}
                    >
                        Recent Expenses
                    </CustomText>
                    <TouchableOpacity 
                        className="p-1 rounded-full"
                        onPress={() => navigation.navigate("Expenses")}
                    >
                        <AntDesign name="right" size={16} color={colors.text} />
                    </TouchableOpacity>
                </View>
                
                <View className="gap-y-3">
                    {historyExpense?.length > 0 ? (
                        historyExpense.map((item, index) => {
                            const iconConfig = getCategoryIcon(item.expenseCategory || "", item.expenseName || "");
                            return (
                                <View
                                    key={index}
                                    className="p-3.5 rounded-[20px] flex-row justify-between items-center"
                                    style={{ backgroundColor: colors.homeCardItem }}
                                >
                                    <View className="flex-row items-center flex-1 mr-2">
                                        <View 
                                            className="h-10 w-10 rounded-xl items-center justify-center mr-3"
                                            style={{ backgroundColor: iconConfig.bg }}
                                        >
                                            <Feather name={iconConfig.name} size={18} color={iconConfig.color} />
                                        </View>
                                        
                                        <View className="flex-1">
                                            <CustomText
                                                className="text-sm font-semibold"
                                                style={{ color: colors.text }}
                                                numberOfLines={1}
                                            >
                                                {item.expenseName}
                                            </CustomText>
                                            <CustomText className="text-[11px] text-gray-400 mt-0.5">
                                                {item.expenseDate}
                                            </CustomText>
                                        </View>
                                    </View>
                                    
                                    <CustomText className="text-red-500 font-bold text-base" style={{ fontFamily: "Red_Hat" }}>
                                        -₹{item.expenseAmount}
                                    </CustomText>
                                </View>
                            );
                        })
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Feather name="info" size={20} color="#78909C" style={{ marginBottom: 6 }} />
                            <CustomText style={[styles.emptyTitle, { color: colors.text }]}>
                                No recent expenses
                            </CustomText>
                            <CustomText style={styles.emptySubtitle}>
                                Add your first expense to begin tracking.
                            </CustomText>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.emptyButton, { backgroundColor: 'rgba(65, 179, 162, 0.11)', borderColor: 'rgba(65, 179, 162, 0.22)' }]}
                                onPress={() => navigation.navigate("Expenses")}
                            >
                                <Feather name="plus" size={13} color="#41B3A2" />
                                <CustomText style={styles.emptyButtonText}>
                                    Add Expense
                                </CustomText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
    },
    emptyTitle: {
        fontSize: 13,
        fontWeight: '700',
        fontFamily: 'Poppins_SemiBold',
        marginBottom: 2,
    },
    emptySubtitle: {
        fontSize: 11,
        color: '#8A9Aad',
        textAlign: 'center',
        marginBottom: 12,
        maxWidth: 220,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 12,
        borderWidth: 1,
    },
    emptyButtonText: {
        color: '#41B3A2',
        fontSize: 11,
        fontWeight: '700',
    }
});

export default HistoryExpense;