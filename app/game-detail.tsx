import { useData } from "@/providers/data";
import { useTheme } from "@/providers/theme";
import { IGameData } from "@/types/arkHost";
import { IQuotaUserSlot, QuotaRuleFlag } from "@/types/arkQuota";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSharedValue } from "react-native-reanimated";

// 平台映射
const PLATFORM_MAP: Record<number, string> = {
  1: "官服",
  2: "B服",
};

/**
 * 游戏详情页面
 * 支持手势切换：
 * - 从左往右滑动：返回上一页（由 Stack 导航原生支持）
 * - 从右往左滑动：显示下一个游戏（由 PagerView 实现）
 * - 循环浏览游戏列表
 */
export default function GameDetailScreen() {
  const { c } = useTheme();
  const router = useRouter();
  const { currentAuthSession, appStates } = useData();
  const { gamesData, quotaUsers } = appStates;

  // 获取路由参数
  const { account: accountParam } = useLocalSearchParams<{ account: string }>();

  // 获取当前用户的游戏数据和配额信息
  const currentGamesData = useMemo(() => {
    if (!currentAuthSession?.payload?.uuid) return [];
    return gamesData[currentAuthSession.payload.uuid] || [];
  }, [gamesData, currentAuthSession?.payload?.uuid]);

  const quotaUser = useMemo(() => {
    const uuid = currentAuthSession?.payload?.uuid;
    if (!uuid) return undefined;
    return quotaUsers?.[uuid] || undefined;
  }, [quotaUsers, currentAuthSession?.payload?.uuid]);

  // 构建与列表页相同的扁平游戏列表
  const games = useMemo(() => {
    if (!currentAuthSession?.payload?.uuid) return [];

    const entries: { slot: IQuotaUserSlot; game?: IGameData }[] = [];
    const matchedAccounts = new Set<string>();

    const visibleSlots =
      quotaUser?.slots?.filter((slot) => {
        const flags = slot.ruleFlags || [];
        const hidePhoneSlot =
          !slot.gameAccount &&
          flags.includes(QuotaRuleFlag.SlotAccountFormatIsPhone) &&
          flags.includes(QuotaRuleFlag.SlotAccountSMSVerified);
        return !hidePhoneSlot;
      }) || [];

    visibleSlots.forEach((slot) => {
      const game = Array.isArray(currentGamesData)
        ? currentGamesData.find(
            (g) => g.game_config?.account === slot.gameAccount,
          )
        : undefined;
      if (game?.game_config?.account) {
        matchedAccounts.add(game.game_config.account);
      }
      entries.push({ slot, game });
    });

    // 排序：有游戏的slots排在前面，空白的slots排在后面
    entries.sort((a, b) => {
      if (a.game && !b.game) return -1;
      if (!a.game && b.game) return 1;
      return 0;
    });

    const remainingGames = Array.isArray(currentGamesData)
      ? currentGamesData.filter((game) => {
          const account = game.game_config?.account;
          if (!account) return false;
          return !matchedAccounts.has(account);
        })
      : [];

    // 构建扁平的游戏列表，与渲染顺序一致
    const flatGames: IGameData[] = [];
    entries.forEach((entry) => {
      if (entry.game) {
        flatGames.push(entry.game);
      }
    });
    remainingGames.forEach((game) => {
      flatGames.push(game);
    });

    // 如果没有配额用户或没有槽位，直接返回原始游戏列表
    if (!quotaUser || visibleSlots.length === 0) {
      return currentGamesData;
    }

    return flatGames;
  }, [currentGamesData, quotaUser, currentAuthSession?.payload?.uuid]);

  // 根据 account 找到对应的游戏索引
  const initialIndex = useMemo(() => {
    if (!accountParam) return 0;
    const foundIndex = games.findIndex(
      (g) => g.status.account === accountParam,
    );
    return foundIndex >= 0 ? foundIndex : 0;
  }, [accountParam, games]);

  // 当前显示的游戏索引
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const pagerRef = useRef<PagerView>(null);

  // 动画值
  const pageOffset = useSharedValue(0);

  // 当 initialIndex 变化时，更新当前索引（用于处理 account 参数变化）
  useEffect(() => {
    setCurrentIndex(initialIndex);
    if (pagerRef.current) {
      pagerRef.current.setPage(initialIndex);
    }
  }, [initialIndex]);

  // 处理页面切换 - hooks 必须在条件返回之前
  const onPageSelected = useCallback(
    (e: { nativeEvent: { position: number } }) => {
      const position = e.nativeEvent.position;
      setCurrentIndex(position);
    },
    [],
  );

  // 处理页面滚动（用于动画效果）
  const onPageScroll = useCallback(
    (e: { nativeEvent: { position: number; offset: number } }) => {
      const { position, offset } = e.nativeEvent;
      pageOffset.value = position + offset;
    },
    [pageOffset],
  );

  // 当游戏数据为空时显示提示
  if (!games || games.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.background,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Text style={{ color: c.mutedFg, fontSize: 16, textAlign: "center" }}>
          暂无游戏数据
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: c.primary,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: c.primaryFg, fontWeight: "600" }}>返回</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* PagerView - 游戏详情滑动容器 */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={initialIndex}
        onPageSelected={onPageSelected}
        onPageScroll={onPageScroll}
        overdrag={true}
        pageMargin={16}
      >
        {games.map((game, idx) => (
          <GameDetailPage key={game.status.uuid || idx} game={game} />
        ))}
      </PagerView>
    </View>
  );
}

/**
 * 单个游戏详情页面
 */
function GameDetailPage({ game }: { game: IGameData }) {
  const { c } = useTheme();
  const { status, game_config } = game;

  // 头像URL
  const avatarUrl = status.avatar?.id
    ? `https://example.com/avatars/${status.avatar.id}.png`
    : null;

  // 获取平台名称
  const platformName =
    PLATFORM_MAP[status.platform] || `平台${status.platform}`;

  // 隐藏部分账号信息
  const maskedAccount = status.account
    ? `${status.account.slice(0, 4)}****${status.account.slice(-4)}`
    : "";

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* 头部卡片 - 基本信息 */}
      <View
        style={{
          backgroundColor: c.card,
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: c.border,
          marginBottom: 16,
        }}
      >
        {/* 头像和等级 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          {/* 大头像 */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              backgroundColor: c.muted,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
              overflow: "hidden",
            }}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 80, height: 80 }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ color: c.mutedFg, fontSize: 36 }}>🎮</Text>
            )}
          </View>

          {/* 昵称和等级 */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: c.primary,
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 4,
              }}
            >
              Dr. {status.nick_name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text
                style={{
                  color: c.foreground,
                  fontSize: 48,
                  fontWeight: "bold",
                }}
              >
                {status.level}
              </Text>
              <Text
                style={{
                  color: c.mutedFg,
                  fontSize: 14,
                  marginLeft: 8,
                }}
              >
                Lv. 博士等级
              </Text>
            </View>
          </View>

          {/* 平台标签 */}
          <View
            style={{
              backgroundColor: c.primary,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              position: "absolute",
              top: 0,
              right: 0,
            }}
          >
            <Text
              style={{
                color: c.primaryFg,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {platformName}
            </Text>
          </View>
        </View>

        {/* 账号信息 */}
        <View
          style={{
            backgroundColor: c.muted,
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Text style={{ color: c.mutedFg, fontSize: 12, marginBottom: 4 }}>
            账号
          </Text>
          <Text style={{ color: c.foreground, fontSize: 16 }}>
            {maskedAccount}
          </Text>
        </View>
      </View>

      {/* 状态卡片 */}
      <View
        style={{
          backgroundColor: c.card,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: c.border,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            color: c.foreground,
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          当前状态
        </Text>

        <View style={{ gap: 12 }}>
          {/* 状态 */}
          <DetailRow
            label="运行状态"
            value={status.text || "未知"}
            valueColor={c.accent}
          />

          {/* 理智 */}
          <DetailRow label="当前理智" value={`${status.ap}`} icon="⚡" />

          {/* 地图 */}
          <DetailRow
            label="作战地图"
            value={game_config.map_id || "无"}
            icon="🗺️"
          />

          {/* 是否暂停 */}
          <DetailRow
            label="托管状态"
            value={game_config.is_stopped ? "已暂停" : "运行中"}
            valueColor={game_config.is_stopped ? c.destructive : c.primary}
            icon={game_config.is_stopped ? "⏸️" : "▶️"}
          />
        </View>
      </View>

      {/* 配置卡片 */}
      <View
        style={{
          backgroundColor: c.card,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: c.border,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            color: c.foreground,
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          托管配置
        </Text>

        <View style={{ gap: 12 }}>
          {/* 保留理智 */}
          <DetailRow
            label="保留理智"
            value={`${game_config.keeping_ap}`}
            icon="💎"
          />

          {/* 自动作战 */}
          <DetailRow
            label="自动作战"
            value={game_config.is_auto_battle ? "开启" : "关闭"}
            valueColor={game_config.is_auto_battle ? c.primary : c.mutedFg}
          />

          {/* 基建排班 */}
          <DetailRow
            label="基建排班"
            value={game_config.enable_building_arrange ? "开启" : "关闭"}
            valueColor={
              game_config.enable_building_arrange ? c.primary : c.mutedFg
            }
          />

          {/* 加速位 */}
          <DetailRow
            label="加速位"
            value={
              game_config.accelerate_slot_cn ||
              game_config.accelerate_slot ||
              "无"
            }
          />

          {/* 公招 */}
          <DetailRow
            label="公招保留"
            value={`${game_config.recruit_reserve}`}
          />

          {/* 忽略机器人 */}
          <DetailRow
            label="忽略机器人"
            value={game_config.recruit_ignore_robot ? "是" : "否"}
          />
        </View>
      </View>

      {/* 作战地图卡片 */}
      {game_config.battle_maps && game_config.battle_maps.length > 0 && (
        <View
          style={{
            backgroundColor: c.card,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: c.border,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: c.foreground,
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            作战地图列表
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {game_config.battle_maps.map((mapId, idx) => (
              <View
                key={idx}
                style={{
                  backgroundColor:
                    mapId === game_config.map_id ? c.primary : c.muted,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color:
                      mapId === game_config.map_id ? c.primaryFg : c.foreground,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  {mapId}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 其他信息 */}
      <View
        style={{
          backgroundColor: c.card,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: c.border,
        }}
      >
        <Text
          style={{
            color: c.foreground,
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          其他信息
        </Text>

        <View style={{ gap: 12 }}>
          {/* UUID */}
          <DetailRow
            label="游戏 UUID"
            value={status.uuid?.slice(0, 8) + "..."}
          />

          {/* 创建时间 */}
          <DetailRow
            label="创建时间"
            value={
              status.created_at
                ? new Date(status.created_at * 1000).toLocaleDateString("zh-CN")
                : "未知"
            }
          />

          {/* 验证状态 */}
          <DetailRow
            label="验证状态"
            value={status.is_verify ? "已验证" : "未验证"}
            valueColor={status.is_verify ? c.primary : c.mutedFg}
          />

          {/* 登录协助 */}
          <DetailRow
            label="登录协助"
            value={game_config.allow_login_assist ? "允许" : "禁止"}
          />
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * 详情行组件
 */
function DetailRow({
  label,
  value,
  icon,
  valueColor,
}: {
  label: string;
  value: string;
  icon?: string;
  valueColor?: string;
}) {
  const { c } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: c.border,
      }}
    >
      <Text style={{ color: c.mutedFg, fontSize: 14 }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {icon && <Text style={{ fontSize: 16, marginRight: 6 }}>{icon}</Text>}
        <Text
          style={{
            color: valueColor || c.foreground,
            fontSize: 14,
            fontWeight: "500",
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
