import { useColorScheme } from "@/components/useColorScheme";
import { useClosure } from "@/providers/services/useClosure";
import { IAuthSession } from "@/types/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Input } from "./SharedComponents";

interface LoginFormProps {
  onNavigateToRegister: () => void;
  onNavigateToRecover: () => void;
  onNavigateToReset: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onNavigateToRegister,
  onNavigateToRecover,
  onNavigateToReset,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { login } = useClosure();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("错误", "请输入邮箱和密码");
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
      const response = await login(session);
      if (response.code === 1) {
        // 登录成功后，useProtectedRoute 会自动处理重定向到 (tabs)
        // 不需要手动调用 router.replace，避免导航时序问题
      } else {
        Alert.alert("登录失败", response.message || "邮箱或密码错误，请重试");
      }
    } catch (err: any) {
      Alert.alert("登录失败", err.message || "邮箱或密码错误，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <Input
        label="可露希尔通行证"
        value={email}
        onChangeText={setEmail}
        placeholder="请输入通行证"
        keyboardType="email-address"
        editable={!isLoading}
      />
      <Input
        label="密码"
        value={password}
        onChangeText={setPassword}
        placeholder="请输入密码"
        secureTextEntry
        editable={!isLoading}
      />
      <View style={styles.faqLinkContainer}>
        <Text
          style={[styles.faqText, { color: isDark ? "#9CA3AF" : "#6B7280" }]}
        >
          登录&注册有问题?点击查看{" "}
        </Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert("提示", "常见问题");
          }}
          disabled={isLoading}
        >
          <Text style={styles.faqLink}>常见问题</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>登录</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    flex: 1,
  },
  faqLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  faqText: {
    fontSize: 14,
  },
  faqLink: {
    fontSize: 14,
    color: "#9333EA",
    textDecorationLine: "underline",
  },
  submitButton: {
    backgroundColor: "#9333EA",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
