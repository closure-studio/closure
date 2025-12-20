import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
    <View className="flex-1">
      <Input
        label="托管游戏账号"
        value={account}
        onChangeText={setAccount}
        placeholder="请输入您的游戏"
        editable={!isLoading}
      />
      <Text className="text-sm font-semibold mb-3 mt-1 text-base-content">
        服务器选择
      </Text>
      <View className="mb-5">
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
        className="bg-primary rounded-btn py-4 items-center mt-2 disabled:opacity-50"
        onPress={handleRecover}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-primary-content text-base font-semibold">
            查找!
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
