import { create } from "zustand";
import { supabase } from "../../lib/supabase";
import { LocalAccount } from "./setupStore";

export interface Expense {
  id: string;
  expenseId: string;
  expenseName: string;
  expenseAmount: number;
  paymentMode: string;
  expenseDate: string;
  expenseCategory: string;
  expenseType: string;
  user_id: string;
  user_email: string;
  amount: number;
  payment_mode: string;
  category: string;
  expense_name: string;
  expense_type: string;
  transaction_date: string;
  account_id?: string;
  accountId?: string;
}

export interface Goal {
  goalId: string;
  goalName: string;
  goalTargetMoney: number;
  goalSavedMoney: number;
  deadline?: string;
  createdAt?: string;
}

interface BudgetState {
  username: string;
  income: number;
  savings: number;
  expenses: Expense[];
  goals: Goal[];
  accounts: LocalAccount[];
  loading: boolean;
  submitting: boolean;

  setUsername: (username: string) => void;
  setIncome: (income: number) => void;
  setSavings: (savings: number) => void;
  setExpenses: (expenses: Expense[]) => void;
  setGoals: (goals: Goal[]) => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setAccounts: (accounts: LocalAccount[]) => void;

  reset: () => void;
  fetchBudget: (email: string, userId: string) => Promise<void>;
  fetchAccounts: (userId: string) => Promise<void>;
  addExpense: (
    userId: string,
    email: string,
    expenseName: string,
    amount: number,
    paymentMode: string,
    category: string,
    expenseType: string,
  ) => Promise<boolean>;
  deleteExpense: (
    email: string,
    expenseId: string,
    amount: number,
  ) => Promise<boolean>;
  addGoal: (
    userId: string,
    goalName: string,
    targetAmount: number,
  ) => Promise<boolean>;
  contributeToGoal: (
    email: string,
    goalId: string,
    amount: number,
    currentSaved: number,
  ) => Promise<boolean>;
  deleteGoal: (
    email: string,
    goalId: string,
    savedAmount: number,
  ) => Promise<boolean>;
  updateProfile: (
    email: string,
    userId: string,
    userName: string,
    incomeNum: number,
    isIncomeChanged: boolean,
  ) => Promise<boolean>;
  addAccount: (
    userId: string,
    email: string,
    name: string,
    type: "Bank" | "Digital Wallet" | "Cash" | "Credit Card",
    balance: number,
  ) => Promise<boolean>;
  deleteAccount: (
    email: string,
    id: string,
    balance: number,
  ) => Promise<boolean>;
  updateAccount: (
    email: string,
    id: string,
    name: string,
    type: "Bank" | "Digital Wallet" | "Cash" | "Credit Card",
    balance: number,
  ) => Promise<boolean>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  username: "",
  income: 0,
  savings: 0,
  expenses: [],
  goals: [],
  accounts: [],
  loading: true,
  submitting: false,

  setUsername: (username) => set({ username }),
  setIncome: (income) => set({ income }),
  setSavings: (savings) => set({ savings }),
  setExpenses: (expenses) => set({ expenses }),
  setGoals: (goals) => set({ goals }),
  setLoading: (loading) => set({ loading }),
  setSubmitting: (submitting) => set({ submitting }),
  setAccounts: (accounts) => set({ accounts }),

  reset: () =>
    set({
      username: "",
      income: 0,
      savings: 0,
      expenses: [],
      goals: [],
      accounts: [],
      loading: false,
      submitting: false,
    }),

  fetchAccounts: async (userId: string) => {
    const hasData = get().accounts.length > 0;
    if (!hasData) {
      set({ loading: true });
    }
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      const formatted: LocalAccount[] = (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        name: row.account_name,
        type: row.account_type,
        balance: Number(row.balance),
      }));

      set({ accounts: formatted, loading: false });
    } catch (err) {
      console.error("fetchAccounts error in store:", err);
      set({ loading: false });
    }
  },

  fetchBudget: async (email, userId) => {
    const hasData =
      get().username !== "" ||
      get().expenses.length > 0 ||
      get().accounts.length > 0;
    if (!hasData) {
      set({ loading: true });
    }
    try {
      const [userResponse, transResponse, goalsResponse, accountsResponse] =
        await Promise.all([
          supabase.from("User Data").select("*").eq("email", email),
          supabase
            .from("transactions")
            .select("*")
            .eq("user_id", userId)
            .order("transaction_date", { ascending: false }),
          supabase
            .from("goals")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
          supabase.from("accounts").select("*").eq("user_id", userId),
        ]);

      if (userResponse.error) throw userResponse.error;
      if (transResponse.error) throw transResponse.error;
      if (goalsResponse.error) throw goalsResponse.error;
      if (accountsResponse.error) throw accountsResponse.error;

      // Format transactions to custom UI keys
      const formattedTrans = (transResponse.data || []).map((tx) => {
        let formattedDate = "";
        if (tx.transaction_date) {
          const dateParts = tx.transaction_date.split("-");
          if (dateParts.length === 3) {
            const yearInt = parseInt(dateParts[0], 10);
            const monthInt = parseInt(dateParts[1], 10) - 1;
            const dayInt = parseInt(dateParts[2], 10);
            const d = new Date(yearInt, monthInt, dayInt);
            formattedDate = d.toDateString().slice(4);
          } else {
            formattedDate = new Date(tx.transaction_date)
              .toDateString()
              .slice(4);
          }
        } else {
          formattedDate = new Date().toDateString().slice(4);
        }
        return {
          ...tx,
          expenseId: tx.id,
          expenseName: tx.expense_name,
          expenseAmount: tx.amount,
          paymentMode: tx.payment_mode,
          expenseDate: formattedDate,
          expenseCategory: tx.category,
          expenseType: tx.expense_type,
          accountId: tx.account_id,
        };
      });

      // Format goals to custom UI keys
      const formattedGoals = (goalsResponse.data || []).map((g) => ({
        goalId: g.id,
        goalName: g.goal_name,
        goalTargetMoney: Number(g.target_amount),
        goalSavedMoney: Number(g.saved_amount),
        deadline: g.deadline,
        createdAt: g.created_at,
      }));

      // Format accounts to custom UI keys
      const formattedAccounts: LocalAccount[] = (
        accountsResponse.data || []
      ).map((row) => ({
        id: row.id,
        userId: row.user_id,
        name: row.account_name,
        type: row.account_type,
        balance: Number(row.balance),
      }));

      const userProfile = userResponse.data?.[0];
      set({
        username: userProfile?.username || "",
        income: Number(userProfile?.income) || 0,
        savings: Number(userProfile?.savings) || 0,
        expenses: formattedTrans,
        goals: formattedGoals,
        accounts: formattedAccounts,
        loading: false,
      });
    } catch (err) {
      console.error("fetchBudget error in store:", err);
      set({ loading: false });
    }
  },

  addExpense: async (
    userId,
    email,
    expenseName,
    amount,
    paymentMode,
    category,
    expenseType,
  ) => {
    set({ submitting: true });
    try {
      const account = get().accounts.find((a) => a.name === paymentMode);
      const accountId = account ? account.id : null;

      const transactionDate = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          user_email: email,
          expense_name: expenseName,
          amount,
          payment_mode: paymentMode,
          account_id: accountId,
          category,
          expense_type: expenseType,
          transaction_date: transactionDate,
        })
        .select();

      if (error) throw error;

      // Find the account matching paymentMode to deduct the balance
      let updatedAccounts = get().accounts;
      if (account) {
        const updatedBalance = account.balance - amount;
        const { error: accountUpdateError } = await supabase
          .from("accounts")
          .update({ balance: updatedBalance })
          .eq("id", account.id);

        if (accountUpdateError) throw accountUpdateError;

        updatedAccounts = get().accounts.map((a) =>
          a.id === account.id ? { ...a, balance: updatedBalance } : a,
        );
      }

      const updatedSavings = get().savings - amount;
      const { error: updateError } = await supabase
        .from("User Data")
        .update({ savings: updatedSavings })
        .eq("email", email);

      if (updateError) throw updateError;

      // format the new transaction item
      const tx = data[0];
      const dateParts = transactionDate.split("-");
      const d = new Date(
        parseInt(dateParts[0]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[2]),
      );
      const formattedDate = d.toDateString().slice(4);

      const newExpense: Expense = {
        ...tx,
        expenseId: tx.id,
        expenseName: tx.expense_name,
        expenseAmount: tx.amount,
        paymentMode: tx.payment_mode,
        expenseDate: formattedDate,
        expenseCategory: tx.category,
        expenseType: tx.expense_type,
        accountId: tx.account_id,
      };

      set({
        savings: updatedSavings,
        accounts: updatedAccounts,
        expenses: [newExpense, ...get().expenses],
        submitting: false,
      });
      return true;
    } catch (err) {
      console.error("addExpense error in store:", err);
      set({ submitting: false });
      return false;
    }
  },

  deleteExpense: async (email, expenseId, amount) => {
    set({ submitting: true });
    try {
      const targetExpense = get().expenses.find(
        (e) => e.expenseId === expenseId,
      );

      let updatedAccounts = get().accounts;
      if (targetExpense) {
        const account = get().accounts.find(
          (a) => a.name === targetExpense.paymentMode,
        );
        if (account) {
          const updatedBalance = account.balance + amount;
          const { error: accountUpdateError } = await supabase
            .from("accounts")
            .update({ balance: updatedBalance })
            .eq("id", account.id);

          if (accountUpdateError) throw accountUpdateError;

          updatedAccounts = get().accounts.map((a) =>
            a.id === account.id ? { ...a, balance: updatedBalance } : a,
          );
        }
      }

      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", expenseId);

      if (error) throw error;

      const updatedSavings = get().savings + amount;
      const { error: updateError } = await supabase
        .from("User Data")
        .update({ savings: updatedSavings })
        .eq("email", email);

      if (updateError) throw updateError;

      set({
        savings: updatedSavings,
        accounts: updatedAccounts,
        expenses: get().expenses.filter((e) => e.expenseId !== expenseId),
        submitting: false,
      });
      return true;
    } catch (err) {
      console.error("deleteExpense error in store:", err);
      set({ submitting: false });
      return false;
    }
  },

  addGoal: async (userId, goalName, targetAmount) => {
    set({ submitting: true });
    try {
      const { data, error } = await supabase
        .from("goals")
        .insert({
          user_id: userId,
          goal_name: goalName.trim(),
          target_amount: targetAmount,
          saved_amount: 0,
        })
        .select();

      if (error) throw error;

      const g = data[0];
      const newGoal: Goal = {
        goalId: g.id,
        goalName: g.goal_name,
        goalTargetMoney: Number(g.target_amount),
        goalSavedMoney: Number(g.saved_amount),
        deadline: g.deadline,
        createdAt: g.created_at,
      };

      set({
        goals: [newGoal, ...get().goals],
        submitting: false,
      });
      return true;
    } catch (err) {
      console.error("addGoal error in store:", err);
      set({ submitting: false });
      return false;
    }
  },

  contributeToGoal: async (email, goalId, amount, currentSaved) => {
    set({ submitting: true });
    try {
      const totalSavedMoney = currentSaved + amount;
      const { error: goalUpdateError } = await supabase
        .from("goals")
        .update({ saved_amount: totalSavedMoney })
        .eq("id", goalId);

      if (goalUpdateError) throw goalUpdateError;

      const updatedSavings = get().savings - amount;
      const { error: userUpdateError } = await supabase
        .from("User Data")
        .update({ savings: updatedSavings })
        .eq("email", email);

      if (userUpdateError) throw userUpdateError;

      set({
        savings: updatedSavings,
        goals: get().goals.map((g) =>
          g.goalId === goalId ? { ...g, goalSavedMoney: totalSavedMoney } : g,
        ),
        submitting: false,
      });
      return true;
    } catch (err) {
      console.error("contributeToGoal error in store:", err);
      set({ submitting: false });
      return false;
    }
  },

  deleteGoal: async (email, goalId, savedAmount) => {
    set({ submitting: true });
    try {
      const { error } = await supabase.from("goals").delete().eq("id", goalId);

      if (error) throw error;

      const updatedSavings = get().savings + savedAmount;
      const { error: userUpdateError } = await supabase
        .from("User Data")
        .update({ savings: updatedSavings })
        .eq("email", email);

      if (userUpdateError) throw userUpdateError;

      set({
        savings: updatedSavings,
        goals: get().goals.filter((g) => g.goalId !== goalId),
        submitting: false,
      });
      return true;
    } catch (err) {
      console.error("deleteGoal error in store:", err);
      set({ submitting: false });
      return false;
    }
  },

  updateProfile: async (
    email,
    userId,
    userName,
    incomeNum,
    isIncomeChanged,
  ) => {
    set({ submitting: true });
    try {
      if (isIncomeChanged) {
        const [updateRes, deleteRes, deleteGoalsRes] = await Promise.all([
          supabase
            .from("User Data")
            .update({
              username: userName,
              income: incomeNum,
              savings: incomeNum,
              expenses: [],
              goals: [],
            })
            .eq("email", email),
          supabase.from("transactions").delete().eq("user_id", userId),
          supabase.from("goals").delete().eq("user_id", userId),
        ]);

        if (updateRes.error) throw updateRes.error;
        if (deleteRes.error) throw deleteRes.error;
        if (deleteGoalsRes.error) throw deleteGoalsRes.error;

        set({
          username: userName,
          income: incomeNum,
          savings: incomeNum,
          expenses: [],
          goals: [],
          submitting: false,
        });
      } else {
        const { error } = await supabase
          .from("User Data")
          .update({ username: userName })
          .eq("email", email);

        if (error) throw error;

        set({
          username: userName,
          submitting: false,
        });
      }
      return true;
    } catch (err) {
      console.error("updateProfile error in store:", err);
      set({ submitting: false });
      return false;
    }
  },

  addAccount: async (
    userId: string,
    email: string,
    name: string,
    type: "Bank" | "Digital Wallet" | "Cash" | "Credit Card",
    balance: number,
  ) => {
    set({ submitting: true });
    try {
      const { data, error } = await supabase
        .from("accounts")
        .insert({
          user_id: userId,
          account_name: name.trim(),
          account_type: type,
          balance: balance,
        })
        .select();

      if (error) throw error;

      const acc = data[0];
      const newAcc: LocalAccount = {
        id: acc.id,
        userId: acc.user_id,
        name: acc.account_name,
        type: acc.account_type,
        balance: Number(acc.balance),
      };

      const updatedSavings = get().savings + balance;
      const { error: userUpdateError } = await supabase
        .from("User Data")
        .update({ savings: updatedSavings })
        .eq("email", email);

      if (userUpdateError) throw userUpdateError;

      set({
        savings: updatedSavings,
        accounts: [newAcc, ...get().accounts],
        submitting: false,
      });
      return true;
    } catch (err) {
      console.error("addAccount error in store:", err);
      set({ submitting: false });
      return false;
    }
  },

  deleteAccount: async (email: string, id: string, balance: number) => {
    set({ submitting: true });
    try {
      const { error } = await supabase.from("accounts").delete().eq("id", id);

      if (error) throw error;

      const updatedSavings = get().savings - balance;
      const { error: userUpdateError } = await supabase
        .from("User Data")
        .update({ savings: updatedSavings })
        .eq("email", email);

      if (userUpdateError) throw userUpdateError;

      set({
        savings: updatedSavings,
        accounts: get().accounts.filter((a) => a.id !== id),
        submitting: false,
      });
      return true;
    } catch (err) {
      console.error("deleteAccount error in store:", err);
      set({ submitting: false });
      return false;
    }
  },

  updateAccount: async (email, id, name, type, balance) => {
    set({ submitting: true });
    try {
      const { error } = await supabase
        .from("accounts")
        .update({
          account_name: name.trim(),
          account_type: type,
          balance: balance,
        })
        .eq("id", id);

      if (error) throw error;

      const nextAccounts = get().accounts.map((a) =>
        a.id === id
          ? { ...a, name: name.trim(), type: type, balance: balance }
          : a
      );

      const updatedSavings = nextAccounts.reduce((sum, acc) => sum + acc.balance, 0);
      const { error: userUpdateError } = await supabase
        .from("User Data")
        .update({ savings: updatedSavings })
        .eq("email", email);

      if (userUpdateError) throw userUpdateError;

      set({
        savings: updatedSavings,
        accounts: nextAccounts,
        submitting: false,
      });
      return true;
    } catch (err) {
      console.error("updateAccount error in store:", err);
      set({ submitting: false });
      return false;
    }
  },
}));
