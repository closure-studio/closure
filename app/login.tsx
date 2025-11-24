import { useColorScheme } from "@/components/useColorScheme";
import { useClosure } from "@/providers/services/useClosure";
import { IAuthSession } from "@/types/auth";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { login } = useClosure();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // 验证输入
    if (!email.trim() || !password.trim()) {
      Alert.alert("错误", "请输入邮箱和密码");
      return;
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("错误", "请输入有效的邮箱地址");
      return;
    }
    if (isLoading) return;

    setIsLoading(true);

    try {
      const session: IAuthSession = {
        credential: {
          email,
          password,
        },
      };
      await login(session);

      // 登录成功后导航到主页
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("登录失败", err.message || "邮箱或密码错误，请重试");
    } finally {
      setIsLoading(false);
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Logo/Title Section */}
            <View style={styles.header}>
              <Text
                style={[
                  styles.title,
                  { color: isDark ? "#ffffff" : "#111827" },
                ]}
              >
                PRTS
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                欢迎回来
              </Text>
            </View>

            {/* Input Section */}
            <View style={styles.inputSection}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? "#D1D5DB" : "#374151" },
                  ]}
                >
                  邮箱
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#1F2937" : "#F3F4F6",
                      color: isDark ? "#ffffff" : "#111827",
                    },
                  ]}
                  placeholder="请输入邮箱"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!isLoading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? "#D1D5DB" : "#374151" },
                  ]}
                >
                  密码
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#1F2937" : "#F3F4F6",
                      color: isDark ? "#ffffff" : "#111827",
                    },
                  ]}
                  placeholder="请输入密码"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>忘记密码？</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>登录</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text
                style={[
                  styles.registerText,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                还没有账号？{" "}
              </Text>
              <TouchableOpacity disabled={isLoading}>
                <Text style={styles.registerLink}>立即注册</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#2563EB",
  },
  loginButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
  },
});
