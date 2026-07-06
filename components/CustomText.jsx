import React from 'react';
import { Text, StyleSheet } from 'react-native';

const CustomText = ({ style, ...props }) => {
    return <Text {...props} style={[styles.text, style]} />;
};

const styles = StyleSheet.create({
    text: {
        fontFamily: 'Poppins_Medium', // Apply Poppins globally
    },
});

export default CustomText;
