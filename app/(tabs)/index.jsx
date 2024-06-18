import { View, Text, ScrollView, SafeAreaView } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

export default function Home() {

  return (
    <SafeAreaView className="">
      <Stack.Screen
        options={{
          headerTitle: "CoinTrack",
          headerTitleStyle: {
            fontSize: 25,
            fontFamily: "Nunito",
            color: "white",
          },
          headerStyle: {
            backgroundColor: "#191A19",
          },
        }}
      />

      <ScrollView >
        {/* Total Income */}

        <View className="rounded-xl bg-cardColor justify-center mx-4 p-2 mt-4">
          <View className="items-center justify-between flex-row mb-4">
            <Text
              className="text-white text-xl "
              style={{ fontFamily: "Nunito" }}
            >
              Total Income
            </Text>
            <AntDesign
              name="right"
              size={14}
              color="white"
              style={{ marginRight: 10 }}
            />
          </View>
          <Text className="text-white text-3xl ">₹1,00,000</Text>
        </View>

        {/* Savings & Expenses */}

        <View className="flex-row justify-center gap-2 mt-5 ">
          <View className="w-40 rounded-xl bg-green-700 p-2 shadow-2xl">
            <View className="items-center justify-between flex-row mb-4">
              <Text
                className="text-white text-xl  "
                style={{ fontFamily: "Nunito" }}
              >
                Savings
              </Text>
              <AntDesign
                name="right"
                size={14}
                color="white"
                style={{ marginRight: 10 }}
              />
            </View>
            <Text className="text-white text-3xl ">₹20,000</Text>
          </View>
          <View className=" w-40 rounded-xl bg-red-700 p-2 shadow-2x">
            <View className="items-center justify-between flex-row mb-4">
              <Text
                className="text-white text-xl  "
                style={{ fontFamily: "Nunito" }}
              >
                Expenses
              </Text>
              <AntDesign
                name="right"
                size={14}
                color="white"
                style={{ marginRight: 10 }}
              />
            </View>
            <Text className="text-white text-3xl">₹4,000</Text>
          </View>
        </View>

        {/* History */}

        <View className="rounded-xl bg-[#222831] justify-center mx-4  p-2 mt-6 ">
          <View className="items-center justify-between flex-row mb-4 px-2 py-2">
            <Text
              className="text-white text-2xl "
              style={{ fontFamily: "Nunito" }}
            >
              History
            </Text>
            <AntDesign
              name="right"
              size={14}
              color="white"
              style={{ marginRight: 10 }}
            />
          </View>
          <View className=" mx-2 mb-2">
            <View className="mb-2 py-1 flex-row justify-between">
              <Text className="text-white text-lg">Shopping</Text>
              <Text className="text-red-500 text-lg">- 1,000</Text>
            </View>
            <View className="mb-2 py-1 flex-row justify-between">
              <Text className="text-white text-lg">Snacks</Text>
              <Text className="text-red-500 text-lg">- 400</Text>
            </View>
            <View className="mb-2 py-1 flex-row justify-between">
              <Text className="text-white text-lg">Grossery</Text>
              <Text className="text-red-500 text-lg">- 2000</Text>
            </View>
            <View className="mb-2 py-1 flex-row justify-between">
              <Text className="text-white text-lg">Electril Bill</Text>
              <Text className="text-red-500 text-lg">- 6500</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
