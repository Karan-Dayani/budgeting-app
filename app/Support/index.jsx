import { useIsFocused, useTheme } from "@react-navigation/native";
import { Link, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomText from "../../components/CustomText";
import CustomSuccessAlert from "../../components/modals/CustomSuccessAlert";
import { supabase } from "../../lib/supabase";
import { AntDesign } from "@expo/vector-icons";

const SupportPage = () => {
  const { colors } = useTheme();
  const isFocused = useIsFocused();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: true, headerTitle: "", headerShadowVisible: false }} />
      <View className="p-6">
        <CustomText style={{ color: colors.text }} className="text-2xl">
          Need any help then ask you mother
        </CustomText>
      </View>
    </View>
  );
};

export default SupportPage;
