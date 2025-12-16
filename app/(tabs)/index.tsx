import { Href, useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Announcement } from "@/components/Announcement";
import { EmptySlotCard } from "@/components/EmptySlotCard";
import { GameDataCard, GameDataList } from "@/components/GameDataCard";
import { useData } from "@/providers/data";
import { useClosure } from "@/providers/services/useClosure";
import { useTheme } from "@/providers/theme";
import { IGameData } from "@/types/arkHost";
import { IQuotaUserSlot, QuotaRuleFlag } from "@/types/arkQuota";

export default function HomeScreen() {
  const pagerRef = useRef<PagerView>(null);
  const router = useRouter();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { currentAuthSession, appStates } = useData();
  const { fetchArkHostConfig } = useClosure();
  const { arkHostConfig, gamesData } = appStates;

  // 计算底部 padding：tabs 栏高度（约 60px）+ 安全区域 + 额外空间
  const bottomPadding = 60 + insets.bottom + 20;

  const quotaUser = useMemo(() => {
    const uuid = currentAuthSession?.payload?.uuid;
    if (!uuid) return undefined;
    return appStates.quotaUsers?.[uuid] || undefined;
  }, [appStates.quotaUsers, currentAuthSession?.payload?.uuid]);

  const currentGamesData = useMemo(() => {
    if (!currentAuthSession?.payload?.uuid) return [];
    return gamesData[currentAuthSession.payload.uuid] || [];
  }, [gamesData, currentAuthSession?.payload?.uuid]);

  const { slotEntries, standaloneGames } = useMemo(() => {
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
      if (a.game && !b.game) return -1; // a有游戏，b没有，a排前面
      if (!a.game && b.game) return 1; // a没有游戏，b有，b排前面
      return 0; // 都有或都没有，保持原顺序
    });

    const remainingGames = Array.isArray(currentGamesData)
      ? currentGamesData.filter((game) => {
          const account = game.game_config?.account;
          if (!account) return false;
          return !matchedAccounts.has(account);
        })
      : [];

    return {
      slotEntries: entries,
      standaloneGames: remainingGames,
    };
  }, [currentGamesData, quotaUser?.slots]);

  useEffect(() => {
    const token = currentAuthSession?.credential?.token;
    if (!token) return;
    fetchArkHostConfig();
  }, [currentAuthSession?.credential?.token, fetchArkHostConfig]);

  return (
    <PagerView
      ref={pagerRef}
      style={{ flex: 1, backgroundColor: c.background }}
      initialPage={0}
      orientation="vertical"
    >
      {/* 第一页 - 主页 */}
      <View key="0" style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1, backgroundColor: c.background }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: bottomPadding,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* 系统公告 */}
          <Announcement
            content={arkHostConfig?.announcement}
            title="今日特价"
            maxHeight={140}
          />

          {/* 欢迎区域 */}
          <View
            style={{
              marginTop: 20,
              backgroundColor: c.card,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: c.border,
            }}
          >
            <Text
              style={{
                color: c.cardFg,
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 8,
              }}
            >
              欢迎回来 👋
            </Text>
            <Text style={{ color: c.mutedFg, fontSize: 14, lineHeight: 22 }}>
              {currentAuthSession?.payload?.email
                ? `你好，${currentAuthSession.payload.email}`
                : "请登录以使用完整功能"}
            </Text>
          </View>

          {/* 状态信息 */}
          <View
            style={{
              marginTop: 20,
              backgroundColor: c.card,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: c.border,
            }}
          >
            <Text
              style={{
                color: c.cardFg,
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 12,
              }}
            >
              服务状态
            </Text>
            <View style={{ gap: 8 }}>
              <StatusItem
                label="维护状态"
                value={arkHostConfig?.isUnderMaintenance ? "维护中" : "正常"}
                isGood={!arkHostConfig?.isUnderMaintenance}
              />
              <StatusItem
                label="游戏登录"
                value={arkHostConfig?.allowGameLogin ? "允许" : "禁止"}
                isGood={arkHostConfig?.allowGameLogin}
              />
              <StatusItem
                label="API 版本"
                value={arkHostConfig?.apiVersion || "未知"}
              />
            </View>
          </View>

          {/* 提示信息 */}
          <View style={{ marginTop: 20, alignItems: "center" }}>
            <Text
              style={{ color: c.mutedFg, fontSize: 14, fontStyle: "italic" }}
            >
              向下滑动查看更多内容
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* 第二页 - 游戏数据 */}
      <View key="1" style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1, backgroundColor: c.background }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: bottomPadding,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* 页面标题 */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                color: c.foreground,
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 4,
              }}
            >
              我的游戏
            </Text>
            <Text style={{ color: c.mutedFg, fontSize: 14 }}>
              {currentGamesData?.length || 0} 个游戏账号
            </Text>
          </View>

          {/* 游戏数据列表 & 托管槽 */}
          {slotEntries.length > 0 ? (
            <View style={{ gap: 16 }}>
              {slotEntries.map((entry, index) => {
                if (!entry.game) {
                  return (
                    <EmptySlotCard
                      key={entry.slot.uuid || `empty-${index}`}
                      slot={entry.slot}
                    />
                  );
                }
                // 使用 account 作为唯一标识
                const gameAccount = entry.game?.status.account;
                return (
                  <GameDataCard
                    key={entry.slot.uuid || index}
                    data={entry.game}
                    index={index}
                    onPress={() =>
                      router.push(`/game-detail?account=${gameAccount}` as Href)
                    }
                    onPause={() =>
                      console.log("暂停游戏:", entry.game?.status.account)
                    }
                    onDelete={() =>
                      console.log("删除游戏:", entry.game?.status.account)
                    }
                  />
                );
              })}

              {/* 未绑定槽位但仍需展示的游戏 */}
              {standaloneGames.map((game, idx) => {
                // 使用 account 作为唯一标识
                const gameAccount = game.status.account;
                return (
                  <GameDataCard
                    key={game.status.uuid || `orphan-${idx}`}
                    data={game}
                    index={slotEntries.length + idx}
                    onPress={() =>
                      router.push(`/game-detail?account=${gameAccount}` as Href)
                    }
                    onPause={() =>
                      console.log("暂停游戏:", game.status.account)
                    }
                    onDelete={() =>
                      console.log("删除游戏:", game.status.account)
                    }
                  />
                );
              })}
            </View>
          ) : (
            <GameDataList
              games={currentGamesData || []}
              onPress={(game: IGameData, _index: number) => {
                // 导航到游戏详情页，传递 account
                router.push(
                  `/game-detail?account=${game.status.account}` as Href,
                );
              }}
              onPause={(game: IGameData) => {
                console.log("暂停游戏:", game.status.nick_name);
                // TODO: 实现暂停逻辑
              }}
              onDelete={(game: IGameData) => {
                console.log("删除游戏:", game.status.nick_name);
                // TODO: 实现删除逻辑
              }}
            />
          )}
          {/* 提示信息 */}
          <View style={{ marginTop: 20, alignItems: "center" }}>
            <Text
              style={{ color: c.mutedFg, fontSize: 14, fontStyle: "italic" }}
            >
              向上滑动返回主页
            </Text>
          </View>
        </ScrollView>
      </View>
    </PagerView>
  );
}

// 状态项组件
function StatusItem({
  label,
  value,
  isGood,
}: {
  label: string;
  value: string;
  isGood?: boolean;
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
      <Text
        style={{
          color:
            isGood === undefined
              ? c.cardFg
              : isGood
                ? c.primary
                : c.destructive,
          fontSize: 14,
          fontWeight: "500",
        }}
      >
        {value}
      </Text>
    </View>
  );
}
