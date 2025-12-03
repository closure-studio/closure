import { useClosure } from "@/providers/services/useClosure";
import { useSystem } from "@/providers/system";
import { useState } from "react";
import {
  ActivityIndicator,
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
  const { toast } = useSystem();
  const { resetPassword, sendRegisterCode } = useClosure();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [codeCountdown, setCodeCountdown] = useState(0);
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
      toast.error("请输入有效的邮箱地址");
      return;
    }
    if (codeCountdown > 0) return;
    if (isSendingCode) return;

    setIsSendingCode(true);
    try {
      const response = await sendRegisterCode(email);
      if (response.code === 1) {
        toast.success("验证码已发送到您的邮箱");
        startCountdown();
      } else {
        toast.error(response.message || "发送验证码失败，请重试");
      }
    } catch (err: any) {
      toast.error(err.message || "发送验证码失败，请重试");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim() || !code.trim() || !password.trim()) {
      toast.error("请填写完整信息");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("请输入有效的邮箱地址");
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPasswd: password.trim(),
      });

      if (response.code === 1) {
        toast.success("密码重置成功，请登录");
        if (onResetSuccess) {
          onResetSuccess(email);
        }
        onNavigateToLogin();
      } else {
        toast.error(response.message || "密码重置失败，请重试");
      }
    } catch (err: any) {
      toast.error(err.message || "密码重置失败，请重试");
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
        editable={!isLoading && !isSendingCode}
      />
      <Input
        label="验证码"
        value={code}
        onChangeText={setCode}
        placeholder="请输入验证码"
        editable={isLoading || isSendingCode}
        rightComponent={
          <CodeButton
            countdown={codeCountdown}
            onPress={handleSendCode}
            disabled={isLoading || isSendingCode}
          />
        }
      />
      <Input
        label="新密码"
        value={password}
        onChangeText={setPassword}
        placeholder="请输入新密码"
        secureTextEntry
        editable={!isLoading && !isSendingCode}
      />
      <TouchableOpacity
        style={[
          styles.submitButton,
          (isLoading || isSendingCode) && styles.submitButtonDisabled,
        ]}
        onPress={handleResetPassword}
        disabled={isLoading || isSendingCode}
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
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
