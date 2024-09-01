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
import {
  AntDesign,
  Entypo,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import CircularProgress from "react-native-circular-progress-indicator";
import uuid from "react-native-uuid";
import AddGoal from "../../components/modals/AddGoal";
import { supabase } from "../../lib/supabase";
import GoalComplete from "../../screens/GoalComplete";
import CustomText from "../../components/CustomText";
import { useUser } from "../../components/globalState/UserContext";
import { numberWithCommas } from "../utils";

const Goals = () => {
  const isFocused = useIsFocused();
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const { user } = useUser();
  const [userGoals, setUserGoals] = useState([]);
  const [savings, setSavings] = useState(0);
  const [goalDetailModal, setGoalDetailModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState();
  const [goalAddInput, setGoalAddInput] = useState(0);
  const [goal, setGoal] = useState({
    goalId: uuid.v4(),
    goalName: "",
    goalTargetMoney: 0,
    goalSavedMoney: 0,
  });
  const [goalComplete, setGoalComplete] = useState(false);

  const { colors } = useTheme();

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("User Data")
      .select("goals, savings")
      .eq("email", user?.user_metadata?.email);

    if (error) {
      console.error(error);
      Alert.alert("Error fetching data");
    } else {
      setUserGoals(data[0]?.goals || []);
      setSavings(data[0]?.savings || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, isFocused]);

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

    const remainingAmount =
      selectedGoal?.goalTargetMoney - selectedGoal?.goalSavedMoney;
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
      const updatedSavings = savings - goalAddInput;

      await supabase
        .from("User Data")
        .update({ goals: updatedData, savings: updatedSavings })
        .eq("email", user?.user_metadata?.email);

      if (Number(totalSavedMoney) === Number(selectedGoal.goalTargetMoney)) {
        console.log("Goal Complete!");
        setGoalComplete(true);
        setGoalDetailModal(false);
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
      const updatedSavings = savings + item.goalSavedMoney;
      await supabase
        .from("User Data")
        .update({ goals: updatedArray, savings: updatedSavings })
        .eq("email", user?.user_metadata?.email);
      setUserGoals(updatedArray);
    } else {
      const updatedArray = prevArray.filter(
        (goal) => goal.goalId !== selectedGoal.goalId
      );
      const updatedSavings = savings + selectedGoal.goalSavedMoney;
      await supabase
        .from("User Data")
        .update({ goals: updatedArray, savings: updatedSavings })
        .eq("email", user?.user_metadata?.email);
      setUserGoals(updatedArray);
    }

    setConfirmModal(false);
    setSelectedGoal(null);
    setIsDeleted(!isDeleted);
    setTimeout(() => {
      setIsDeleted(false);
    }, 2500);
  };

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
                className="bg-[#41B3A2] p-3 rounded-full absolute right-2 bottom-32 z-10"
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
                      const progressA =
                        (b.goalSavedMoney / b.goalTargetMoney) * 100;
                      const progressB =
                        (a.goalSavedMoney / a.goalTargetMoney) * 100;
                      return progressB - progressA;
                    })
                    .map((item, index) => {
                      return (
                        <View
                          className="rounded-3xl  p-4 my-2 w-full flex-row justify-between"
                          style={{ backgroundColor: colors.inputBg }}
                          key={index}
                        >
                          <View className="flex-row">
                            <View className="mr-5">
                              <CircularProgress
                                value={Math.round(
                                  (item.goalSavedMoney / item.goalTargetMoney) *
                                    100
                                )}
                                radius={35}
                                valueSuffix={"%"}
                                activeStrokeColor={colors.progressCircleColor}
                                inActiveStrokeColor={colors.progressInActive}
                                progressValueColor={colors.progressCircleColor}
                              />
                            </View>
                            <View className="justify-center">
                              <CustomText
                                className=" text-xl w-40 "
                                style={{ color: colors.text }}
                              >
                                {item.goalName}
                              </CustomText>
                              <CustomText
                                className="text-md mt-2 "
                                style={{ color: colors.text }}
                              >
                                ₹{numberWithCommas(Number(item.goalSavedMoney))}{" "}
                                / ₹
                                {numberWithCommas(Number(item.goalTargetMoney))}
                              </CustomText>
                            </View>
                          </View>
                          <View className="justify-center mr-2 ">
                            {item?.goalSavedMoney == item?.goalTargetMoney ? (
                              <TouchableOpacity
                                className="bg-green-700 rounded-3xl p-3"
                                onPress={() => handleGoalDelete(item)}
                              >
                                <Feather name="check" size={24} color="white" />
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                className="bg-[#41B3A2] rounded-3xl p-3"
                                onPress={() => handleGoalDetailOpen(item)}
                              >
                                <AntDesign
                                  name="right"
                                  size={24}
                                  color="white"
                                />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      );
                    })
                ) : (
                  <View
                    className="p-6 rounded-xl mt-5 shadow-lg"
                    style={{ backgroundColor: colors.itemBg }}
                  >
                    <CustomText className="text-white text-xl mb-3">
                      Set and track your personal goals here.
                    </CustomText>

                    <Pressable
                      className="p-2 mt-2 bg-[#41B3A2] items-center rounded-lg"
                      onPress={() => setModalVisible(true)}
                    >
                      <CustomText className="text-white text-lg ">
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
              <View
                className="flex-1 justify-center items-center"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
              >
                <View
                  className="p-6 rounded-lg w-4/5"
                  style={{
                    backgroundColor: colors.inputBg,
                    shadowColor: "#000",
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 5,
                  }}
                >
                  <View className="flex-row justify-between items-center mb-4">
                    <CustomText
                      className="text-lg font-semibold flex-1 pr-2"
                      style={{ color: colors.text }}
                      numberOfLines={1}
                    >
                      {selectedGoal.goalName}
                    </CustomText>
                    <Pressable
                      className="bg-red-600 rounded-full p-4"
                      onPress={() => setConfirmModal(true)}
                    >
                      <MaterialIcons name="delete" size={18} color="white" />
                    </Pressable>
                  </View>

                  <View className="items-center mb-4">
                    <CircularProgress
                      value={Math.round(
                        (selectedGoal.goalSavedMoney /
                          selectedGoal.goalTargetMoney) *
                          100
                      )}
                      radius={60}
                      valueSuffix={"%"}
                      activeStrokeColor={colors.progressCircleColor}
                      progressValueColor={colors.text}
                      maxValue={100}
                      inActiveStrokeOpacity={0.3}
                    />
                    <CustomText
                      className="text-xl font-medium mt-3"
                      style={{ color: colors.text }}
                    >
                      ₹{numberWithCommas(Number(selectedGoal.goalSavedMoney))}
                    </CustomText>
                    <CustomText className="text-base mt-1 text-gray-600">
                      of ₹
                      {numberWithCommas(Number(selectedGoal.goalTargetMoney))}
                    </CustomText>
                  </View>

                  <TextInput
                    placeholder="Enter Amount"
                    className="bg-gray-800 text-white p-4 mb-5 rounded-lg w-full"
                    placeholderTextColor={"#A0AEC0"}
                    keyboardType="numeric"
                    onChangeText={(text) => setGoalAddInput(Number(text))}
                    style={{ borderWidth: 1, borderColor: colors.border }}
                  />

                  <View className="flex-row gap-2">
                    <Pressable
                      className="flex-1 p-3 items-center rounded-lg bg-gray-500"
                      onPress={() => setGoalDetailModal(false)}
                    >
                      <CustomText className="text-white text-base font-semibold">
                        Cancel
                      </CustomText>
                    </Pressable>
                    <Pressable
                      className="flex-1 p-3 items-center rounded-lg bg-[#41B3A2]"
                      onPress={handleGoalAmountAdd}
                    >
                      <CustomText className="text-white text-base font-semibold">
                        Add
                      </CustomText>
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
            <View
              className="flex-1 justify-center items-center  bg-opacity-50"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
            >
              <View
                className=" p-5 rounded-xl w-4/5"
                style={{ backgroundColor: colors.inputBg }}
              >
                <CustomText
                  className="text-xl mb-4"
                  style={{ color: colors.text }}
                >
                  Are you sure?
                </CustomText>
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
              <Pressable
                className="absolute top-5 right-9 "
                onPress={() => setGoalComplete(false)}
              >
                <Entypo name="cross" size={34} color={colors.text} />
              </Pressable>
            </Modal>
          )}
        </SafeAreaView>
        <Notification
          isVisible={isSaved}
          text="Goal saved!"
          bgColor="green.500"
        />
        <Notification
          isVisible={isDeleted}
          text="Goal removed!"
          bgColor="green.500"
        />
      </View>
    </NativeBaseProvider>
  );
};

export default Goals;

function Notification({ isVisible, text, bgColor }) {
  return (
    <Slide in={isVisible} placement="top">
      <Box
        w="100%"
        position="absolute"
        p="2"
        borderRadius="xs"
        bg="emerald.500"
        alignItems="center"
        justifyContent="center"
        safeArea
        _dark={{ bg: bgColor }}
        _light={{ bg: bgColor }}
      >
        <HStack space={2}>
          <Ionicons name="checkmark" size={24} color="white" />
          <CustomText className="text-white">{text}</CustomText>
        </HStack>
      </Box>
    </Slide>
  );
}
