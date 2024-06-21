import { supabase } from "../lib/supabase";

export const getUser = supabase.auth.getUser().then(({ data: { user } }) => {
  if (user) {
    return user;
  } else {
    Alert.alert("error accessing user");
  }
});
