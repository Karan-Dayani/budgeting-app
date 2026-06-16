import {
  Alert,
  Modal,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AntDesign,
  Entypo,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useIsFocused } from "expo-router/react-navigation";
import { Stack } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import React, { useEffect, useState } from "react";
import CustomCircularProgress from "../../components/CustomCircularProgress";
import uuid from "react-native-uuid";
import CustomText from "../../components/CustomText";
import { useUser } from "../../components/globalState/UserContext";
import AddGoal from "../../components/modals/AddGoal";
import { supabase } from "../../lib/supabase";
import GoalComplete from "../../screens/GoalComplete";
import { Notification, numberWithCommas } from "../../lib/utils";

const Goals = () => {
  const isFocused = useIsFocused();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (isFocused) {
      fadeAnim.setValue(0);
      slideAnim.setValue(10);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(10);
    }
  }, [isFocused]);

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

  const { colors, dark } = useTheme();

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
    if (goal.goalName.trim() === "" || Number(goal.goalTargetMoney) <= 0) {
      Alert.alert("Error", "Please fill in all fields correctly.");
      return;
    }

    setLoading(true);
    const { data, err } = await supabase
      .from("User Data")
      .select("goals")
      .eq("email", user?.user_metadata?.email);

    const prevArray = data[0]?.goals || [];
    const formattedGoal = {
      ...goal,
      goalTargetMoney: Number(goal.goalTargetMoney),
      goalSavedMoney: Number(goal.goalSavedMoney),
    };
    const updatedArray = [formattedGoal, ...prevArray];

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
      Number(selectedGoal?.goalTargetMoney) - Number(selectedGoal?.goalSavedMoney);
    if (goalAddInput <= remainingAmount) {
      const totalSavedMoney = Number(selectedGoal.goalSavedMoney) + goalAddInput;

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
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View className="px-5 flex-1" style={{
        backgroundColor: colors.background
      }}>
        <Stack.Screen
          options={{
            headerShown: false,
            headerTitle: "",
            headerShadowVisible: false,
            headerTitleStyle: {
              color: colors.text,
              fontSize: 25,
            },

          }}
        />
        <SafeAreaView className="h-full ">

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

          <CustomText className={`mt-5 text-2xl`} style={{ color: colors.text }}>
            Goals
          </CustomText>
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={colors.text} />
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
                    return progressA - progressB;
                  })
                  .map((item, index) => {
                    return (
                      <View
                        className="rounded-3xl  p-4 my-2 w-full flex-row justify-between shadow-sm"
                        style={{ 
                          backgroundColor: colors.itemBg,
                          borderWidth: dark ? 0 : 1,
                          borderColor: '#E5E7EB',
                        }}
                        key={index}
                      >
                        <View className="flex-row">
                          <View className="mr-5">
                            <CustomCircularProgress
                              value={
                                item.goalTargetMoney > 0
                                  ? Math.round(
                                    (Number(item.goalSavedMoney) /
                                      Number(item.goalTargetMoney)) *
                                    100
                                  )
                                  : 0
                              }
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
                  <CustomText className="text-xl mb-3" style={{ color: colors.text }}>
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

          {selectedGoal && (
            <View>
              <Modal
                animationType="slide"
                transparent={true}
                visible={goalDetailModal}
                onRequestClose={() => {
                  setGoalDetailModal(!goalDetailModal);
                }}

              >
                <View
                  className=" flex-1 justify-end items-center"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
                >
                  <View
                    className="p-6 rounded-t-3xl w-full"
                    style={{
                      backgroundColor: colors.expenseForm,
                      shadowColor: "#000",
                      shadowOpacity: 0.3,
                      shadowRadius: 10,
                      elevation: 5,
                    }}
                  >
                    <View className="flex-row justify-between items-center mb-4">
                      <CustomText
                        className="text-2xl font-semibold flex-1 pr-2"
                        style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}
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

                    <View className="items-center mb-8">
                      <View className="mb-4">
                        <CustomCircularProgress
                          key={selectedGoal.goalId}
                          value={
                            selectedGoal.goalTargetMoney > 0
                              ? Math.round(
                                (Number(selectedGoal.goalSavedMoney) /
                                  Number(selectedGoal.goalTargetMoney)) *
                                100
                              )
                              : 0
                          }
                          radius={80}
                          valueSuffix={"%"}
                          activeStrokeColor={colors.progressCircleColor}
                          inActiveStrokeColor={colors.progressInActive}
                          progressValueColor={colors.text}
                          maxValue={100}
                          inActiveStrokeOpacity={0.3}
                        />
                      </View>
                      <CustomText
                        className="text-xl font-medium mt-3"
                        style={{ color: colors.text }}
                      >
                        ₹{numberWithCommas(Number(selectedGoal.goalSavedMoney))}
                      </CustomText>
                      <CustomText className="text-base mt-1 text-gray-500">
                        of ₹
                        {numberWithCommas(Number(selectedGoal.goalTargetMoney))}
                      </CustomText>
                    </View>

                    <TextInput
                      placeholder="Enter Amount"
                      className="p-4 mb-4 rounded-3xl w-full"
                      placeholderTextColor={"#A0AEC0"}
                      keyboardType="numeric"
                      onChangeText={(text) => setGoalAddInput(Number(text))}
                      style={{ backgroundColor: colors.expenseInput, color: colors.text }}
                    />

                    <View className="flex-row gap-2">
                      <Pressable
                        className="flex-1 p-4 items-center rounded-xl bg-gray-500"
                        onPress={() => setGoalDetailModal(false)}
                      >
                        <CustomText className="text-white text-base font-semibold">
                          Cancel
                        </CustomText>
                      </Pressable>
                      <Pressable
                        className="flex-1 p-4 items-center rounded-xl bg-[#41B3A2]"
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
            </View>
          )}
          <View>
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
                colors={colors}
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
          </View>
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
    </Animated.View>
  );
};

export default Goals;
