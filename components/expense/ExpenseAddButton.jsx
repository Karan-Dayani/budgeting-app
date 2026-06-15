import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Pressable,
    View
} from "react-native";


const ExpenseAddButton = ({ setShowModal }) => {
    return (

        <Pressable
            onPress={() => setShowModal("addExpense")}
            className="bg-[#41B3A2] p-3 rounded-full absolute bottom-32 right-2 z-10"
        >
            <Ionicons name="add" size={40} color="white" />
        </Pressable>

    )
}

export default ExpenseAddButton