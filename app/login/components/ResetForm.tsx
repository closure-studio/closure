import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CodeButton, Input } from "./SharedComponents";

interface ResetFormProps {
  onNavigateToLogin: () => void;
  onResetSuccess?: (email: string) => void;
}

export const ResetForm: React.FC<ResetFormProps> = ({
  onNavigateToLogin,
  onResetSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const startCountdown = () => {
    setCodeCountdown(60);
    const interval = setInterval(() => {
      setCodeCountdown((prev: number) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert("错误", "请输入邮箱地址");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("错误", "请输入有效的邮箱地址");
      return;
    }
    if (codeCountdown > 0) return;

    // TODO: 调用发送验证码API
    Alert.alert("提示", "验证码已发送到您的邮箱");
    startCountdown();
  };

  const handleResetPassword = async () => {
    if (!email.trim() || !code.trim() || !password.trim()) {
      Alert.alert("错误", "请填写完整信息");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("错误", "请输入有效的邮箱地址");
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    try {
      // TODO: 调用密码重置API
      Alert.alert("成功", "密码重置成功，请登录");
      if (onResetSuccess) {
        onResetSuccess(email);
      }
      onNavigateToLogin();
    } catch (err: any) {
      Alert.alert("失败", err.message || "密码重置失败，请重试");
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
        label="验证码"
        value={code}
        onChangeText={setCode}
        placeholder="请输入验证码"
        editable={!isLoading}
        rightComponent={
          <CodeButton
            countdown={codeCountdown}
            onPress={handleSendCode}
            disabled={isLoading}
          />
        }
      />
      <Input
        label="新密码"
        value={password}
        onChangeText={setPassword}
        placeholder="请输入新密码"
        secureTextEntry
        editable={!isLoading}
      />
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>重置!</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    flex: 1,
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

