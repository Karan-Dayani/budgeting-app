import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import CustomText from '../CustomText';

const CustomAlert = ({ visible, mainMessage, message, onClose, AlertScreen }) => {
    const { colors } = useTheme();

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 px-5 justify-center items-center bg-black/50">
                <View className="rounded-3xl p-6 w-11/12 shadow-2xl" style={{ backgroundColor: colors.inputBg }}>
                    {AlertScreen && <AlertScreen />}
                    <CustomText className="text-2xl font-bold mb-4 text-center" style={{ color: colors.text }}>
                        {mainMessage}
                    </CustomText>
                    <CustomText className="text-base mb-6 text-center" style={{ color: colors.text }}>
                        {message}
                    </CustomText>
                    <TouchableOpacity
                        className="bg-blue-600 p-4 rounded-full mt-2"
                        onPress={onClose}
                    >
                        <CustomText className="text-white text-center  font-medium">
                            Close
                        </CustomText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default CustomAlert;
