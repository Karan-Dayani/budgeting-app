import { View, Text, SafeAreaView, Pressable, Modal, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import { Link, Stack } from "expo-router";
import uuid from "react-native-uuid";
import { supabase } from "../../lib/supabase";

const Goals = () => {
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [user, setUser] = useState();
  const [userGoals, setUserGoals] = useState();
  const [goal, setGoal] = useState({
    goalId: uuid.v4(),
    goalName: "",
    goalTargetMoney: 0,
    goalSavedMoney: 0,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      } else {
        Alert.alert("error accessing user");
      }
    });
  }, []);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("User Data")
        .select("goals")
        .eq("email", user?.user_metadata?.email);

      if (error) {
        console.error(error);
        Alert.alert("Error fetching data");
      } else {
        setUserGoals(data[0]?.goals || []);
      }
      setLoading(false);
    }

    if (user) {
      setLoading(true);
      fetchData();
    }

  }, [user, goal]);



  const handleAddGoalChange = (fieldName, value) => {
    setGoal((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  const handleAddGoal = async () => {
    const { data, err } = await supabase
      .from("User Data")
      .select("goals")
      .eq("email", user?.user_metadata?.email);

    console.log(data)
    const prevArray = data[0]?.goals || [];
    const updatedArray = [goal, ...prevArray];

    await supabase
      .from("User Data")
      .update({ goals: updatedArray })
      .eq("email", user?.user_metadata?.email);

    setGoal({
      goalName: "",
      goalMoneyTarget: 0,
      goalMoneySaved: 0,
    });
    setModalVisible(false);
  };


  return (
    <View className="px-5 flex-1">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerTitleStyle: {
            color: "white",
            fontFamily: "Nunito",
            fontSize: 25,
          },
          headerStyle: { backgroundColor: "#0F0F0F", height: 50 },
        }}
      />
      <SafeAreaView className="h-full">
        <Text className="text-white text-3xl" style={{ fontFamily: "Nunito" }}>
          Goals
        </Text>
        <View className="mt-4">
          {userGoals ? (
            userGoals.map((item, index) => (
              <Link key={index} className="" href={""}>
                <View className="rounded-lg bg-gray-900 p-4 my-2 w-96">
                  <View className="flex-row justify-between mb-2">
                    <Text
                      className="text-white text-xl "
                      style={{ fontFamily: "Red_Hat" }}
                    >
                      {item?.goalName}
                    </Text>
                    <Text
                      className="text-white text-lg"
                      style={{ fontFamily: "Red_Hat" }}
                    >
                      ₹{item?.goalTargetMoney}
                    </Text>
                  </View>
                </View>
              </Link>
            ))
          ) : (
            // Render when userGoals is undefined or empty
            <View className="bg-[#1F2937] px-6 py-4 rounded-xl mt-5 shadow-lg">
              <Text className="text-white text-xl mb-3" style={{ fontFamily: "Nunito" }}>
                Set and track your personal goals here.
              </Text>

              <Pressable
                className="p-2 bg-blue-500 items-center rounded-lg"
                onPress={() => setModalVisible(true)}
              >
                <Text className="text-white text-lg font-bold" style={{ fontFamily: "Nunito" }}>
                  Add Goal
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-[#191A19] p-5 rounded-xl w-4/5">
              <Text className="text-white text-xl mb-3" style={{ fontFamily: "Nunito" }}>
                Set a Goal
              </Text>
              <TextInput
                value={goal.goalName}
                onChangeText={(value) => handleAddGoalChange("goalName", value)}
                className="rounded-lg mb-4 text-white p-2 bg-[#31363F]"
                placeholderTextColor="white"
                placeholder="Enter your goal"
              />
              <TextInput
                value={goal.goalMoneyTarget}
                onChangeText={(value) => handleAddGoalChange("goalTargetMoney", value)}
                className="rounded-lg mb-4 text-white p-2 bg-[#31363F]"
                placeholderTextColor="white"
                placeholder="Target amount"
                keyboardType="numeric"
              />
              <View className="flex-row gap-2">
                <Pressable
                  className="flex-1 p-2 bg-red-500 items-center rounded-lg "
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white text-lg">Cancel</Text>
                </Pressable>
                <Pressable
                  className="flex-1 p-2 bg-blue-500 items-center rounded-lg"
                  onPress={handleAddGoal}
                >
                  <Text className="text-white text-lg">Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

export default Goals;
