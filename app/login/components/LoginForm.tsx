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
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-red-500">
        Welcome to Nativewind!
      </Text>
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
