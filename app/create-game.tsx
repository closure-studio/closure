import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { Input, RadioButton } from "@/app/login/components/SharedComponents";
import { useRecaptcha } from "@/hooks/auth/useRecaptcha";
import { useClosure } from "@/providers/services/useClosure";
import { useSystem } from "@/providers/system";
import { GamePlatform } from "@/types/arkHost";
import { useColors } from "@/utils/colors";

export default function CreateGameModal() {
  const router = useRouter();
  const c = useColors();
  const { toast } = useSystem();
  const { createGame, fetchQuotaUser, fetchGamesStatus } = useClosure();
  const {
    getRecaptchaToken,
    RecaptchaWebView,
    isReady: recaptchaReady,
  } = useRecaptcha();

  // 获取路由参数
  const { slotUuid } = useLocalSearchParams<{ slotUuid: string }>();

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [platform, setPlatform] = useState<GamePlatform>(GamePlatform.Official);
  const [isLoading, setIsLoading] = useState(false);

  // 验证表单
  const validateForm = () => {
    if (!account.trim()) {
      Alert.alert("错误", "请输入游戏账号");
      return false;
    }
    if (!password.trim()) {
      Alert.alert("错误", "请输入游戏密码");
      return false;
    }
    if (!slotUuid) {
      Alert.alert("错误", "缺少槽位信息");
      return false;
    }
    return true;
  };

  // 处理提交
  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (isLoading) return;
    if (!recaptchaReady) {
      toast.warning("reCAPTCHA 未就绪，请稍候再试");
      return;
    }

    setIsLoading(true);
    try {
      // 获取 reCAPTCHA token
      const recaptchaResult = await getRecaptchaToken();
      if (recaptchaResult.error || !recaptchaResult.token) {
        Alert.alert("错误", recaptchaResult.error || "reCAPTCHA 验证失败");
        setIsLoading(false);
        return;
      }

      // 调用创建游戏API
      const response = await createGame(
        slotUuid,
        {
          account: account.trim(),
          password: password.trim(),
          platform,
        },
        recaptchaResult.token,
      );
      await fetchQuotaUser();
      await fetchGamesStatus();

      if (response.code === 1) {
        toast.success({
          text1: "创建成功",
          text2: "游戏账号已成功添加到托管槽位",
        });
        router.back();
      } else {
        Alert.alert("创建失败", response.message || "未知错误");
      }
    } catch (error) {
      Alert.alert(
        "创建失败",
        error instanceof Error ? error.message : "未知错误",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Pressable style={styles.backdrop} onPress={() => router.back()} />
      <View style={[styles.container, { backgroundColor: c.background }]}>
        {/* 隐藏的 reCAPTCHA WebView */}
        <View style={styles.recaptchaContainer}>
          <RecaptchaWebView />
        </View>

        {/* 头部 */}
        <View
          style={[
            styles.header,
            { borderBottomColor: c.border, backgroundColor: c.card },
          ]}
        >
          <Text style={[styles.title, { color: c.foreground }]}>
            添加游戏托管
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Text style={[styles.closeButton, { color: c.primary }]}>取消</Text>
          </Pressable>
        </View>

        {/* 表单内容 */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View>
            {/* 账号输入 */}
            <Input
              label="游戏账号"
              value={account}
              onChangeText={setAccount}
              placeholder="请输入游戏账号"
              keyboardType="default"
              editable={!isLoading}
            />

            {/* 密码输入 */}
            <Input
              label="游戏密码"
              value={password}
              onChangeText={setPassword}
              placeholder="请输入游戏密码"
              secureTextEntry
              editable={!isLoading}
            />

            {/* 平台选择 */}
            <View style={styles.platformGroup}>
              <Text style={[styles.platformLabel, { color: c.foreground }]}>
                游戏平台
              </Text>
              <RadioButton
                label="官服"
                value="official"
                selected={platform === GamePlatform.Official}
                onPress={() => setPlatform(GamePlatform.Official)}
                disabled={isLoading}
              />
              <RadioButton
                label="B服"
                value="bilibili"
                selected={platform === GamePlatform.Bilibili}
                onPress={() => setPlatform(GamePlatform.Bilibili)}
                disabled={isLoading}
              />
            </View>

            {/* 提示信息 */}
            <View
              style={[
                styles.infoBox,
                { backgroundColor: c.muted, borderColor: c.border },
              ]}
            >
              <Text style={[styles.infoText, { color: c.mutedFg }]}>
                • 请确保账号密码正确
              </Text>
              <Text style={[styles.infoText, { color: c.mutedFg }]}>
                • 创建后需要等待验证通过
              </Text>
              <Text style={[styles.infoText, { color: c.mutedFg }]}>
                • reCAPTCHA 验证需要网络连接
              </Text>
            </View>

            {/* 提交按钮 */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor:
                    isLoading || !recaptchaReady ? c.muted : c.primary,
                },
              ]}
              onPress={handleSubmit}
              disabled={isLoading || !recaptchaReady}
            >
              {isLoading ? (
                <ActivityIndicator color={c.primaryFg} />
              ) : (
                <Text style={[styles.submitButtonText, { color: c.primaryFg }]}>
                  {recaptchaReady ? "创建游戏" : "等待验证..."}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Use a light status bar on iOS to account for the black space above the modal */}
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </View>
      {/* Toast 组件在 modal 内部渲染，确保显示在 modal 之上 */}
      <Toast position="top" />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    overflow: "hidden",
  },
  recaptchaContainer: {
    position: "absolute",
    top: -1000,
    left: -1000,
    width: 1,
    height: 1,
    opacity: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  platformGroup: {
    marginBottom: 20,
  },
  platformLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoBox: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
