import { View, Text, ScrollView, Pressable } from "react-native";
import React from "react";
import { useTheme } from "@react-navigation/native";
import CustomText from "../CustomText";
import { FontAwesome5 } from "@expo/vector-icons";

const CategoryPicker = ({
  setCategoryModel,
  setSelectedCategory,
  selectedCategory,
}) => {
  const CategoryData = [
    { label: "Food", value: "Food", icon: "utensils" },
    { label: "Clothing", value: "Clothing", icon: "font-awesome-alt" },
    { label: "Entertainment", value: "Entertainment", icon: "film" },
    { label: "Groceries", value: "Groceries", icon: "shopping-cart" },
    { label: "Utilities", value: "Utilities", icon: "bolt" },
    { label: "Travel", value: "Travel", icon: "plane" },
    { label: "Rent", value: "Rent", icon: "home" },
    { label: "Education", value: "Education", icon: "book" },
    { label: "Other", value: "Other", icon: "ellipsis-h" },
  ];

  const { colors } = useTheme();
  return (
    <View
      className="flex-1 justify-center items-center bg-opacity-80"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
    >
      <View
        className="rounded-3xl p-4 w-10/12 max-h-1/2"
        style={{ backgroundColor: colors.chartBg }}
      >
        <CustomText
          className="text-xl text-center mb-4"
          style={{ color: colors.text }}
        >
          Select Category
        </CustomText>
        <View className="flex-row justify-between mb-4">
          <View className="w-full">
            <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled={true}>
              {CategoryData.map((item, i) => (
                <View
                  key={i}
                  className="my-2 py-4 px-4 rounded-3xl"
                  style={{
                    backgroundColor:
                      selectedCategory === item.value
                        ? "blue"
                        : colors.homeCardItem,
                  }}
                >
                  <Pressable
                    onPress={() => {
                      setSelectedCategory(item.value);
                      setCategoryModel(false);
                    }}
                    className="flex-row gap-x-2 items-center"
                  >
                    <FontAwesome5 name={item.icon} size={20} color="white" />
                    <CustomText
                      className="text-lg"
                      style={{
                        color:
                          selectedCategory === item.value
                            ? "white"
                            : colors.text,
                      }}
                    >
                      {item.value}
                    </CustomText>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
        <Pressable
          className="bg-red-500 rounded-3xl p-4 items-center mt-3"
          onPress={() => setCategoryModel(false)}
        >
          <CustomText className="text-white">Close</CustomText>
        </Pressable>
      </View>
    </View>
  );
};

export default CategoryPicker;
