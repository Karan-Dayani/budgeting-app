import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Link } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "./CustomText";

const AnimatedHeader = ({ user }) => {
  const { colors } = useTheme();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning ☀️";
    if (hour < 17) return "Good afternoon 🌤️";
    return "Good evening 🌙";
  };

  const username = user[0]?.username || "Budgeter";

  return (
    <SafeAreaView edges={["top"]}>
      <View className="pt-2 px-2 flex-row justify-between items-center mb-4">
        <View>
          <CustomText className="text-sm text-gray-400 font-medium uppercase tracking-wider">
            {getGreeting()}
          </CustomText>
          <CustomText
            className="text-2xl font-bold mt-0.5"
            style={{ color: colors.text, fontFamily: "Poppins_Bold" }}
          >
            {username}
          </CustomText>
        </View>
        
        <Link href={"/profile/"} asChild>
          <TouchableOpacity 
            className="h-11 w-11 rounded-full items-center justify-center border-2 shadow-sm"
            style={{ 
              borderColor: "#41B3A2", 
              backgroundColor: colors.inputBg 
            }}
          >
            <FontAwesome6 name="user" size={16} color="#41B3A2" />
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default AnimatedHeader;
