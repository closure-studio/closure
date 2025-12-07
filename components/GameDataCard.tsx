import { useRecaptcha } from "@/hooks/auth/useRecaptcha";
import { useClosure } from "@/providers/services/useClosure";
import { useSystem } from "@/providers/system";
import { useTheme } from "@/providers/theme";
import { IGameData } from "@/types/arkHost";
import {
  Image,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

interface GameDataCardProps {
  data: IGameData;
  index?: number;
  onPress?: () => void;
  onPause?: () => void;
  onDelete?: () => void;
  onChangePassword?: () => void;
}

// 平台映射
const PLATFORM_MAP: Record<number, string> = {
  1: "官服",
  2: "B服",
};

// 状态图标映射（根据实际情况调整）
const STATUS_ICONS = ["⚡", "🎯", "🎮", "🔧"];

/**
 * 游戏数据卡片组件
 * 展示游戏账号的基本信息、状态和操作按钮
 */
export function GameDataCard({
  data,
  index,
  onPress,
  onPause,
  onDelete,
  onChangePassword,
}: GameDataCardProps) {
  const { c } = useTheme();
  const { toast } = useSystem();
  const { width } = useWindowDimensions();
  const { status, game_config } = data;
  const { startGame, updateGameConfig, deleteGame } = useClosure();
  const {
    getRecaptchaToken,
    RecaptchaWebView,
    isReady: isRecaptchaReady,
  } = useRecaptcha();

  // 启动游戏
  const handleStart = async () => {
    if (!isRecaptchaReady) {
      toast.error("reCAPTCHA 正在加载，请稍后再试");
      return;
    }

    try {
      const { token, error } = await getRecaptchaToken();
      if (error) {
        toast.error(error);
        return;
      }

      const response = await startGame(status.account, token);
      if (response.code === 1) {
        toast.success(response.message || "启动成功");
      } else {
        toast.error(response.message || "启动失败");
      }
    } catch (err: any) {
      toast.error(err.message || "启动失败，请重试");
    }
  };

  // 暂停托管
  const handlePause = async () => {
    try {
      const response = await updateGameConfig(status.account, {
        is_stopped: true,
      });
      if (response.code === 1) {
        toast.success(response.message || "暂停成功");
      } else {
        toast.error(response.message || "暂停失败");
      }
    } catch (err: any) {
      toast.error(err.message || "暂停失败，请重试");
    }
  };

  // 删除游戏
  const handleDelete = async () => {
    if (!isRecaptchaReady) {
      toast.error("reCAPTCHA 正在加载，请稍后再试");
      return;
    }

    try {
      const { token, error } = await getRecaptchaToken();
      if (error) {
        toast.error(error);
        return;
      }

      const response = await deleteGame(status.uuid, token);
      if (response.code === 1) {
        toast.success(response.message || "删除成功");
      } else {
        toast.error(response.message || "删除失败");
      }
    } catch (err: any) {
      toast.error(err.message || "删除失败，请重试");
    }
  };

  // 计算卡片宽度（两侧留 16px padding）
  const cardWidth = width - 32;

  // 隐藏部分账号信息
  const maskedAccount = status.account
    ? `【${status.account.slice(0, 4)}****${status.account.slice(-4)}】`
    : "";

  // 获取平台名称
  const platformName =
    PLATFORM_MAP[status.platform] || `平台${status.platform}`;

  // 头像URL（如果有的话）
  const avatarUrl = status.avatar?.id
    ? `https://example.com/avatars/${status.avatar.id}.png` // 替换为实际的头像URL
    : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: cardWidth,
        backgroundColor: c.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: c.border,
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {/* 顶部区域：头像、等级、平台 */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        {/* 左侧：头像 + 等级 */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* 头像 */}
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: c.muted,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              overflow: "hidden",
            }}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 48, height: 48 }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ color: c.mutedFg, fontSize: 20 }}>🎮</Text>
            )}
          </View>

          {/* 等级 */}
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text
              style={{
                color: c.foreground,
                fontSize: 36,
                fontWeight: "bold",
              }}
            >
              {status.level}
            </Text>
            <View style={{ marginLeft: 8 }}>
              <Text style={{ color: c.mutedFg, fontSize: 12 }}>Lv.</Text>
              <Text style={{ color: c.mutedFg, fontSize: 12 }}>博士等级</Text>
            </View>
          </View>
        </View>

        {/* 右侧：平台标签 */}
        <View
          style={{
            backgroundColor: c.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: c.primaryFg,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {platformName}
          </Text>
        </View>
      </View>

      {/* 昵称和账号 */}
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text
            style={{
              color: c.primary,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            Dr. {status.nick_name}
          </Text>
          <Text
            style={{
              color: c.secondary,
              fontSize: 14,
              marginLeft: 8,
              fontStyle: "italic",
            }}
          >
            {maskedAccount}
          </Text>
        </View>
      </View>

      {/* 状态信息行 */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: c.border,
        }}
      >
        {/* 理智 */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.mutedFg, fontSize: 12, marginBottom: 2 }}>
            理智 //
          </Text>
          <Text
            style={{
              color: c.foreground,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {status.ap}
          </Text>
        </View>

        {/* 地图 */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ color: c.mutedFg, fontSize: 12, marginBottom: 2 }}>
            地图 //
          </Text>
          <Text
            style={{
              color: c.foreground,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {game_config.map_id || "无"}
          </Text>
        </View>

        {/* 状态 */}
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={{ color: c.mutedFg, fontSize: 12, marginBottom: 2 }}>
            状态 //
          </Text>
          <Text
            style={{
              color: c.accent,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {status.text || "未知"}
          </Text>
        </View>
      </View>

      {/* 状态图标行 */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 12,
          gap: 8,
        }}
      >
        {STATUS_ICONS.map((icon, index) => (
          <Text
            key={index}
            style={{
              color: c.primary,
              fontSize: 20,
            }}
          >
            {icon}
          </Text>
        ))}
      </View>

      {/* 底部按钮 */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 8,
        }}
      >
        {/* 启动按钮 */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            handleStart();
          }}
          style={{
            flex: 1,
            minWidth: "45%",
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: c.primary,
            backgroundColor: "transparent",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: c.primary,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            启动
          </Text>
        </Pressable>

        {/* 暂停按钮 */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            handlePause();
          }}
          style={{
            flex: 1,
            minWidth: "45%",
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: c.accent,
            backgroundColor: "transparent",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: c.accent,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            暂停
          </Text>
        </Pressable>

        {/* 删除按钮 */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          style={{
            flex: 1,
            minWidth: "45%",
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: c.destructive,
            backgroundColor: "transparent",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: c.destructive,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            删除
          </Text>
        </Pressable>

        {/* 修改密码按钮 */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onChangePassword?.();
          }}
          style={{
            flex: 1,
            minWidth: "45%",
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: c.secondary,
            backgroundColor: "transparent",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: c.secondary,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            修改密码
          </Text>
        </Pressable>
      </View>

      {/* 隐藏的 reCAPTCHA WebView */}
      <RecaptchaWebView />
    </Pressable>
  );
}

/**
 * 游戏数据卡片列表组件
 * 用于渲染多个游戏数据卡片
 */
interface GameDataListProps {
  games: IGameData[];
  onPress?: (game: IGameData, index: number) => void;
  onPause?: (game: IGameData) => void;
  onDelete?: (game: IGameData) => void;
  onChangePassword?: (game: IGameData) => void;
}

export function GameDataList({
  games,
  onPress,
  onPause,
  onDelete,
  onChangePassword,
}: GameDataListProps) {
  const { c } = useTheme();

  if (!games || games.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <Text style={{ color: c.mutedFg, fontSize: 16, textAlign: "center" }}>
          暂无游戏数据
        </Text>
        <Text
          style={{
            color: c.mutedFg,
            fontSize: 14,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          请先添加游戏账号
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 16 }}>
      {games?.length > 0 &&
        games?.map((game, index) => (
          <GameDataCard
            key={game.status.uuid || index}
            data={game}
            index={index}
            onPress={() => onPress?.(game, index)}
            onPause={() => onPause?.(game)}
            onDelete={() => onDelete?.(game)}
            onChangePassword={() => onChangePassword?.(game)}
          />
        ))}
    </View>
  );
}
