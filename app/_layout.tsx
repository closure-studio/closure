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
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast, { BaseToast } from "react-native-toast-message";
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
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#fff" }}
        edges={["top", "left", "right"]}
      >
        <SystemProvider>
          <DataProvider>
            <ClosureProvider>{children}</ClosureProvider>
          </DataProvider>
        </SystemProvider>
      </SafeAreaView>
    </SafeAreaProvider>
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
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", headerShown: false }}
        />
      </Stack>
    </ThemeProvider>
  );
};

function RootLayoutNav() {
  const { top } = useSafeAreaInsets();

  // 自定义Toast配置，包括warning类型
  const toastConfig = {
    warning: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: "#FFA500" }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 20,
          fontWeight: "600",
        }}
        text2Style={{
          fontSize: 18,
          fontWeight: "500",
        }}
      />
    ),
  };

  return (
    <>
      <DependentProviders>
        <NavigationContent />
      </DependentProviders>
      <Toast
        topOffset={top}
        config={toastConfig}
        position="top"
        visibilityTime={2000}
      />
    </>
  );
}
