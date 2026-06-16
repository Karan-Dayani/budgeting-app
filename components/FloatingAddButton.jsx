import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Pressable,
    StyleSheet
} from "react-native";

const FloatingAddButton = ({ onPress }) => {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed
            ]}
        >
            <Ionicons name="add" size={36} color="white" />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#41B3A2",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        bottom: 128, // bottom-32
        right: 24,   // right-6
        zIndex: 10,
        elevation: 8,
        shadowColor: "#41B3A2",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        borderWidth: 1.5,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    pressed: {
        opacity: 0.85,
        transform: [{ scale: 0.95 }],
    }
});

export default FloatingAddButton;
