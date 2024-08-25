import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Box, HStack, NativeBaseProvider, Slide, Spinner } from "native-base";
import { AntDesign, Entypo, Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import CircularProgress from 'react-native-circular-progress-indicator';
import uuid from "react-native-uuid";
import AddGoal from "../../components/modals/AddGoal";
import { supabase } from "../../lib/supabase";
import GoalComplete from "../../screens/GoalComplete";
import CustomText from "../../components/CustomText";

const Goals = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false)
  const [user, setUser] = useState();
  const [userGoals, setUserGoals] = useState([]);
  const [goalDetailModal, setGoalDetailModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState();
  const [goalAddInput, setGoalAddInput] = useState(0);
  const [goal, setGoal] = useState({
    goalId: uuid.v4(),
    goalName: "",
    goalTargetMoney: 0,
    goalSavedMoney: 0,
  });
  const [goalComplete, setGoalComplete] = useState(false)

  const { colors } = useTheme();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      } else {
        Alert.alert("Error accessing user");
      }
    });
  }, []);

  const fetchData = async () => {
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
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleAddGoal = async () => {
    if (goal.goalName.trim() === "" || goal.goalTargetMoney <= 0) {
      Alert.alert("Error", "Please fill in all fields correctly.");
      return;
    }

    setLoading(true);
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
      goalId: uuid.v4(),
      goalName: "",
      goalTargetMoney: 0,
      goalSavedMoney: 0,
    });
    setModalVisible(false);
    await fetchData();
    setLoading(false);
    setIsSaved(!isSaved);
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };


  const handleGoalAmountAdd = async () => {
    if (goalAddInput <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    setLoading(true);

    const remainingAmount = selectedGoal?.goalTargetMoney - selectedGoal?.goalSavedMoney;
    if (goalAddInput <= remainingAmount) {
      const totalSavedMoney = selectedGoal.goalSavedMoney + goalAddInput;

      const { data, err } = await supabase
        .from("User Data")
        .select("goals")
        .eq("email", user?.user_metadata?.email);

      const updatedData = data[0].goals.map((goal) => {
        if (goal.goalId === selectedGoal.goalId) {
          return { ...goal, goalSavedMoney: totalSavedMoney };
        }
        return goal;
      });

      await supabase
        .from("User Data")
        .update({ goals: updatedData })
        .eq("email", user?.user_metadata?.email);

      if (Number(totalSavedMoney) === Number(selectedGoal.goalTargetMoney)) {
        console.log("Goal Complete!");
        setGoalComplete(true);
        setGoalDetailModal(false)
        await fetchData();
      } else {
        setGoalDetailModal(false);
        await fetchData();
      }
    } else {
      Alert.alert("Error", "Amount exceeds target.");
    }
    setLoading(false);
  };

  const handleGoalDetailOpen = (item) => {
    setSelectedGoal(item);
    setGoalDetailModal(true);
  };


  const handleAddGoalChange = (fieldName, value) => {
    setGoal((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  const handleGoalDelete = async (item) => {
    const prevArray = userGoals || [];

    if (item) {
      const updatedArray = prevArray.filter(
        (goal) => goal.goalId !== item.goalId
      );
      await supabase
        .from("User Data")
        .update({ goals: updatedArray })
        .eq("email", user?.user_metadata?.email);
      setUserGoals(updatedArray);
    } else {
      const updatedArray = prevArray.filter(
        (goal) => goal.goalId !== selectedGoal.goalId
      );
      await supabase
        .from("User Data")
        .update({ goals: updatedArray })
        .eq("email", user?.user_metadata?.email);
      setUserGoals(updatedArray);
    }

    setConfirmModal(false);
    setSelectedGoal(null);
    setIsDeleted(!isDeleted);
    setTimeout(() => {
      setIsDeleted(false);
    }, 2500);
  }

  return (
    <NativeBaseProvider>
      <View className="px-5 flex-1">
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: "",
            headerShadowVisible: false,
            headerTitleStyle: {
              color: colors.text,
              fontSize: 25,
            },
            headerStyle: { backgroundColor: colors.header, height: 50 },
          }}
        />
        <SafeAreaView className="h-full">
          <>
            {userGoals.length > 0 ? (
              <Pressable
                onPress={() => setModalVisible(true)}
                className="bg-[#41B3A2] p-3 rounded-full absolute right-2 bottom-28 z-10"
              >
                <Ionicons name="add" size={40} color="white" />
              </Pressable>
            ) : (
              <></>
            )}

            <CustomText className={` text-2xl`} style={{ color: colors.text }}>
              Goals
            </CustomText>
            {loading ? (
              <View className="flex-1 justify-center items-center">
                <Spinner size="lg" color={colors.text} />
              </View>
            ) : (
              <View className="mt-2">
                {userGoals.length > 0 ? (
                  [...userGoals]
                    .sort((a, b) => {
                      const progressA = (b.goalSavedMoney / b.goalTargetMoney) * 100;
                      const progressB = (a.goalSavedMoney / a.goalTargetMoney) * 100;
                      return progressB - progressA;
                    })
                    .map((item, index) => {
                      return (
                        <View className="rounded-3xl  p-4 my-2 w-full flex-row justify-between" style={{ backgroundColor: colors.itemBg }} key={index}>
                          <View className="flex-row">
                            <View className="mr-5">
                              <CircularProgress
                                value={Math.round((item.goalSavedMoney / item.goalTargetMoney) * 100)}
                                radius={35}
                                valueSuffix={"%"}
                              />
                            </View>
                            <View className="justify-center">
                              <CustomText
                                className=" text-xl w-40 text-white"
                              >
                                {item.goalName}
                              </CustomText>
                              <CustomText className="text-md mt-2 text-gray-300" >
                                ₹{item.goalSavedMoney} / ₹{item.goalTargetMoney}
                              </CustomText>
                            </View>
                          </View>
                          <View className="justify-center mr-2 ">
                            {item?.goalSavedMoney == item?.goalTargetMoney
                              ?
                              <TouchableOpacity className="bg-green-700 rounded-3xl p-3" onPress={() => handleGoalDelete(item)} >
                                <Feather name="check" size={24} color="white" />
                              </TouchableOpacity>
                              :
                              <TouchableOpacity className="bg-[#41B3A2] rounded-3xl p-3" onPress={() => handleGoalDetailOpen(item)}>
                                <AntDesign name="right" size={24} color="white" />
                              </TouchableOpacity>
                            }

                          </View>
                        </View>

                      );
                    })
                ) : (
                  <View className="bg-[#1F2937] px-6 py-4 rounded-xl mt-5 shadow-lg">
                    <CustomText className="text-white text-xl mb-3" >
                      Set and track your personal goals here.
                    </CustomText>

                    <Pressable
                      className="p-2 bg-blue-500 items-center rounded-lg"
                      onPress={() => setModalVisible(true)}
                    >
                      <CustomText className="text-white text-lg font-bold" >
                        Add Goal
                      </CustomText>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </>

          {selectedGoal && (
            <Modal
              animationType="fade"
              transparent={true}
              visible={goalDetailModal}
              onRequestClose={() => {
                setGoalDetailModal(!goalDetailModal);
              }}
            >
              <View className="flex-1 justify-center items-center  bg-opacity-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                <View className=" p-5 rounded-xl w-4/5" style={{ backgroundColor: colors.inputBg }}>
                  <View className="flex-row justify-between mb-4">
                    <CustomText className="py-2 text-xl w-40" style={{ color: colors.text }} numberOfLines={1}>{selectedGoal.goalName}</CustomText>
                    <Pressable className="bg-red-500 rounded-xl justify-center p-2" onPress={() => setConfirmModal(true)}>
                      <MaterialIcons name="delete" size={24} color="white" />
                    </Pressable>
                  </View>
                  <View className="items-center">
                    <CircularProgress
                      value={Math.round((selectedGoal.goalSavedMoney / selectedGoal.goalTargetMoney) * 100)}
                      radius={70}
                      valueSuffix={"%"}
                    />
                    <CustomText className="text-xl mt-4 mb-2" style={{ color: colors.text }}>₹{selectedGoal.goalSavedMoney} / ₹{selectedGoal.goalTargetMoney}</CustomText>
                  </View>
                  <TextInput
                    placeholder="Add Amount"
                    className="bg-gray-700 text-white p-3 mb-4 rounded-lg w-full mt-5"
                    placeholderTextColor={"white"}
                    keyboardType="numeric"
                    onChangeText={(text) => setGoalAddInput(Number(text))}
                  />
                  <View className="flex-row gap-2">
                    <Pressable
                      className="flex-1 p-2 bg-red-500 items-center rounded-lg"
                      onPress={() => setGoalDetailModal(false)}
                    >
                      <CustomText className="text-white text-lg">Cancel</CustomText>
                    </Pressable>
                    <Pressable
                      className="flex-1 p-2 bg-blue-500 items-center rounded-lg"
                      onPress={handleGoalAmountAdd}
                    >
                      <CustomText className="text-white text-lg">Add</CustomText>
                    </Pressable>
                  </View>
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
            <AddGoal
              handleAddGoalChange={handleAddGoalChange}
              setModalVisible={setModalVisible}
              loading={loading}
              goal={goal}
              handleAddGoal={handleAddGoal}
            />
          </Modal>
          <Modal
            animationType="fade"
            transparent={true}
            visible={confirmModal}
            onRequestClose={() => {
              setConfirmModal(!confirmModal);
            }}
          >
            <View className="flex-1 justify-center items-center  bg-opacity-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
              <View className=" p-5 rounded-xl w-4/5" style={{ backgroundColor: colors.inputBg }}>
                <CustomText className="text-xl mb-4" style={{ color: colors.text }}>Are you sure?</CustomText>
                <View className="flex-row gap-2">
                  <Pressable
                    className="flex-1 p-3 bg-red-500 items-center rounded-3xl"
                    onPress={() => setConfirmModal(false)}
                  >
                    <CustomText className="text-white text-lg">No</CustomText>
                  </Pressable>
                  <Pressable
                    className="flex-1 p-3 bg-blue-500 items-center rounded-3xl"
                    onPress={() => handleGoalDelete()}
                  >
                    <CustomText className="text-white text-lg">Yes</CustomText>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
          {goalComplete && (
            <Modal
              animationType="fade"
              transparent={true}
              visible={goalComplete}
              onRequestClose={() => setGoalComplete(false)}
            >
              <GoalComplete />
              <Pressable className="absolute top-5 right-9 " onPress={() => setGoalComplete(false)}>
                <Entypo name="cross" size={34} color={colors.text} />
              </Pressable>
            </Modal>
          )}
        </SafeAreaView>
        <Slide in={isSaved} placement="top">
          <Box w="100%" position="absolute" p="2" borderRadius="xs" bg="emerald.500" alignItems="center" justifyContent="center" _dark={{
            bg: "emerald.200"
          }} safeArea>
            <HStack space={2}>
              <CustomText className=" text-white text-lg">
                Goal saved successfully!
              </CustomText>
            </HStack>
          </Box>
        </Slide>

        <Slide in={isDeleted} placement="top">
          <Box w="100%" position="absolute" p="2" borderRadius="xs" bg="error.500" alignItems="center" justifyContent="center" safeArea>
            <HStack space={2}>
              <CustomText className="text-white text-lg">
                Goal removed successfully!
              </CustomText>
            </HStack>
          </Box>
        </Slide>
      </View>
    </NativeBaseProvider>
  );
};

export default Goals;
