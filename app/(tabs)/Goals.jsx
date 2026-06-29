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
import GoalDetail from "../../components/modals/GoalDetail";
import { supabase } from "../../lib/supabase";
import GoalComplete from "../../screens/GoalComplete";
import { Notification, numberWithCommas } from "../../lib/utils";
import FloatingAddButton from "../../components/FloatingAddButton";

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

  const [goal, setGoal] = useState({
    goalId: uuid.v4(),
    goalName: "",
    goalTargetMoney: 0,
    goalSavedMoney: 0,
  });
  const [goalComplete, setGoalComplete] = useState(false);

  const { colors, dark } = useTheme();

  const fetchData = async () => {
    const { data: userData, error: userError } = await supabase
      .from("User Data")
      .select("savings")
      .eq("email", user?.user_metadata?.email);

    if (userError) {
      console.error(userError);
      Alert.alert("Error fetching data");
      setLoading(false);
      return;
    }
    
    setSavings(userData[0]?.savings || 0);

    const { data: goalsData, error: goalsError } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (goalsError) {
      console.error(goalsError);
      Alert.alert("Error fetching goals");
    } else {
      const mappedGoals = (goalsData || []).map((g) => ({
        goalId: g.id,
        goalName: g.goal_name,
        goalTargetMoney: Number(g.target_amount),
        goalSavedMoney: Number(g.saved_amount),
        deadline: g.deadline,
        createdAt: g.created_at,
      }));
      setUserGoals(mappedGoals);
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

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: user?.id,
        goal_name: goal.goalName.trim(),
        target_amount: Number(goal.goalTargetMoney),
        saved_amount: Number(goal.goalSavedMoney) || 0,
      })
      .select();

    if (error) {
      console.error("Error adding goal:", error);
      Alert.alert("Error adding goal");
      setLoading(false);
      return;
    }

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

  const handleGoalAmountAdd = async (amount, onSuccess) => {
    if (amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    setLoading(true);

    const remainingAmount =
      Number(selectedGoal?.goalTargetMoney) - Number(selectedGoal?.goalSavedMoney);
    if (amount <= remainingAmount) {
      const totalSavedMoney = Number(selectedGoal.goalSavedMoney) + amount;

      const { error: goalUpdateError } = await supabase
        .from("goals")
        .update({ saved_amount: totalSavedMoney })
        .eq("id", selectedGoal.goalId);

      if (goalUpdateError) {
        console.error("Error updating goal amount:", goalUpdateError);
        Alert.alert("Error updating goal");
        setLoading(false);
        return;
      }

      const updatedSavings = savings - amount;

      const { error: userUpdateError } = await supabase
        .from("User Data")
        .update({ savings: updatedSavings })
        .eq("email", user?.user_metadata?.email);

      if (userUpdateError) {
        console.error("Error updating user savings:", userUpdateError);
        Alert.alert("Error updating savings");
        setLoading(false);
        return;
      }

      if (Number(totalSavedMoney) === Number(selectedGoal.goalTargetMoney)) {
        console.log("Goal Complete!");
        setGoalComplete(true);
        if (onSuccess) onSuccess();
        await fetchData();
      } else {
        if (onSuccess) onSuccess();
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
    setLoading(true);
    const targetGoal = item || selectedGoal;
    if (!targetGoal) {
      setLoading(false);
      return;
    }

    const { error: deleteError } = await supabase
      .from("goals")
      .delete()
      .eq("id", targetGoal.goalId);

    if (deleteError) {
      console.error("Error deleting goal:", deleteError);
      Alert.alert("Error deleting goal");
      setLoading(false);
      return;
    }

    const updatedSavings = savings + targetGoal.goalSavedMoney;
    const { error: userUpdateError } = await supabase
      .from("User Data")
      .update({ savings: updatedSavings })
      .eq("email", user?.user_metadata?.email);

    if (userUpdateError) {
      console.error("Error updating user savings after delete:", userUpdateError);
      Alert.alert("Error updating savings");
      setLoading(false);
      return;
    }

    setConfirmModal(false);
    setSelectedGoal(null);
    setIsDeleted(!isDeleted);
    setTimeout(() => {
      setIsDeleted(false);
    }, 2500);

    await fetchData();
    setLoading(false);
  };



  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View className="px-6 flex-1" style={{
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
        <SafeAreaView className="h-full">
          {userGoals.length > 0 && (
            <FloatingAddButton onPress={() => setModalVisible(true)} />
          )}

          <CustomText
            className="mt-6 text-3xl font-bold"
            style={{ color: colors.text, fontFamily: "Poppins_Bold" }}
          >
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
                        className="rounded-[24px] p-4 mb-3 w-full flex-row justify-between items-center shadow-sm"
                        style={{ backgroundColor: colors.inputBg }}
                        key={index}
                      >
                        <View className="flex-row items-center flex-1">
                          <View className="mr-4">
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
                              radius={32}
                              valueSuffix={"%"}
                              activeStrokeColor={colors.progressCircleColor}
                              inActiveStrokeColor={colors.progressInActive}
                              progressValueColor={colors.progressCircleColor}
                            />
                          </View>
                          <View className="justify-center flex-1 pr-2">
                            <CustomText
                              className="text-lg font-bold"
                              style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}
                              numberOfLines={1}
                            >
                              {item.goalName}
                            </CustomText>
                            <CustomText
                              className="text-sm mt-1 text-gray-500"
                              style={{ fontFamily: "Jost" }}
                            >
                              <CustomText style={{ color: "#41B3A2", fontFamily: "Poppins_SemiBold" }}>
                                ₹{numberWithCommas(Number(item.goalSavedMoney))}
                              </CustomText>
                              {" of ₹"}{numberWithCommas(Number(item.goalTargetMoney))}
                            </CustomText>
                          </View>
                        </View>
                        <View className="justify-center">
                          {Number(item?.goalSavedMoney) === Number(item?.goalTargetMoney) ? (
                            <TouchableOpacity
                              className="bg-green-500/10 h-10 w-10 rounded-full items-center justify-center"
                              onPress={() => handleGoalDelete(item)}
                            >
                              <Feather name="check" size={20} color="#10B981" />
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              className="bg-[#41B3A2]/10 h-10 w-10 rounded-full items-center justify-center"
                              onPress={() => handleGoalDetailOpen(item)}
                            >
                              <Feather name="chevron-right" size={20} color="#41B3A2" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })
              ) : (
                <View
                  className="p-8 rounded-[28px] mt-8 items-center shadow-sm"
                  style={{ backgroundColor: colors.inputBg }}
                >
                  <View
                    className="h-16 w-16 rounded-[24px] items-center justify-center mb-4"
                    style={{ backgroundColor: 'rgba(65, 179, 162, 0.12)' }}
                  >
                    <Feather name="target" size={30} color="#41B3A2" />
                  </View>
                  <CustomText
                    className="text-lg font-bold text-center mb-2"
                    style={{ color: colors.text, fontFamily: "Poppins_Bold" }}
                  >
                    No Active Goals
                  </CustomText>
                  <CustomText
                    className="text-sm text-center mb-6 text-gray-500 px-4"
                    style={{ fontFamily: "Jost" }}
                  >
                    Set and track your personal savings targets here to stay on budget.
                  </CustomText>

                  <Pressable
                    style={({ pressed }) => [
                      {
                        backgroundColor: "#41B3A2",
                        width: '100%',
                        paddingVertical: 14,
                        borderRadius: 20,
                        alignItems: 'center',
                        transform: [{ scale: pressed ? 0.98 : 1 }]
                      }
                    ]}
                    onPress={() => setModalVisible(true)}
                  >
                    <CustomText className="text-white text-base font-bold" style={{ fontFamily: "Poppins_Bold" }}>
                      Create First Goal
                    </CustomText>
                  </Pressable>
                </View>
              )}
            </View>
          )}

          {selectedGoal && (
            <Modal
              animationType="none"
              transparent={true}
              visible={goalDetailModal}
              onRequestClose={() => {
                setGoalDetailModal(false);
              }}
            >
              <GoalDetail
                selectedGoal={selectedGoal}
                setGoalDetailModal={setGoalDetailModal}
                setConfirmModal={setConfirmModal}
                handleGoalAmountAdd={handleGoalAmountAdd}
                loading={loading}
              />
            </Modal>
          )}

          <Modal
            animationType="none"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
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
            <Pressable
              onPress={() => setConfirmModal(false)}
              className="flex-1 justify-center items-center bg-black/60"
            >
              <Pressable
                onPress={() => { }}
                className="p-6 rounded-3xl w-4/5 shadow-2xl"
                style={{ backgroundColor: colors.expenseForm }}
              >
                <View className="items-center mb-4">
                  <View className="p-3 bg-red-500/10 rounded-full mb-3">
                    <Feather name="alert-triangle" size={28} color="#EF4444" />
                  </View>
                  <CustomText
                    className="text-lg font-bold text-center"
                    style={{ color: colors.text, fontFamily: "Poppins_SemiBold" }}
                  >
                    Delete Goal
                  </CustomText>
                </View>
                <CustomText
                  className="text-sm text-center mb-6 text-gray-500"
                  style={{ fontFamily: "Jost" }}
                >
                  Are you sure you want to delete this savings goal? This action cannot be undone.
                </CustomText>
                <View className="flex-row gap-3">
                  <Pressable
                    style={
                      {
                        backgroundColor: colors.expenseInput,

                      }
                    }
                    className="flex-1 p-3.5 items-center rounded-full"
                    onPress={() => setConfirmModal(false)}
                  >
                    <CustomText
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      className="text-sm font-bold"
                      style={{ color: colors.text, fontFamily: "Poppins_Bold" }}
                    >
                      No
                    </CustomText>
                  </Pressable>
                  <Pressable
                    style={{
                      backgroundColor: "#EF4444",
                    }}
                    className="flex-1 p-3.5 items-center rounded-full shadow-md"
                    onPress={() => handleGoalDelete()}
                  >
                    <CustomText
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      className="text-white text-sm font-bold"
                      style={{ fontFamily: "Poppins_Bold" }}
                    >
                      Yes, Delete
                    </CustomText>
                  </Pressable>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
          {
            goalComplete && (
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
            )
          }
        </SafeAreaView >
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
      </View >
    </Animated.View >
  );
};

export default Goals;
