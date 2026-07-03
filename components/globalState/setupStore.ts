import { create } from "zustand";
import { supabase } from "../../lib/supabase";

export interface LocalAccount {
  id: string;
  userId: string;
  name: string;
  type: "Bank" | "Digital Wallet" | "Cash" | "Credit Card";
  balance: number;
}

interface SetupState {
  username: string;
  income: string;
  loading: boolean;
  error: string;
  welcomeScreen: boolean;

  // Custom accounts setup
  accounts: LocalAccount[];

  setUsername: (username: string) => void;
  setIncome: (income: string) => void;
  setError: (error: string) => void;
  setWelcomeScreen: (welcomeScreen: boolean) => void;
  setLoading: (loading: boolean) => void;

  setAccounts: (accounts: LocalAccount[]) => void;
  addAccount: (
    name: string,
    type: "Bank" | "Digital Wallet" | "Cash" | "Credit Card",
    balance: number,
  ) => void;
  removeAccount: (id: string) => void;
  submitAccounts: (userId: string) => Promise<boolean>;

  reset: () => void;
  submitDetails: (email: string) => Promise<boolean>;
}

export const useSetupStore = create<SetupState>((set, get) => ({
  username: "",
  income: "",
  experience: "basic",
  welcomeScreen: false,
  loading: false,
  error: "",

  accounts: [],

  setUsername: (username) => set({ username }),
  setIncome: (income) => set({ income }),
  setWelcomeScreen: (welcome) => set({ welcomeScreen: welcome }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  setAccounts: (accounts) => set({ accounts }),

  addAccount: (name, type, balance) => {
    const newAcc: LocalAccount = {
      id: Date.now().toString(),
      userId: "",
      name,
      type,
      balance,
    };
    set((state) => ({ accounts: [...state.accounts, newAcc] }));
  },

  removeAccount: (id) => {
    set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) }));
  },

  submitAccounts: async (userId) => {
    set({ loading: true, error: "" });
    const { accounts } = get();

    if (accounts.length === 0) {
      set({ error: "Please add at least one account.", loading: false });
      return false;
    }

    try {
      const payload = accounts.map((acc) => ({
        user_id: userId,
        account_name: acc.name,
        account_type: acc.type,
        balance: acc.balance,
      }));

      const { data, error } = await supabase
        .from("accounts")
        .insert(payload)
        .select();

      if (error) {
        console.error("Supabase insert accounts error:", error);
        set({
          error: "Failed to save accounts. Please try again.",
          loading: false,
        });
        return false;
      }

      if (data) {
        const formatted: LocalAccount[] = data.map((row) => ({
          id: row.id,
          userId: row.user_id,
          name: row.account_name,
          type: row.account_type,
          balance: Number(row.balance),
        }));
        set({ accounts: formatted, loading: false });
      } else {
        set({ loading: false });
      }
      return true;
    } catch (e) {
      console.error("Exception in submitAccounts:", e);
      set({ error: "An unexpected error occurred.", loading: false });
      return false;
    }
  },

  reset: () =>
    set({
      username: "",
      income: "",
      welcomeScreen: false,
      error: "",
      loading: false,
      accounts: [],
    }),

  submitDetails: async (email) => {
    set({ loading: true, error: "" });
    const { username, income } = get();

    if (!username || !username.trim()) {
      set({ error: "Please enter a username.", loading: false });
      return false;
    }

    const incomeStr = String(income);
    if (
      isNaN(Number(incomeStr)) ||
      incomeStr.trim() === "" ||
      Number(incomeStr) <= 0
    ) {
      set({ error: "Please enter a valid monthly income.", loading: false });
      return false;
    }

    const incomeNum = Number(incomeStr);

    try {
      // Check if the record already exists in Supabase
      const { data: existing, error: checkError } = await supabase
        .from("User Data")
        .select("email")
        .eq("email", email);

      if (checkError) {
        console.error("Check user data error:", checkError);
      }

      let res;
      if (existing && existing.length > 0) {
        // Record exists, update it
        res = await supabase
          .from("User Data")
          .update({
            income: incomeNum,
            username: username.trim(),
            savings: incomeNum,
          })
          .eq("email", email);
      } else {
        // Record doesn't exist, insert it
        res = await supabase.from("User Data").insert({
          email: email,
          income: incomeNum,
          username: username.trim(),
          savings: incomeNum,
        });
      }

      if (res.error) {
        console.error("Failed to update details in Supabase:", res.error);
        set({
          error: "Failed to update details. Please try again.",
          loading: false,
        });
        return false;
      }

      set({ loading: false });
      return true;
    } catch (e) {
      console.error("Exception in submitDetails:", e);
      set({
        error: "An unexpected error occurred. Please try again.",
        loading: false,
      });
      return false;
    }
  },
}));
