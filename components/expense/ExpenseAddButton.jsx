import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Pressable
} from "react-native";
import * as Animatable from "react-native-animatable";


const ExpenseAddButton = ({ setShowModal, animation }) => {
    return (

        <Animatable.View
            className="absolute right-1 z-10 h-full"
            animation={animation}
            duration={500}
            delay={200}
        >
            <Pressable
                onPress={() => setShowModal("addExpense")}
                className="bg-[#41B3A2] p-3 rounded-full absolute right-2 bottom-32 z-10"
            >
                <Ionicons name="add" size={40} color="white" />
            </Pressable>
        </Animatable.View>

    )
}

export default ExpenseAddButton