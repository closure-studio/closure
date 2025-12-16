import { useRouter } from "expo-router";
import { Pressable, Text, useWindowDimensions } from "react-native";

import { useData } from "@/providers/data";
import { useSystem } from "@/providers/system";
import { useTheme } from "@/providers/theme";
import { IQuotaUserSlot, QuotaRuleFlag } from "@/types/arkQuota";
import { useCallback, useMemo } from "react";

interface EmptySlotCardProps {
  slot: IQuotaUserSlot;
}

export function EmptySlotCard(props: EmptySlotCardProps) {
  const { slot } = props;
  const router = useRouter();
  const { toast } = useSystem();
  const { c } = useTheme();
  const { currentQuotaUser } = useData();
  const { width } = useWindowDimensions();
  const cardWidth = width - 32;
  const slotIdentifier = slot.uuid || slot.gameAccount || "slot";

  const isQQSlot = useMemo(() => {
    return slot.ruleFlags.includes(QuotaRuleFlag.SlotUserQQVerified);
  }, [slot]);

  const isDisabled = useMemo(() => {
    if (!currentQuotaUser) return true;
    if (isQQSlot) {
      if (!currentQuotaUser) return true;
      if (!currentQuotaUser.idServerQQ) return true;
    }
    return false;
  }, [currentQuotaUser, isQQSlot]);

  const label = useMemo(() => {
    if (isQQSlot && isDisabled) {
      return "请完成QQ绑定";
    }
    return "添加游戏托管";
  }, [isQQSlot, isDisabled]);

  const handlePress = useCallback(() => {
    if (isQQSlot && isDisabled) {
      toast.warning("请在设置中完成QQ绑定");
      return;
    }
    if (isDisabled) {
      toast.warning("请先登录");
      return;
    }
    // 打开创建游戏modal，传递slotUuid
    if (slot.uuid) {
      router.push(`/create-game?slotUuid=${slot.uuid}`);
    }
  }, [isDisabled, isQQSlot, toast, router, slot.uuid]);

  return (
    <Pressable
      accessibilityLabel={`empty-slot-${slotIdentifier}`}
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => ({
        width: cardWidth,
        backgroundColor: c.card,
        borderRadius: 16,
        paddingVertical: 36,
        borderWidth: 1,
        borderColor: c.border,
        alignItems: "center",
        justifyContent: "center",
        opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Text
        style={{
          color: c.primary,
          fontSize: 36,
          fontWeight: "bold",
          marginBottom: 8,
        }}
      >
        +
      </Text>
      <Text
        style={{
          color: c.primary,
          fontSize: 18,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
