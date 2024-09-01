import { Entypo, Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { Menu } from "native-base";
import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "./globalState/UserContext";
import CustomText from "./CustomText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const AnimatedHeader = ({ toggleMenu, handleLogOut, user }) => {
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
          <View className="">
            {/* <Ionicons
                                name="notifications"
                                size={25}
                                color={colors.text}
                            />
                            <Menu
                                w="150"
                                trigger={(triggerProps) => {
                                    return (
                                        <Pressable
                                            accessibilityLabel="More options menu"
                                            {...triggerProps}
                                            className="ml-3"
                                        >
                                            <Entypo
                                                name="dots-three-vertical"
                                                size={25}
                                                color={colors.text}
                                            />
                                        </Pressable>
                                    );
                                }}
                                placement="bottom right"
                            >
                                <Menu.Item onPress={() => router.push("/(tabs)/Profile")}>
                                    Profile
                                </Menu.Item>
                                <Menu.Item onPress={() => router.push("/Expenses")}>
                                    Support
                                </Menu.Item>
                                <Menu.Item onPress={handleLogOut}>
                                    <Text className="text-red-400">Log out</Text>
                                </Menu.Item>
                            </Menu> */}
            <Pressable
              onPress={() => {
                router.push("/Profile/");
              }}
            >
              <FontAwesome6 name="user-circle" size={32} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AnimatedHeader;
