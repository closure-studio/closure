import { useColorScheme } from "@/components/useColorScheme";
import { useSkadi } from "@/hooks/auth/useSkadi";
import { useClosure } from "@/providers/services/useClosure";
import { useSystem } from "@/providers/system";
import { IRegisterRequest } from "@/types/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Checkbox, CodeButton, Input } from "./SharedComponents";

interface RegisterFormProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess?: (email: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const { toast } = useSystem();
  const { sendRegisterCode, register } = useClosure();
  const { getNoiseAndSign, SkadiWebView, isReady: isSkadiReady } = useSkadi();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

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
      toast.error("请输入邮箱地址");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("邮箱地址格式错误");
      return;
    }
    if (isSendingCode) return;
    if (codeCountdown > 0) return;
    setIsSendingCode(true);

    const response = await sendRegisterCode(email);
    if (response.code === 1) {
      toast.success("验证码已发送");
      startCountdown();
    } else {
      toast.error(response.message);
    }
    setIsSendingCode(false);
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !code.trim()) {
      Alert.alert("错误", "请填写完整信息");
      return;
    }
    if (!agreedToTerms) {
      Alert.alert("错误", "请先同意用户协议");
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
      const { noise, sign, error } = await getNoiseAndSign(email, password);
      if (error) {
        toast.error(error);
        return;
      }
      // 构建注册请求数据
      const registerData: IRegisterRequest = {
        email,
        password,
        code,
        noise,
        sign,
      };
      const resp = await register(registerData);
      if (resp.code === 1) {
        toast.success("注册成功");
        if (onRegisterSuccess) {
          onRegisterSuccess(email);
        }
        onNavigateToLogin();
      } else {
        toast.error(resp.message);
      }
    } catch (err: any) {
      toast.error(err.message || "注册失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <SkadiWebView />
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
            disabled={isSendingCode}
          />
        }
      />
      <View style={styles.termsContainer}>
        <Checkbox
          label=""
          checked={agreedToTerms}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          disabled={isLoading}
        />
        <Text
          style={[styles.termsText, { color: isDark ? "#D1D5DB" : "#374151" }]}
        >
          我已阅读理解可露希尔小卖部{" "}
        </Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert("提示", "用户协议");
          }}
          disabled={isLoading}
        >
          <Text style={styles.termsLink}>用户协议</Text>
        </TouchableOpacity>
      </View>
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
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>注册</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    flex: 1,
  },
  termsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  termsText: {
    fontSize: 14,
  },
  termsLink: {
    fontSize: 14,
    color: "#9333EA",
    textDecorationLine: "underline",
    marginRight: 4,
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
