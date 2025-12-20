import { useClosure } from "@/providers/services/useClosure";
import { IAuthSession } from "@/types/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
    <View className="flex-1">
      {/* 测试背景颜色 */}
      <View className="bg-primary p-4 mb-4 rounded-btn">
        <Text className="text-primary-content text-sm font-semibold">
          测试: bg-primary 应该显示黄色背景
        </Text>
      </View>
      <View className="bg-base-200 p-4 mb-4 rounded-btn">
        <Text className="text-base-content text-sm">
          测试: bg-base-200 应该显示浅灰色背景
        </Text>
      </View>
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
      <View className="flex-row items-center justify-center mb-4">
        <Text className="text-sm text-base-content/70">
          登录&注册有问题?点击查看{" "}
        </Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert("提示", "常见问题");
          }}
          disabled={isLoading}
        >
          <Text className="text-sm text-primary underline">常见问题</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        className="bg-primary rounded-btn py-4 items-center mt-2 disabled:opacity-50"
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-primary-content text-base font-semibold">
            登录
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
