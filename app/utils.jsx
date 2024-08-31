import { supabase } from "../lib/supabase";

export function numberWithCommas(x) {
  return (
    x?.toString()?.replace(/(\d)(?=(\d\d)+\d$)/g, "$1,") +
    (x[1] ? "." + x[1] : "")
  );
}

export const getTotalExpense = (user) => {
  if (user[0]?.expenses?.length === 0) return 0;
  return user[0]?.expenses?.reduce(
    (total, item) => total + item?.expenseAmount,
    0
  );
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
