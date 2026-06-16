
import React from 'react';
import { View, Modal, TouchableOpacity, Pressable } from 'react-native';
import CustomText from '../CustomText';
import { useTheme } from "expo-router/react-navigation";
import { Feather } from "@expo/vector-icons";

const CustomAlert = ({
    visible,
    mainMessage,
    message,
    onClose,
    alerts,
    task,
    AlertScreen,
    isDanger,
    confirmText,
    cancelText
}) => {
    const { colors } = useTheme();
    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable
                onPress={onClose}
                className="flex-1 px-5 justify-center items-center bg-black/60"
            >
                <Pressable
                    onPress={() => {}}
                    className={`rounded-3xl p-6 shadow-2xl ${isDanger ? "w-4/5" : "w-11/12"}`}
                    style={{ backgroundColor: colors.expenseForm || colors.inputBg }}
                >
                    {isDanger ? (
                        <>
                            <View className="items-center mb-4">
                                <View className="p-3 bg-red-500/10 rounded-full mb-3">
                                    <Feather name="alert-triangle" size={28} color="#EF4444" />
                                </View>
                                <CustomText
                                    className="text-lg font-bold text-center"
                                    style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}
                                >
                                    {mainMessage}
                                </CustomText>
                            </View>
                            <CustomText
                                className="text-sm text-center mb-6 text-gray-500"
                                style={{ fontFamily: "Jost" }}
                            >
                                {message}
                            </CustomText>
                            <View className="flex-row gap-3">
                                <Pressable
                                    style={{ backgroundColor: colors.expenseInput }}
                                    className="flex-1 p-3.5 items-center rounded-full"
                                    onPress={onClose}
                                >
                                    <CustomText
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                        className="text-sm font-bold"
                                        style={{ color: colors.text, fontFamily: "Poppins_Bold" }}
                                    >
                                        {cancelText || "No"}
                                    </CustomText>
                                </Pressable>
                                <Pressable
                                    style={{ backgroundColor: "#EF4444" }}
                                    className="flex-1 p-3.5 items-center rounded-full shadow-md"
                                    onPress={task}
                                >
                                    <CustomText
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                        className="text-white text-sm font-bold"
                                        style={{ fontFamily: "Poppins_Bold" }}
                                    >
                                        {confirmText || "Yes, Discard"}
                                    </CustomText>
                                </Pressable>
                            </View>
                        </>
                    ) : (
                        <>
                            {AlertScreen && <AlertScreen />}
                            <CustomText className="text-2xl font-bold mb-4 text-center" style={{ color: colors.text }}>
                                {mainMessage}
                            </CustomText>
                            <CustomText className="text-base mb-6 text-center" style={{ color: colors.text }}>
                                {message}
                            </CustomText>
                            <View className="flex-row gap-x-3">
                                <TouchableOpacity
                                    className="bg-red-600 p-4 rounded-full mt-2 flex-1"
                                    onPress={onClose}
                                >
                                    <CustomText className="text-white text-center text-md">
                                        {cancelText || "Close"}
                                    </CustomText>
                                </TouchableOpacity>
                                {!alerts && (
                                    <TouchableOpacity
                                        className="bg-blue-600 p-4 rounded-full mt-2 flex-1"
                                        onPress={task}
                                    >
                                        <CustomText className="text-white text-center text-md">
                                            {confirmText || "Yes"}
                                        </CustomText>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </>
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default CustomAlert;
