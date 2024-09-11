import { Ionicons } from "@expo/vector-icons";
import { Box, HStack, Slide } from "native-base";
import CustomText from "../components/CustomText";

export function numberWithCommas(x) {
  return x?.toString()?.replace(/(\d)(?=(\d\d)+\d$)/g, "$1,");
}

export const getTotalExpense = (user) => {
  if (user[0]?.expenses?.length === 0) return 0;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // Get the current month (0-indexed)
  const currentYear = currentDate.getFullYear(); // Get the current year
  const currentDay = currentDate.getDate(); // Get the current day of the month

  // Helper function to parse the custom "MMM DD YYYY" date format
  const parseExpenseDate = (expenseDate) => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const [month, day, year] = expenseDate.split(" ");
    const monthIndex = monthNames.indexOf(month); // Convert month name to month index (0-11)
    return { monthIndex, day: parseInt(day), year: parseInt(year) };
  };

  return user[0]?.expenses?.reduce((total, item) => {
    const { monthIndex, day, year } = parseExpenseDate(item.expenseDate);

    // Non-recurring expenses for the current month and year
    if (
      item.expenseType === "Non-Recurring" &&
      monthIndex === currentMonth &&
      year === currentYear
    ) {
      return total + item.expenseAmount;
    }

    // Recurring expenses logic
    if (item.expenseType === "Recurring") {
      // Recurring expenses should be counted only if today is the same day or after the recurring date in any month
      if (currentDay >= day) {
        return total + item.expenseAmount;
      }
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
