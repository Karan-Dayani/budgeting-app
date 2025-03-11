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

import { extendTheme, NativeBaseProvider } from "native-base";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

import { DarkCustomTheme, LightCustomTheme } from "../constants/Theme";

import { UserProvider } from "../components/globalState/UserContext";

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
    Poppins_SemiBold: require("../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
    Poppins_Bold: require("../assets/fonts/Poppins/Poppins-Bold.ttf"),
    Noto_Sans: require("../assets/fonts/Noto_Sans/static/NotoSans_SemiCondensed-ExtraBold.ttf"),
    Noto_Sans_SemiBold: require("../assets/fonts/Noto_Sans/static/NotoSans_SemiCondensed-SemiBold.ttf")
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const theme = colorScheme === "dark" ? DarkCustomTheme : LightCustomTheme;

  const nativeBaseTheme = extendTheme({
    colors: theme.colors,
  });

  return (
    <NativeBaseProvider theme={nativeBaseTheme}>
      <UserProvider>
        {/* <ThemeProvider
          value={colorScheme === "dark" ? DarkCustomTheme : LightCustomTheme}
        > */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
        {/* </ThemeProvider> */}
      </UserProvider>
    </NativeBaseProvider>
  );
}
