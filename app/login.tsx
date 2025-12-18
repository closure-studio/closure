import { useColorScheme } from "@/components/useColorScheme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  LoginForm,
  RecoverForm,
  RegisterForm,
  ResetForm,
} from "./login/components";
import { Separator, TopButton } from "./login/components/SharedComponents";
type PageType = "login" | "register" | "recover" | "reset";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [currentPage, setCurrentPage] = useState<PageType>("login");

  const getPageTitle = () => {
    switch (currentPage) {
      case "login":
        return "用户登录";
      case "register":
        return "通行证注册";
      case "recover":
        return "找回邮箱";
      case "reset":
        return "密码重置";
      default:
        return "用户登录";
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar style="auto" />

      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDark ? "#111827" : "#ffffff" },
        ]}
      >
        <KeyboardAwareScrollView
          bottomOffset={50}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Title */}
            <Text
              style={[
                styles.pageTitle,
                { color: isDark ? "#9333EA" : "#9333EA" },
              ]}
            >
              {getPageTitle()}
            </Text>

            {/* Navigation Buttons */}
            <View style={styles.navigationButtons}>
              {currentPage === "login" ? (
                <>
                  <TopButton
                    text="没有账号?点击注册!"
                    onPress={() => setCurrentPage("register")}
                  />
                  <TopButton
                    text="忘记了通行证账号?"
                    onPress={() => setCurrentPage("recover")}
                  />
                  <TopButton
                    text="忘记了通行证密码?"
                    onPress={() => setCurrentPage("reset")}
                  />
                </>
              ) : (
                <TopButton
                  text="使用通行证登录"
                  onPress={() => setCurrentPage("login")}
                />
              )}
            </View>

            {/* Separator */}
            <Separator />

            {/* Forms */}
            {currentPage === "login" && (
              <LoginForm
                onNavigateToRegister={() => setCurrentPage("register")}
                onNavigateToRecover={() => setCurrentPage("recover")}
                onNavigateToReset={() => setCurrentPage("reset")}
              />
            )}

            {currentPage === "register" && (
              <RegisterForm onNavigateToLogin={() => setCurrentPage("login")} />
            )}

            {currentPage === "recover" && (
              <RecoverForm onNavigateToLogin={() => setCurrentPage("login")} />
            )}

            {currentPage === "reset" && (
              <ResetForm onNavigateToLogin={() => setCurrentPage("login")} />
            )}
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 24,
  },
  content: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  navigationButtons: {
    gap: 0,
  },
});
