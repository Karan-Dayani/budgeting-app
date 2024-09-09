import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Pressable,
    View
} from "react-native";
import * as Animatable from "react-native-animatable";


const ExpenseAddButton = ({ setShowModal }) => {
    return (

        <View
            className="absolute right-1 z-10  h-full"
        >
            <Pressable
                onPress={() => setShowModal("addExpense")}
                className="bg-[#41B3A2] p-3 rounded-full absolute right-2 bottom-32 z-10"
            >
                <Ionicons name="add" size={40} color="white" />
            </Pressable>
        </View>

    )
}

export default ExpenseAddButton