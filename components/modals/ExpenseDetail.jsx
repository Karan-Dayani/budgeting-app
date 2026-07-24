import { View, Pressable, ActivityIndicator, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomText from '../CustomText'
import { numberWithCommas } from "../../lib/utils";
import { useTheme } from "expo-router/react-navigation";
import { Feather, Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import CustomAlert from "./CustomAlert";

const ExpenseDetail = ({
    selectedExpense,
    handleDeleteExpense,
    closeExpenseDetail
}) => {
    const { colors } = useTheme();

    const [lineItems, setLineItems] = useState(selectedExpense?.items || []);
    const [loadingItems, setLoadingItems] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const txId = selectedExpense?.expenseId || selectedExpense?.id;
        const itemCount = selectedExpense?.itemsCount || selectedExpense?.item_count || selectedExpense?.items_count || 0;

        if (txId && itemCount > 0 && lineItems.length === 0) {
            setLoadingItems(true);
            supabase
                .from("transaction_items")
                .select("*")
                .eq("transaction_id", txId)
                .then(({ data, error }) => {
                    if (!error && data) {
                        setLineItems(data);
                    }
                    setLoadingItems(false);
                })
                .catch(() => setLoadingItems(false));
        }
    }, [selectedExpense]);

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

    const iconConfig = getCategoryIcon(
        selectedExpense?.expenseCategory || "",
        selectedExpense?.expenseName || ""
    );

    return (
        <Pressable
            onPress={closeExpenseDetail}
            className="flex-1 justify-center items-center bg-opacity-85"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
            <Pressable
                onPress={() => { }}
                className="rounded-[32px] p-6 w-[88%] shadow-2xl relative"
                style={{
                    backgroundColor: colors.expenseForm,
                    borderWidth: 1,
                    borderColor: colors.background + '15',
                    maxHeight: '82%'
                }}
            >
                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                    {/* Header Section */}
                    <View className="items-center mt-2 mb-4">
                        {/* Category icon circle */}
                        <View
                            className="h-16 w-16 rounded-[24px] items-center justify-center mb-4 shadow-sm"
                            style={{ backgroundColor: iconConfig.bg }}
                        >
                            <Feather name={iconConfig.name} size={28} color={iconConfig.color} />
                        </View>

                        <CustomText
                            className="text-xl font-bold text-center px-4"
                            style={{ color: colors.text, fontFamily: "Poppins_Bold" }}
                            numberOfLines={2}
                        >
                            {selectedExpense?.expenseName}
                        </CustomText>

                        <CustomText
                            className="text-3xl font-extrabold mt-2 text-red-500"
                            style={{ fontFamily: "Poppins_Bold" }}
                        >
                            -₹{numberWithCommas(selectedExpense?.expenseAmount)}
                        </CustomText>
                    </View>

                    {/* Dashed Separator */}
                    <View
                        className="border-b mb-5"
                        style={{
                            borderStyle: 'dashed',
                            borderColor: colors.text + '20',
                            borderWidth: 1,
                            borderRadius: 1
                        }}
                    />

                    {/* Receipt Details rows */}
                    <View className="mb-4 gap-y-3.5 px-1">
                        <View className="flex-row justify-between items-center">
                            <CustomText className="text-gray-400 text-sm font-semibold">Date</CustomText>
                            <CustomText className="text-sm font-bold" style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}>
                                {selectedExpense?.expenseDate}
                            </CustomText>
                        </View>
                        <View className="flex-row justify-between items-center">
                            <CustomText className="text-gray-400 text-sm font-semibold">Category</CustomText>
                            <CustomText className="text-sm font-bold" style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}>
                                {selectedExpense?.expenseCategory || "Other"}
                            </CustomText>
                        </View>
                        <View className="flex-row justify-between items-center">
                            <CustomText className="text-gray-400 text-sm font-semibold">Payment Mode</CustomText>
                            <CustomText className="text-sm font-bold" style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}>
                                {selectedExpense?.paymentMode}
                            </CustomText>
                        </View>

                        {(selectedExpense?.itemsCount > 0 || selectedExpense?.item_count > 0 || selectedExpense?.items_count > 0 || lineItems.length > 0) && (
                            <View className="flex-row justify-between items-center">
                                <CustomText className="text-gray-400 text-sm font-semibold">Items Count</CustomText>
                                <CustomText className="text-sm font-bold" style={{ color: "#57A6A1", fontFamily: "Poppins_Bold" }}>
                                    {selectedExpense?.itemsCount || selectedExpense?.item_count || selectedExpense?.items_count || lineItems.length} items
                                </CustomText>
                            </View>
                        )}
                    </View>

                    {/* Line Items List if available */}
                    {loadingItems ? (
                        <ActivityIndicator size="small" color="#57A6A1" style={{ marginVertical: 10 }} />
                    ) : lineItems.length > 0 ? (
                        <View className="mb-5 p-3.5 rounded-2xl" style={{ backgroundColor: colors.expenseInput, borderWidth: 1, borderColor: colors.inputBg }}>
                            <View className="flex-row items-center mb-2">
                                <Ionicons name="receipt-outline" size={16} color="#57A6A1" style={{ marginRight: 6 }} />
                                <CustomText className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Item Breakdown
                                </CustomText>
                            </View>
                            {lineItems.map((item, idx) => (
                                <View
                                    key={idx}
                                    className="flex-row justify-between items-center py-2"
                                    style={{ borderBottomWidth: idx < lineItems.length - 1 ? 1 : 0, borderBottomColor: colors.inputBg }}
                                >
                                    <View className="flex-1 mr-2">
                                        <CustomText className="text-xs font-semibold" style={{ color: colors.text }}>
                                            {item.name}
                                        </CustomText>
                                        {item.quantity && item.quantity > 1 && (
                                            <CustomText className="text-[10px] text-gray-400">
                                                Qty: {item.quantity}
                                            </CustomText>
                                        )}
                                    </View>
                                    <CustomText className="text-xs font-bold" style={{ color: colors.text }}>
                                        ₹{item.amount ?? item.price ?? 0}
                                    </CustomText>
                                </View>
                            ))}
                        </View>
                    ) : null}

                    {/* Actions */}
                    <View className="mt-2 items-center w-full">
                        {/* Primary Action: Close */}
                        <Pressable
                            style={({ pressed }) => [
                                {
                                    backgroundColor: "#41B3A2",
                                    width: '100%',
                                    paddingVertical: 14,
                                    borderRadius: 20,
                                    alignItems: 'center',
                                    shadowColor: "#41B3A2",
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 6,
                                    elevation: 3,
                                    transform: [{ scale: pressed ? 0.98 : 1 }]
                                }
                            ]}
                            onPress={closeExpenseDetail}
                        >
                            <CustomText className="text-white text-base font-bold" style={{ fontFamily: "Poppins_Bold" }}>
                                Dismiss
                            </CustomText>
                        </Pressable>

                        {/* Secondary Action: Delete */}
                        <Pressable
                            style={({ pressed }) => [
                                {
                                    paddingVertical: 12,
                                    marginTop: 8,
                                    opacity: pressed ? 0.6 : 1
                                }
                            ]}
                            onPress={() => setShowDeleteConfirm(true)}
                        >
                            <CustomText className="text-red-500 text-sm font-bold" style={{ fontFamily: "Poppins_Bold" }}>
                                Delete Transaction
                            </CustomText>
                        </Pressable>
                    </View>
                </ScrollView>
            </Pressable>

            {/* Custom Styled Confirmation Alert */}
            {showDeleteConfirm && (
                <CustomAlert
                    visible={showDeleteConfirm}
                    mainMessage="Delete Expense"
                    message="Are you sure you want to delete this expense? This action cannot be undone."
                    onClose={() => setShowDeleteConfirm(false)}
                    isDanger={true}
                    confirmText="Yes, Delete"
                    cancelText="No"
                    task={() => {
                        setShowDeleteConfirm(false);
                        handleDeleteExpense();
                    }}
                />
            )}
        </Pressable>

    )
}

export default ExpenseDetail;