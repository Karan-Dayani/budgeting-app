import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";



import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Link, Stack } from "expo-router";
import uuid from "react-native-uuid";
import { supabase } from "../../lib/supabase";
import { useIsFocused } from "@react-navigation/native";
import CircularProgress from 'react-native-circular-progress-indicator';

const Goals = () => {
  const isFocused = useIsFocused()
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [user, setUser] = useState();
  const [userGoals, setUserGoals] = useState();
  const [goalDetailModal, setGoalDetailModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState();
  const [goalAddInput, setGoalAddInput] = useState(0);
  const [goal, setGoal] = useState({
    goalId: uuid.v4(),
    goalName: "",
    goalTargetMoney: 0,
    goalSavedMoney: 0,
  })

  const handleGoalAmountAdd = async () => {
    const totalSavedMoney = selectedGoal.goalSavedMoney + goalAddInput;
    const { data, err } = await supabase
      .from("User Data")
      .select("goals")
      .eq("email", user?.user_metadata?.email);

    const updatedData = data[0].goals.map((goal) => {
      if (goal.goalId === selectedGoal.goalId) {
        return { ...goal, goalSavedMoney: totalSavedMoney };
      }
    });

    await supabase
      .from("User Data")
      .update({ goals: updatedData })
      .eq("email", user?.user_metadata?.email);

    setGoalDetailModal(false);
  };

  const handleGoalDetailOpen = (item) => {
    setSelectedGoal(item);
    setGoalDetailModal(true);
  };

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
        {userGoals?.length > 0 ? (
          <Pressable
            onPress={() => setModalVisible(true)}
            className="bg-blue-500 p-2 rounded-full absolute right-0 bottom-5 z-10"
          >
            <Ionicons name="add" size={40} color="white" />
          </Pressable>
        ) : (
          <></>
        )}

        <Text className="text-white text-3xl" style={{ fontFamily: "Nunito" }}>
          Goals
        </Text>
        <View className="mt-4">
          {userGoals?.length > 0 ? (
            userGoals?.map((item, index) => {
              const progress = Math.min(
                (item.goalSavedMoney / item.goalTargetMoney) * 100,
                100
              );
              return (
                <TouchableOpacity
                  key={index}
                  onLongPress={() => handleGoalDetailOpen(item)}
                >
                  <View className="rounded-lg bg-gray-900 p-4 my-2 w-full ">


                    <Text
                      className="text-white text-xl"
                      style={{ fontFamily: "Red_Hat" }}
                    >
                      {item?.goalName}
                    </Text>

                    <View className="h-2 bg-gray-400 rounded-full overflow-hidden w-full mt-2">
                      <View
                        className="bg-green-500 h-full"
                        style={{ width: `${progress}%` }}
                      ></View>
                    </View>
                    <Text
                      className="text-white text-lg mt-2"
                      style={{ fontFamily: "Red_Hat" }}
                    >
                      ₹{item.goalSavedMoney} / ₹{item?.goalTargetMoney}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            // Render when userGoals is undefined or empty
            <View className="bg-[#1F2937] px-6 py-4 rounded-xl mt-5 shadow-lg">
              <Text
                className="text-white text-xl mb-3"
                style={{ fontFamily: "Nunito" }}
              >
                Set and track your personal goals here.
              </Text>

              <Pressable
                className="p-2 bg-blue-500 items-center rounded-lg"
                onPress={() => setModalVisible(true)}
              >
                <Text
                  className="text-white text-lg font-bold"
                  style={{ fontFamily: "Nunito" }}
                >
                  Add Goal
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {selectedGoal && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={goalDetailModal}
            onRequestClose={() => {
              setGoalDetailModal(!goalDetailModal);
            }}
          >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-50 ">
              <View className="bg-[#191A19] p-5 rounded-xl w-4/5 items-center ">
                <Text className="text-white mb-5 text-xl">{selectedGoal.goalName}</Text>
                <CircularProgress
                  value={Math.round((selectedGoal?.goalSavedMoney / selectedGoal?.goalTargetMoney) * 100)}
                  radius={70}
                  valueSuffix={'%'}
                />
                <TextInput
                  placeholder="Add Amount"
                  className="bg-gray-700 text-white p-2 mb-4 rounded-lg w-full mt-5"
                  placeholderTextColor={"white"}
                  keyboardType="numeric"
                  onChangeText={(text) => setGoalAddInput(Number(text))}
                />
                <Pressable
                  className="bg-blue-500 p-2 rounded-lg mb-2 w-full"
                  onPress={handleGoalAmountAdd}
                >
                  <Text className="text-white text-center text-lg">Add</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}

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
              <Text
                className="text-white text-xl mb-3"
                style={{ fontFamily: "Nunito" }}
              >
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
                onChangeText={(value) =>
                  handleAddGoalChange("goalTargetMoney", value)
                }
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
