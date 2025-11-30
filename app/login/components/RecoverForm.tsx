import { useColorScheme } from "@/components/useColorScheme";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Input, RadioButton } from "./SharedComponents";

interface RecoverFormProps {
  onNavigateToLogin: () => void;
}

export const RecoverForm: React.FC<RecoverFormProps> = ({
  onNavigateToLogin,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [account, setAccount] = useState("");
  const [server, setServer] = useState<"official" | "bilibili">("official");
  const [isLoading, setIsLoading] = useState(false);

  const handleRecover = async () => {
    if (!account.trim()) {
      Alert.alert("错误", "请输入托管游戏账号");
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    try {
      // TODO: 调用找回邮箱API
      Alert.alert("成功", "邮箱已发送到您的注册邮箱");
    } catch (err: any) {
      Alert.alert("失败", err.message || "找回邮箱失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <Input
        label="托管游戏账号"
        value={account}
        onChangeText={setAccount}
        placeholder="请输入您的游戏"
        editable={!isLoading}
      />
      <Text
        style={[
          styles.serverLabel,
          { color: isDark ? "#D1D5DB" : "#374151" },
        ]}
      >
        服务器选择
      </Text>
      <View style={styles.radioGroup}>
        <RadioButton
          label="官服 (安卓 / IOS)"
          value="official"
          selected={server === "official"}
          onPress={() => setServer("official")}
          disabled={isLoading}
        />
        <RadioButton
          label="BiliBili服"
          value="bilibili"
          selected={server === "bilibili"}
          onPress={() => setServer("bilibili")}
          disabled={isLoading}
        />
      </View>
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleRecover}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>查找!</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    flex: 1,
  },
  serverLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 4,
  },
  radioGroup: {
    marginBottom: 20,
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

