import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { useData } from "@/providers/data";
import { useClosure } from "@/providers/services/useClosure";
import { useSystem } from "@/providers/system";
import { useTheme } from "@/providers/theme";
import { IGameConfig } from "@/types/arkHost";

// 基建无人机加速槽位配置
const ACCELERATE_SLOTS_CN = [
  "上层左",
  "上层中",
  "上层右",
  "中层左",
  "中层中",
  "中层右",
  "下层左",
  "下层中",
  "下层右",
];

/**
 * 基建槽位选择器组件
 */
function BaseDesignSelector({
  selectedSlot,
  onSlotChange,
  disabled,
}: {
  selectedSlot: string;
  onSlotChange: (slot: string) => void;
  disabled?: boolean;
}) {
  const getSlotStyle = (slot: string) => {
    const isSelected = slot === selectedSlot;

    return {
      width: 64,
      height: 40,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: "#FFA500",
      backgroundColor: isSelected ? "#FFA500" : "transparent",
      alignItems: "center" as const,
      justifyContent: "center" as const,
    };
  };

  // 将9个按钮分成3行
  const topRow = ACCELERATE_SLOTS_CN.slice(0, 3); // 上层左、上层中、上层右
  const middleRow = ACCELERATE_SLOTS_CN.slice(3, 6); // 中层左、中层中、中层右
  const bottomRow = ACCELERATE_SLOTS_CN.slice(6, 9); // 下层左、下层中、下层右

  return (
    <View style={{ alignItems: "center", marginBottom: 16 }}>
      {/* 上层 */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {topRow.map((slot, index) => (
          <TouchableOpacity
            key={index}
            style={getSlotStyle(slot)}
            onPress={() => onSlotChange(slot)}
            disabled={disabled}
          />
        ))}
      </View>

      {/* 中层 - 向左偏移 */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          marginBottom: 8,
          marginLeft: -56,
        }}
      >
        {middleRow.map((slot, index) => (
          <TouchableOpacity
            key={index}
            style={getSlotStyle(slot)}
            onPress={() => onSlotChange(slot)}
            disabled={disabled}
          />
        ))}
      </View>

      {/* 下层 */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {bottomRow.map((slot, index) => (
          <TouchableOpacity
            key={index}
            style={getSlotStyle(slot)}
            onPress={() => onSlotChange(slot)}
            disabled={disabled}
          />
        ))}
      </View>
    </View>
  );
}

export default function EditGameConfigModal() {
  const router = useRouter();
  const { c } = useTheme();
  const { toast } = useSystem();
  const { updateGameConfig, fetchGamesStatus } = useClosure();
  const { currentAuthSession, appStates } = useData();
  const { gamesData } = appStates;

  // 获取路由参数 - 游戏账号
  const { account } = useLocalSearchParams<{ account: string }>();

  // 查找当前游戏
  const currentGame = useMemo(() => {
    if (!currentAuthSession?.payload?.uuid || !account) return null;
    const games = gamesData[currentAuthSession.payload.uuid] || [];
    return games.find((g) => g.status.account === account) || null;
  }, [gamesData, currentAuthSession?.payload?.uuid, account]);

  // 初始配置
  const initialConfig: IGameConfig = useMemo(() => {
    if (currentGame?.game_config) {
      return { ...currentGame.game_config };
    }
    return {
      account: "",
      accelerate_slot: "",
      accelerate_slot_cn: "",
      battle_maps: [],
      enable_building_arrange: false,
      is_auto_battle: false,
      is_stopped: false,
      keeping_ap: 0,
      recruit_ignore_robot: false,
      recruit_reserve: 0,
      map_id: "",
      allow_login_assist: false,
    };
  }, [currentGame]);

  // 表单状态
  const [keepingAp, setKeepingAp] = useState(String(initialConfig.keeping_ap));
  const [recruitReserve, setRecruitReserve] = useState(
    String(initialConfig.recruit_reserve),
  );
  const [enableBuildingArrange, setEnableBuildingArrange] = useState(
    initialConfig.enable_building_arrange,
  );
  const [isAutoBattle, setIsAutoBattle] = useState(
    initialConfig.is_auto_battle,
  );
  const [recruitIgnoreRobot, setRecruitIgnoreRobot] = useState(
    initialConfig.recruit_ignore_robot,
  );
  const [allowLoginAssist, setAllowLoginAssist] = useState(
    initialConfig.allow_login_assist,
  );
  const [accelerateSlotCn, setAccelerateSlotCn] = useState(
    initialConfig.accelerate_slot_cn,
  );
  const [battleMaps, setBattleMaps] = useState<string[]>(
    initialConfig.battle_maps || [],
  );
  const [stageKeyword, setStageKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock stages data - 根据用户要求，assets相关使用mock
  const mockStages: { [key: string]: { code: string; name: string } } = useMemo(
    () => ({
      "1-7": { code: "1-7", name: "荒芜行动" },
      "CE-5": { code: "CE-5", name: "沸石行动" },
      "LS-5": { code: "LS-5", name: "货物运输" },
      "AP-5": { code: "AP-5", name: "固若金汤" },
      "CA-5": { code: "CA-5", name: "身先士卒" },
      "SK-5": { code: "SK-5", name: "摧枯拉朽" },
      "4-4": { code: "4-4", name: "无限蔓延" },
      "S4-1": { code: "S4-1", name: "记忆交织" },
    }),
    [],
  );

  // 过滤关卡
  const filteredStages = useMemo(() => {
    if (!stageKeyword.trim()) return mockStages;

    const keyword = stageKeyword.toLowerCase();
    const filtered: typeof mockStages = {};

    Object.entries(mockStages).forEach(([key, value]) => {
      if (
        key.toLowerCase().includes(keyword) ||
        value.code.toLowerCase().includes(keyword) ||
        value.name.toLowerCase().includes(keyword)
      ) {
        filtered[key] = value;
      }
    });

    return filtered;
  }, [stageKeyword, mockStages]);

  // 添加关卡到作战队列
  const addStageToConfig = useCallback(
    (stageCode: string) => {
      if (!battleMaps.includes(stageCode)) {
        setBattleMaps([stageCode, ...battleMaps]);
      }
    },
    [battleMaps],
  );

  // 从作战队列移除关卡
  const removeBattleMap = useCallback(
    (battleMap: string) => {
      setBattleMaps(battleMaps.filter((item) => item !== battleMap));
    },
    [battleMaps],
  );

  // 获取关卡名称
  const getStageName = useCallback(
    (stageCode: string) => {
      const stage = mockStages[stageCode];
      if (stage) {
        return `${stage.code} ${stage.name}`;
      }
      return stageCode;
    },
    [mockStages],
  );

  // 验证表单
  const validateForm = () => {
    const keepingApNum = Number(keepingAp);
    const recruitReserveNum = Number(recruitReserve);

    if (isNaN(keepingApNum) || keepingApNum < 0) {
      toast.warning({
        text1: "警告",
        text2: "理智保留不能小于0",
      });
      return false;
    }

    if (isNaN(recruitReserveNum) || recruitReserveNum < 0) {
      toast.warning({
        text1: "警告",
        text2: "招募卷保留不能小于0",
      });
      return false;
    }

    if (!currentGame?.status?.uuid) {
      toast.error({
        text1: "错误",
        text2: "未找到游戏信息",
      });
      return false;
    }

    return true;
  };

  // 处理提交
  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (isLoading) return;

    setIsLoading(true);
    try {
      // 构建更新配置 - 只发送可修改的字段
      const updateConfig: Partial<IGameConfig> = {
        keeping_ap: Number(keepingAp),
        recruit_reserve: Number(recruitReserve),
        enable_building_arrange: enableBuildingArrange,
        is_auto_battle: isAutoBattle,
        recruit_ignore_robot: recruitIgnoreRobot,
        accelerate_slot_cn: accelerateSlotCn,
        battle_maps: battleMaps,
        // allow_login_assist 设为不可修改
      };

      // 调用更新API
      const response = await updateGameConfig(
        currentGame!.status.account,
        updateConfig,
      );

      if (response.code === 1) {
        toast.success({
          text1: "更新成功",
          text2: "游戏配置已更新",
        });
        // 刷新游戏数据
        await fetchGamesStatus();
        router.back();
      } else {
        Alert.alert("更新失败", response.message || "未知错误");
      }
    } catch (error) {
      Alert.alert(
        "更新失败",
        error instanceof Error ? error.message : "未知错误",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 如果没有找到游戏，显示错误
  if (!currentGame) {
    return (
      <>
        <Pressable style={styles.backdrop} onPress={() => router.back()} />
        <View style={[styles.container, { backgroundColor: c.background }]}>
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: c.foreground, fontSize: 16 }}>
              未找到游戏信息
            </Text>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: c.primary }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.submitButtonText, { color: c.primaryFg }]}>
                返回
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Pressable style={styles.backdrop} onPress={() => router.back()} />
      <View style={[styles.container, { backgroundColor: c.background }]}>
        {/* 头部 */}
        <View
          style={[
            styles.header,
            { borderBottomColor: c.border, backgroundColor: c.card },
          ]}
        >
          <Text style={[styles.title, { color: c.foreground }]}>托管配置</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Text style={[styles.closeButton, { color: c.primary }]}>关闭</Text>
          </Pressable>
        </View>

        {/* 表单内容 */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 警告提示 */}
          <View
            style={[
              styles.warningBox,
              { backgroundColor: c.muted, borderColor: "#FFA500" },
            ]}
          >
            <Text style={[styles.warningText, { color: "#FFA500" }]}>
              ⚠️ 请在普瑞赛斯指导下使用
            </Text>
          </View>

          {/* 数值输入区域 */}
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: c.foreground }]}>
                理智保留
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: c.card,
                    color: c.foreground,
                    borderColor: c.border,
                  },
                ]}
                value={keepingAp}
                onChangeText={setKeepingAp}
                keyboardType="numeric"
                editable={!isLoading}
                placeholder="0"
                placeholderTextColor={c.mutedFg}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: c.foreground }]}>
                招募卷保留
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: c.card,
                    color: c.foreground,
                    borderColor: c.border,
                  },
                ]}
                value={recruitReserve}
                onChangeText={setRecruitReserve}
                keyboardType="numeric"
                editable={!isLoading}
                placeholder="0"
                placeholderTextColor={c.mutedFg}
              />
            </View>
          </View>

          {/* 分隔线 */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
            <Text style={[styles.dividerText, { color: c.mutedFg }]}>
              智能开关
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
          </View>

          {/* 开关区域 */}
          <View style={styles.switchGrid}>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: c.foreground }]}>
                自动基建
              </Text>
              <Switch
                value={enableBuildingArrange}
                onValueChange={setEnableBuildingArrange}
                disabled={isLoading}
                trackColor={{ false: c.muted, true: c.primary }}
                thumbColor={c.card}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: c.foreground }]}>
                自动作战
              </Text>
              <Switch
                value={isAutoBattle}
                onValueChange={setIsAutoBattle}
                disabled={isLoading}
                trackColor={{ false: c.muted, true: c.primary }}
                thumbColor={c.card}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: c.foreground }]}>
                忽略小车
              </Text>
              <Switch
                value={recruitIgnoreRobot}
                onValueChange={setRecruitIgnoreRobot}
                disabled={isLoading}
                trackColor={{ false: c.muted, true: c.primary }}
                thumbColor={c.card}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: c.foreground }]}>
                协助登录
              </Text>
              <Switch
                value={allowLoginAssist}
                onValueChange={setAllowLoginAssist}
                disabled={true}
                trackColor={{ false: c.muted, true: c.primary }}
                thumbColor={c.card}
              />
            </View>
          </View>

          {/* 无人机加速 */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
            <Text style={[styles.dividerText, { color: c.mutedFg }]}>
              无人机加速
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
          </View>

          <BaseDesignSelector
            selectedSlot={accelerateSlotCn}
            onSlotChange={setAccelerateSlotCn}
            disabled={isLoading}
          />

          {/* 作战地图 */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
            <Text style={[styles.dividerText, { color: c.mutedFg }]}>
              作战地图
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
          </View>

          {/* 搜索关卡 */}
          <TextInput
            style={[
              styles.inputFullWidth,
              {
                backgroundColor: c.card,
                color: c.foreground,
                borderColor: c.border,
                textAlign: "center",
              },
            ]}
            value={stageKeyword}
            onChangeText={setStageKeyword}
            editable={!isLoading}
            placeholder="-- 请输入代号\名称 --"
            placeholderTextColor={c.mutedFg}
          />

          {/* 作战队列标题 */}
          <View style={[styles.divider, { marginTop: 16 }]}>
            <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
            <Text style={[styles.dividerText, { color: c.mutedFg }]}>
              作战队列
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
          </View>

          {/* 关卡列表 */}
          <View style={styles.stageContainer}>
            {/* 可添加的关卡 */}
            {Object.entries(filteredStages).map(([key, stage]) => {
              if (battleMaps.includes(key)) return null;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.stageButton,
                    styles.stageButtonDashed,
                    { borderColor: "#FFA500", backgroundColor: "transparent" },
                  ]}
                  onPress={() => addStageToConfig(key)}
                  disabled={isLoading}
                >
                  <Text style={[styles.stageButtonText, { color: "#FFA500" }]}>
                    {stage.code} {stage.name}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* 已添加的关卡 */}
            {battleMaps.map((battleMap) => (
              <TouchableOpacity
                key={battleMap}
                style={[
                  styles.stageButton,
                  {
                    borderColor: "#FFA500",
                    backgroundColor: "rgba(255, 165, 0, 0.1)",
                  },
                ]}
                onPress={() => removeBattleMap(battleMap)}
                disabled={isLoading}
              >
                <Text style={[styles.stageButtonText, { color: "#FFA500" }]}>
                  {getStageName(battleMap)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 按钮组 */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: isLoading ? c.muted : c.destructive },
              ]}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={c.primaryFg} size="small" />
              ) : (
                <Text style={[styles.buttonText, { color: c.primaryFg }]}>
                  关闭
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: isLoading ? c.muted : c.primary },
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={c.primaryFg} size="small" />
              ) : (
                <Text style={[styles.buttonText, { color: c.primaryFg }]}>
                  递交
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </View>
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
    maxHeight: "90%",
    overflow: "hidden",
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
    fontSize: 24,
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
    paddingBottom: 40,
  },
  warningBox: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  warningText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  inputFullWidth: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  switchGrid: {
    gap: 12,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  stageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  stageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  stageButtonDashed: {
    borderStyle: "dashed",
    opacity: 0.6,
  },
  stageButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
