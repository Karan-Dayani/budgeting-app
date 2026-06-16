import { TouchableOpacity, View, StyleSheet } from "react-native";
import CustomText from "../CustomText";
import { AntDesign, Feather } from "@expo/vector-icons";
import { numberWithCommas } from "../../lib/utils";
import CustomCircularProgress from "../CustomCircularProgress";
import { useNavigation } from "expo-router";

const HistoryGoals = ({ colors, dark, userData }) => {
    const historyGoal = userData[0]?.goals?.slice(0, 4);
    const navigation = useNavigation();

    return (
        <View className="mt-4 mb-10">
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
                        <View style={styles.emptyContainer}>
                            <Feather name="target" size={20} color="#78909C" style={{ marginBottom: 6 }} />
                            <CustomText style={[styles.emptyTitle, { color: colors.text }]}>
                                No active goals
                            </CustomText>
                            <CustomText style={styles.emptySubtitle}>
                                Set up a savings target and track your progress.
                            </CustomText>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.emptyButton, { backgroundColor: 'rgba(65, 179, 162, 0.11)', borderColor: 'rgba(65, 179, 162, 0.22)' }]}
                                onPress={() => navigation.navigate("Goals")}
                            >
                                <Feather name="plus" size={13} color="#41B3A2" />
                                <CustomText style={styles.emptyButtonText}>
                                    Add Goal
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

export default HistoryGoals;