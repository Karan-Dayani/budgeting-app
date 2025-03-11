// import { useTheme } from "@react-navigation/native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Link } from "expo-router";
import { useTheme } from "native-base";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "./CustomText";

const AnimatedHeader = ({ user }) => {
  const { colors } = useTheme();
  return (
    <SafeAreaView>
      <View className="pt-2 pb-4 px-2 flex-row justify-between items-center">
        <View>
          <CustomText
            className="text-2xl font-semibold"
            style={{ color: colors.text }}
          >
            Hello, {user[0]?.username}
          </CustomText>
          <CustomText className="text-md text-gray-500">
            Welcome back!
          </CustomText>
        </View>
        <View>

          <Link href={"/Profile/"}>
            <FontAwesome6 name="user-circle" size={32} color={colors.text} />
          </Link>
        </View>
      </View>

    </SafeAreaView>
  );
};

export default AnimatedHeader;
