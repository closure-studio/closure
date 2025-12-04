import { alpha, useTheme } from "@/providers/theme";
import { useCallback, useState } from "react";
import {
  LayoutChangeEvent,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AnnouncementProps {
  /** 公告内容 */
  content?: string;
  /** 最大显示高度（默认 120） */
  maxHeight?: number;
  /** 标题（默认 "系统公告"） */
  title?: string;
}

/**
 * 系统公告组件
 * - 固定高度显示
 * - 内容过长时显示"查看更多"按钮
 * - 点击后弹出完整内容
 */
export function Announcement({
  content,
  maxHeight = 120,
  title = "今日特价",
}: AnnouncementProps) {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);

  // 测量内容实际高度
  const onContentLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      // 如果内容高度超过最大高度减去标题和padding的空间，则需要展开按钮
      const availableHeight = maxHeight - 48; // 48 = 标题高度 + padding
      setNeedsExpand(height > availableHeight);
    },
    [maxHeight],
  );

  // 调试日志
  console.log("[Announcement] content:", content, "type:", typeof content);

  // 如果没有公告内容，不显示
  if (!content || (typeof content === "string" && content.trim() === "")) {
    console.log("[Announcement] Not rendering - content is empty or falsy");
    return null;
  }

  // 可用内容区域高度
  const contentAreaHeight = maxHeight - 48;

  return (
    <>
      {/* 公告卡片 */}
      <View
        style={{
          width: width - 32,
          maxHeight: maxHeight,
          backgroundColor: c.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: c.border,
          overflow: "hidden",
        }}
      >
        {/* 标题栏 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
            backgroundColor: alpha(c.primary, 0.05),
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 18 }}>📢</Text>
            <Text
              style={{
                color: c.cardFg,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {title}
            </Text>
          </View>
          {needsExpand && (
            <Pressable
              onPress={() => setIsExpanded(true)}
              style={{
                backgroundColor: alpha(c.primary, 0.1),
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: c.primary,
                  fontSize: 13,
                  fontWeight: "500",
                }}
              >
                查看全部
              </Text>
            </Pressable>
          )}
        </View>

        {/* 内容区域 */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            maxHeight: contentAreaHeight,
            overflow: "hidden",
          }}
        >
          {/* 隐藏的测量层 */}
          <View
            style={{ position: "absolute", opacity: 0 }}
            onLayout={onContentLayout}
          >
            <Text style={{ fontSize: 14, lineHeight: 22 }}>{content}</Text>
          </View>

          {/* 可见内容 */}
          <Text
            style={{
              color: c.cardFg,
              fontSize: 14,
              lineHeight: 22,
            }}
            numberOfLines={
              needsExpand ? Math.floor(contentAreaHeight / 22) : undefined
            }
          >
            {content}
          </Text>

          {/* 渐变遮罩效果（当内容被截断时） */}
          {needsExpand && (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 30,
                backgroundColor: c.card,
                opacity: 0.9,
              }}
            />
          )}
        </View>
      </View>

      {/* 全屏查看 Modal */}
      <Modal
        visible={isExpanded}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsExpanded(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: alpha(c.background, 0.95),
            paddingTop: insets.top,
          }}
        >
          {/* Modal 标题栏 */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: c.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text style={{ fontSize: 20 }}>📢</Text>
              <Text
                style={{
                  color: c.foreground,
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                {title}
              </Text>
            </View>
            <Pressable
              onPress={() => setIsExpanded(false)}
              style={{
                backgroundColor: c.muted,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: c.mutedFg,
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                关闭
              </Text>
            </Pressable>
          </View>

          {/* Modal 内容 */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: 20,
              paddingBottom: insets.bottom + 20,
            }}
            showsVerticalScrollIndicator={true}
          >
            <Text
              style={{
                color: c.foreground,
                fontSize: 16,
                lineHeight: 26,
              }}
            >
              {content}
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

/**
 * 紧凑型公告横幅（单行滚动）
 */
export function AnnouncementBanner({ content }: { content?: string }) {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const [isExpanded, setIsExpanded] = useState(false);
  const insets = useSafeAreaInsets();

  if (!content || content.trim() === "") {
    return null;
  }

  return (
    <>
      <Pressable
        onPress={() => setIsExpanded(true)}
        style={{
          width: width - 32,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: alpha(c.primary, 0.1),
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 10,
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 16 }}>📢</Text>
        <Text
          style={{
            flex: 1,
            color: c.primary,
            fontSize: 14,
            fontWeight: "500",
          }}
          numberOfLines={1}
        >
          {content}
        </Text>
        <Text style={{ color: c.mutedFg, fontSize: 12 }}>详情 →</Text>
      </Pressable>

      {/* 全屏查看 Modal */}
      <Modal
        visible={isExpanded}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsExpanded(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: alpha(c.background, 0.95),
            paddingTop: insets.top,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: c.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text style={{ fontSize: 20 }}>📢</Text>
              <Text
                style={{
                  color: c.foreground,
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                系统公告
              </Text>
            </View>
            <Pressable
              onPress={() => setIsExpanded(false)}
              style={{
                backgroundColor: c.muted,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: c.mutedFg,
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                关闭
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: 20,
              paddingBottom: insets.bottom + 20,
            }}
          >
            <Text
              style={{
                color: c.foreground,
                fontSize: 16,
                lineHeight: 26,
              }}
            >
              {content}
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
