import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox, StatusBar, View } from "react-native";
import "react-native-reanimated";

LogBox.ignoreLogs([
  "[Reanimated] `createAnimatedPropAdapter` is no longer necessary in Reanimated 4 and will be removed in next version. Please remove this call from your code and pass the adapter function directly.",
]);

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

  const baseTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const customColors = colorScheme === "dark" ? DarkCustomTheme.colors : LightCustomTheme.colors;
  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...customColors,
    },
  };

  return (
    <ThemeProvider value={theme}>
      <UserProvider>
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={customColors.header}
        />
        <View style={{ flex: 1, backgroundColor: customColors.background }}>
          <Stack screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: customColors.background }
          }}>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </View>
      </UserProvider>
    </ThemeProvider>
  );
}
