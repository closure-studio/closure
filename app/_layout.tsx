import { useColorScheme } from "@/components/useColorScheme";
import { useProtectedRoute } from "@/hooks/auth/useProtectedRoute";
import { DataProvider } from "@/providers/data";
import { ClosureProvider } from "@/providers/services/useClosure";
import { SystemProvider } from "@/providers/system";
import { ThemeProvider, useTheme } from "@/providers/theme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StrictMode, useEffect } from "react";
import { View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
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

/**
 * 应用主题样式的根容器
 */
const ThemedRoot = ({ children }: { children: React.ReactNode }) => {
  const { c } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>{children}</View>
  );
};

/**
 * SafeAreaView 包装器，使用主题背景色
 */
const ThemedSafeArea = ({ children }: { children: React.ReactNode }) => {
  const { c } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: c.background }}
      edges={["top", "left", "right"]}
    >
      {children}
    </SafeAreaView>
  );
};

const DependentProviders = ({ children }: { children: React.ReactNode }) => (
  <StrictMode>
    <SafeAreaProvider>
      <KeyboardProvider>
        <SystemProvider>
          <DataProvider>
            <ThemeProvider>
              <ThemedRoot>
                <ThemedSafeArea>
                  <ClosureProvider>{children}</ClosureProvider>
                </ThemedSafeArea>
              </ThemedRoot>
            </ThemeProvider>
          </DataProvider>
        </SystemProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  </StrictMode>
);

const NavigationContent = () => {
  const colorScheme = useColorScheme();

  // 路由保护：根据登录状态自动重定向
  // 注意：不要在这里使用 early return null，否则会卸载 Stack navigator
  // 导致 useProtectedRoute 中的 router.replace 无法工作
  useProtectedRoute();

  return (
    <NavigationThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <Stack
        screenOptions={{
          gestureEnabled: true,
          gestureDirection: "horizontal",
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="create-game"
          options={{
            presentation: "transparentModal",
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="game-detail"
          options={{
            headerShown: false,
            animation: "slide_from_right",
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
      </Stack>
    </NavigationThemeProvider>
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
