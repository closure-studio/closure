import { useColorScheme } from "@/components/useColorScheme";
import { useProtectedRoute } from "@/hooks/auth/useProtectedRoute";
import { DataProvider } from "@/providers/data";
import { ClosureProvider } from "@/providers/services/useClosure";
import { SystemProvider } from "@/providers/system";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StrictMode, useEffect } from "react";
import "react-native-reanimated";
import "../global.css";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const DependentProviders = ({ children }: { children: React.ReactNode }) => (
  <StrictMode>
    <SystemProvider>
      <DataProvider>
        <ClosureProvider>{children}</ClosureProvider>
      </DataProvider>
    </SystemProvider>
  </StrictMode>
);

const NavigationContent = () => {
  const colorScheme = useColorScheme();

  // 添加路由保护 - 现在在 DataProvider 内部
  useProtectedRoute();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
};

function RootLayoutNav() {
  return (
    <DependentProviders>
      <NavigationContent />
    </DependentProviders>
  );
}
