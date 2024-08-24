import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { NativeBaseProvider } from "native-base";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

import { DarkCustomTheme, LightCustomTheme } from "../constants/Theme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Nunito: require("../assets/fonts/Nunito-Medium.ttf"),
    Jost: require("../assets/fonts/Jost/Jost-VariableFont_wght.ttf"),
    Cabin: require("../assets/fonts/Cabin/static/Cabin-SemiBold.ttf"),
    Josefin: require("../assets/fonts/Josefin_Sans/static/JosefinSans-Medium.ttf"),
    Red_Hat: require("../assets/fonts/Red_Hat_Display/static/RedHatDisplay-Medium.ttf"),
    Montserrat: require("../assets/fonts/Montserrat/static/Montserrat-Medium.ttf"),
    Nunito_Sans: require("../assets/fonts/Nunito_Sans/static/NunitoSans_7pt-Medium.ttf"),
  });
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <NativeBaseProvider>
      <ThemeProvider
        value={colorScheme === "dark" ? DarkCustomTheme : LightCustomTheme}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </ThemeProvider>
    </NativeBaseProvider>
  );
}
