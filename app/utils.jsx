import { Ionicons } from "@expo/vector-icons";
import { Box, HStack, Slide } from "native-base";
import CustomText from "../components/CustomText";

export function numberWithCommas(x) {
  return (
    x?.toString()?.replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")
  );
}

export const getTotalExpense = (user) => {
  if (user[0]?.expenses?.length === 0) return 0;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currMonth = monthNames[new Date().getMonth()];

  const currYear = new Date().toLocaleString("default", {
    year: "numeric",
  });

  return user[0]?.expenses?.reduce((total, item) => {
    const [month, day, year] = item.expenseDate.split(" ");

    if (month === currMonth && year === currYear) {
      return total + item.expenseAmount;
    }
    return total;
  }, 0);
};

export const getGoalSavings = (user) => {
  if (user[0]?.goals?.length === 0) return 0;
  return user[0]?.goals?.reduce(
    (total, item) => total + item?.goalSavedMoney,
    0
  );
};

export const incomePercent = (income) => {
  return (income * 10) / 100;
};


export function Notification({ isVisible, text, bgColor }) {
  return (
    <Slide in={isVisible} placement="top">
      <Box
        w="100%"
        position="absolute"
        p="2"
        borderRadius="xs"
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