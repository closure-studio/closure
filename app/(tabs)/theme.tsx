import { alpha, rgbToColor, useTheme } from "@/providers/theme";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

// ============================================
// 主题选择器
// ============================================
function ThemeSwitcher() {
  const { availableThemes, themeId, setTheme, c, colorMode } = useTheme();

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {availableThemes.map((theme) => {
          const isActive = theme.id === themeId;
          const previewColors = colorMode === "dark" ? theme.dark : theme.light;

          return (
            <Pressable
              key={theme.id}
              onPress={() => setTheme(theme.id)}
              style={{
                flex: 1,
                minWidth: 140,
                borderRadius: 16,
                padding: 16,
                borderWidth: 2,
                borderColor: isActive ? c.primary : c.border,
                backgroundColor: isActive ? alpha(c.primary, 0.1) : c.card,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: rgbToColor(previewColors.primary),
                  }}
                />
                {isActive && (
                  <View
                    style={{
                      marginLeft: 8,
                      backgroundColor: c.primary,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 9999,
                    }}
                  >
                    <Text
                      style={{
                        color: c.primaryFg,
                        fontSize: 12,
                        fontWeight: "500",
                      }}
                    >
                      当前
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 16,
                  color: isActive ? c.primary : c.cardFg,
                }}
              >
                {theme.name}
              </Text>
              <Text style={{ color: c.mutedFg, fontSize: 12, marginTop: 4 }}>
                {theme.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ============================================
// 按钮组件
// ============================================
function ButtonPreview() {
  const { c } = useTheme();

  return (
    <View style={{ marginBottom: 24 }}>
      {/* 实心按钮 */}
      <Text style={{ color: c.mutedFg, fontSize: 14, marginBottom: 12 }}>
        实心按钮
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Pressable
          style={{
            backgroundColor: c.primary,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: c.primaryFg, fontWeight: "600" }}>Primary</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: c.secondary,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: c.secondaryFg, fontWeight: "600" }}>
            Secondary
          </Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: c.accent,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: c.accentFg, fontWeight: "600" }}>Accent</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: c.destructive,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: c.destructiveFg, fontWeight: "600" }}>
            Destructive
          </Text>
        </Pressable>
      </View>

      {/* 边框按钮 */}
      <Text style={{ color: c.mutedFg, fontSize: 14, marginBottom: 12 }}>
        边框按钮
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Pressable
          style={{
            borderWidth: 2,
            borderColor: c.primary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: c.primary, fontWeight: "600" }}>Primary</Text>
        </Pressable>
        <Pressable
          style={{
            borderWidth: 2,
            borderColor: c.secondary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: c.secondary, fontWeight: "600" }}>
            Secondary
          </Text>
        </Pressable>
        <Pressable
          style={{
            borderWidth: 2,
            borderColor: c.destructive,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: c.destructive, fontWeight: "600" }}>
            Destructive
          </Text>
        </Pressable>
      </View>

      {/* 幽灵按钮 */}
      <Text style={{ color: c.mutedFg, fontSize: 14, marginBottom: 12 }}>
        幽灵按钮
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <Pressable
          style={{
            backgroundColor: alpha(c.primary, 0.15),
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: c.primary, fontWeight: "600" }}>Primary</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: alpha(c.secondary, 0.15),
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: c.secondary, fontWeight: "600" }}>
            Secondary
          </Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: alpha(c.destructive, 0.15),
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: c.destructive, fontWeight: "600" }}>
            Destructive
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ============================================
// 头像组件
// ============================================
function AvatarPreview() {
  const { c } = useTheme();

  const sizes = [
    { size: 32, label: "SM" },
    { size: 40, label: "MD" },
    { size: 48, label: "LG" },
    { size: 64, label: "XL" },
  ];

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        {sizes.map((item, index) => (
          <View key={index} style={{ alignItems: "center" }}>
            <View
              style={{
                width: item.size,
                height: item.size,
                borderRadius: item.size / 2,
                backgroundColor: c.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: c.primaryFg,
                  fontSize: item.size * 0.4,
                  fontWeight: "600",
                }}
              >
                {item.label}
              </Text>
            </View>
            <Text style={{ color: c.mutedFg, fontSize: 12, marginTop: 4 }}>
              {item.size}px
            </Text>
          </View>
        ))}

        {/* 带状态的头像 */}
        <View style={{ alignItems: "center" }}>
          <View style={{ position: "relative" }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: c.secondary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: c.secondaryFg,
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                A
              </Text>
            </View>
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: "#22c55e",
                borderWidth: 2,
                borderColor: c.card,
              }}
            />
          </View>
          <Text style={{ color: c.mutedFg, fontSize: 12, marginTop: 4 }}>
            在线
          </Text>
        </View>
      </View>
    </View>
  );
}

// ============================================
// 徽章/标记组件
// ============================================
function BadgePreview() {
  const { c } = useTheme();

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {/* 实心徽章 */}
        <View
          style={{
            backgroundColor: c.primary,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
          }}
        >
          <Text style={{ color: c.primaryFg, fontSize: 12, fontWeight: "600" }}>
            默认
          </Text>
        </View>
        <View
          style={{
            backgroundColor: c.secondary,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
          }}
        >
          <Text
            style={{ color: c.secondaryFg, fontSize: 12, fontWeight: "600" }}
          >
            次要
          </Text>
        </View>
        <View
          style={{
            backgroundColor: c.accent,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
          }}
        >
          <Text style={{ color: c.accentFg, fontSize: 12, fontWeight: "600" }}>
            强调
          </Text>
        </View>
        <View
          style={{
            backgroundColor: c.destructive,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
          }}
        >
          <Text
            style={{ color: c.destructiveFg, fontSize: 12, fontWeight: "600" }}
          >
            危险
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "#22c55e",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
            成功
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "#f59e0b",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
            警告
          </Text>
        </View>

        {/* 边框徽章 */}
        <View
          style={{
            borderWidth: 1,
            borderColor: c.primary,
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderRadius: 9999,
          }}
        >
          <Text style={{ color: c.primary, fontSize: 12, fontWeight: "600" }}>
            边框
          </Text>
        </View>
        <View
          style={{
            backgroundColor: c.muted,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
          }}
        >
          <Text style={{ color: c.mutedFg, fontSize: 12, fontWeight: "600" }}>
            禁用
          </Text>
        </View>
      </View>
    </View>
  );
}

// ============================================
// 提示框组件
// ============================================
function AlertPreview() {
  const { c } = useTheme();

  const alerts = [
    {
      type: "info",
      icon: "ℹ️",
      title: "信息提示",
      message: "这是一条普通的信息提示。",
      bg: alpha(c.primary, 0.1),
      border: c.primary,
      textColor: c.primary,
    },
    {
      type: "success",
      icon: "✅",
      title: "操作成功",
      message: "您的更改已保存成功。",
      bg: "rgba(34, 197, 94, 0.1)",
      border: "#22c55e",
      textColor: "#22c55e",
    },
    {
      type: "warning",
      icon: "⚠️",
      title: "警告",
      message: "请注意检查您的输入内容。",
      bg: "rgba(245, 158, 11, 0.1)",
      border: "#f59e0b",
      textColor: "#f59e0b",
    },
    {
      type: "error",
      icon: "❌",
      title: "错误",
      message: "操作失败，请稍后重试。",
      bg: alpha(c.destructive, 0.1),
      border: c.destructive,
      textColor: c.destructive,
    },
  ];

  return (
    <View style={{ marginBottom: 24, gap: 12 }}>
      {alerts.map((alert) => (
        <View
          key={alert.type}
          style={{
            backgroundColor: alert.bg,
            borderLeftWidth: 4,
            borderLeftColor: alert.border,
            borderRadius: 8,
            padding: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 8 }}>{alert.icon}</Text>
            <Text
              style={{
                color: alert.textColor,
                fontWeight: "600",
                fontSize: 15,
              }}
            >
              {alert.title}
            </Text>
          </View>
          <Text style={{ color: c.foreground, fontSize: 14, marginLeft: 28 }}>
            {alert.message}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ============================================
// 开关组件
// ============================================
function SwitchPreview() {
  const { c } = useTheme();
  const [switches, setSwitches] = useState([true, false, true]);

  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          backgroundColor: c.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: c.border,
          overflow: "hidden",
        }}
      >
        {["推送通知", "深色模式", "自动更新"].map((label, index) => (
          <View
            key={label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              borderBottomWidth: index < 2 ? 1 : 0,
              borderBottomColor: c.border,
            }}
          >
            <Text style={{ color: c.cardFg, fontSize: 16 }}>{label}</Text>
            <Switch
              value={switches[index]}
              onValueChange={(value) => {
                const newSwitches = [...switches];
                newSwitches[index] = value;
                setSwitches(newSwitches);
              }}
              trackColor={{ false: c.muted, true: alpha(c.primary, 0.5) }}
              thumbColor={switches[index] ? c.primary : c.mutedFg}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

// ============================================
// 进度条组件
// ============================================
function ProgressPreview() {
  const { c } = useTheme();

  const progressItems = [
    { label: "下载进度", value: 75, color: c.primary },
    { label: "上传进度", value: 45, color: c.secondary },
    { label: "存储空间", value: 90, color: c.destructive },
    { label: "任务完成", value: 100, color: "#22c55e" },
  ];

  return (
    <View style={{ marginBottom: 24, gap: 16 }}>
      {progressItems.map((item) => (
        <View key={item.label}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={{ color: c.foreground, fontSize: 14 }}>
              {item.label}
            </Text>
            <Text style={{ color: c.mutedFg, fontSize: 14 }}>
              {item.value}%
            </Text>
          </View>
          <View
            style={{
              height: 8,
              backgroundColor: c.muted,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${item.value}%`,
                backgroundColor: item.color,
                borderRadius: 4,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

// ============================================
// 列表项组件
// ============================================
function ListPreview() {
  const { c } = useTheme();

  const listItems = [
    { icon: "👤", title: "个人资料", subtitle: "管理您的账户信息" },
    { icon: "🔔", title: "通知设置", subtitle: "配置推送和提醒" },
    { icon: "🔒", title: "隐私安全", subtitle: "密码和安全选项" },
    { icon: "💾", title: "存储空间", subtitle: "已使用 2.4 GB / 5 GB" },
    { icon: "❓", title: "帮助中心", subtitle: "常见问题和支持" },
  ];

  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          backgroundColor: c.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: c.border,
          overflow: "hidden",
        }}
      >
        {listItems.map((item, index) => (
          <Pressable
            key={item.title}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: index < listItems.length - 1 ? 1 : 0,
              borderBottomColor: c.border,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: alpha(c.primary, 0.1),
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: c.cardFg, fontSize: 16, fontWeight: "500" }}
              >
                {item.title}
              </Text>
              <Text style={{ color: c.mutedFg, fontSize: 13, marginTop: 2 }}>
                {item.subtitle}
              </Text>
            </View>
            <Text style={{ color: c.mutedFg, fontSize: 18 }}>→</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ============================================
// 骨架屏组件
// ============================================
function SkeletonPreview() {
  const { c } = useTheme();

  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          backgroundColor: c.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: c.border,
        }}
      >
        {/* 头像 + 文本骨架 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: c.muted,
            }}
          />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <View
              style={{
                height: 16,
                width: "60%",
                backgroundColor: c.muted,
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            <View
              style={{
                height: 12,
                width: "40%",
                backgroundColor: c.muted,
                borderRadius: 4,
              }}
            />
          </View>
        </View>

        {/* 内容骨架 */}
        <View
          style={{
            height: 14,
            backgroundColor: c.muted,
            borderRadius: 4,
            marginBottom: 8,
          }}
        />
        <View
          style={{
            height: 14,
            width: "90%",
            backgroundColor: c.muted,
            borderRadius: 4,
            marginBottom: 8,
          }}
        />
        <View
          style={{
            height: 14,
            width: "75%",
            backgroundColor: c.muted,
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );
}

// ============================================
// 数据卡片组件
// ============================================
function StatsPreview() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 32 - 12) / 2;

  const stats = [
    {
      label: "总用户",
      value: "12,345",
      change: "+12%",
      positive: true,
      icon: "👥",
    },
    {
      label: "活跃度",
      value: "89.2%",
      change: "+5.3%",
      positive: true,
      icon: "📈",
    },
    {
      label: "待处理",
      value: "23",
      change: "-8%",
      positive: false,
      icon: "📋",
    },
    {
      label: "完成率",
      value: "94%",
      change: "+2%",
      positive: true,
      icon: "✅",
    },
  ];

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {stats.map((stat) => (
          <View
            key={stat.label}
            style={{
              width: cardWidth,
              backgroundColor: c.card,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: c.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 24 }}>{stat.icon}</Text>
              <View
                style={{
                  backgroundColor: stat.positive
                    ? "rgba(34, 197, 94, 0.1)"
                    : alpha(c.destructive, 0.1),
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: stat.positive ? "#22c55e" : c.destructive,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {stat.change}
                </Text>
              </View>
            </View>
            <Text style={{ color: c.cardFg, fontSize: 24, fontWeight: "bold" }}>
              {stat.value}
            </Text>
            <Text style={{ color: c.mutedFg, fontSize: 13, marginTop: 4 }}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ============================================
// 分割线组件
// ============================================
function DividerPreview() {
  const { c } = useTheme();

  return (
    <View style={{ marginBottom: 24 }}>
      {/* 普通分割线 */}
      <View
        style={{ height: 1, backgroundColor: c.border, marginBottom: 16 }}
      />

      {/* 带文字的分割线 */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
        <Text style={{ color: c.mutedFg, paddingHorizontal: 16, fontSize: 14 }}>
          或者
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
      </View>

      {/* 粗分割线 */}
      <View style={{ height: 4, backgroundColor: c.muted, borderRadius: 2 }} />
    </View>
  );
}

// ============================================
// 输入框组件
// ============================================
function InputPreview() {
  const { c } = useTheme();

  return (
    <View style={{ marginBottom: 24, gap: 12 }}>
      {/* 普通输入框 */}
      <View>
        <Text style={{ color: c.foreground, fontSize: 14, marginBottom: 6 }}>
          用户名
        </Text>
        <View
          style={{
            backgroundColor: c.input,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: c.border,
          }}
        >
          <Text style={{ color: c.mutedFg }}>请输入用户名</Text>
        </View>
      </View>

      {/* 聚焦状态 */}
      <View>
        <Text style={{ color: c.foreground, fontSize: 14, marginBottom: 6 }}>
          邮箱地址
        </Text>
        <View
          style={{
            backgroundColor: c.input,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 2,
            borderColor: c.primary,
          }}
        >
          <Text style={{ color: c.foreground }}>user@example.com</Text>
        </View>
      </View>

      {/* 错误状态 */}
      <View>
        <Text style={{ color: c.foreground, fontSize: 14, marginBottom: 6 }}>
          密码
        </Text>
        <View
          style={{
            backgroundColor: c.input,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 2,
            borderColor: c.destructive,
          }}
        >
          <Text style={{ color: c.foreground }}>••••••</Text>
        </View>
        <Text style={{ color: c.destructive, fontSize: 12, marginTop: 4 }}>
          密码长度至少8位
        </Text>
      </View>

      {/* 禁用状态 */}
      <View>
        <Text style={{ color: c.mutedFg, fontSize: 14, marginBottom: 6 }}>
          禁用输入
        </Text>
        <View
          style={{
            backgroundColor: c.muted,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: c.border,
            opacity: 0.6,
          }}
        >
          <Text style={{ color: c.mutedFg }}>不可编辑</Text>
        </View>
      </View>
    </View>
  );
}

// ============================================
// 卡片组件
// ============================================
function CardPreview() {
  const { c } = useTheme();

  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
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
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          卡片标题
        </Text>
        <Text style={{ color: alpha(c.cardFg, 0.8), marginBottom: 16 }}>
          这是一个卡片组件示例，展示卡片背景色和前景色的搭配效果。
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View
            style={{
              backgroundColor: alpha(c.primary, 0.2),
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 9999,
            }}
          >
            <Text style={{ color: c.primary, fontSize: 14, fontWeight: "500" }}>
              标签 1
            </Text>
          </View>
          <View
            style={{
              backgroundColor: alpha(c.secondary, 0.2),
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 9999,
            }}
          >
            <Text
              style={{ color: c.secondary, fontSize: 14, fontWeight: "500" }}
            >
              标签 2
            </Text>
          </View>
          <View
            style={{
              backgroundColor: alpha(c.accent, 0.2),
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 9999,
            }}
          >
            <Text style={{ color: c.accent, fontSize: 14, fontWeight: "500" }}>
              标签 3
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ============================================
// 弹出层预览
// ============================================
function PopoverPreview() {
  const { c } = useTheme();

  return (
    <View
      style={{
        backgroundColor: c.popover,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: c.border,
      }}
    >
      <Text style={{ color: c.popoverFg, fontWeight: "600", marginBottom: 8 }}>
        弹出菜单 / 下拉框
      </Text>
      <View
        style={{
          backgroundColor: alpha(c.background, 0.5),
          borderRadius: 8,
          padding: 12,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: c.popoverFg }}>选项 1</Text>
      </View>
      <View
        style={{
          backgroundColor: alpha(c.primary, 0.1),
          borderRadius: 8,
          padding: 12,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: c.popoverFg }}>选项 2 (选中)</Text>
      </View>
      <View
        style={{
          backgroundColor: alpha(c.background, 0.5),
          borderRadius: 8,
          padding: 12,
        }}
      >
        <Text style={{ color: c.popoverFg }}>选项 3</Text>
      </View>
    </View>
  );
}

// ============================================
// 排版预览
// ============================================
function TypographyPreview() {
  const { c } = useTheme();

  return (
    <View
      style={{
        marginBottom: 24,
        backgroundColor: c.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: c.border,
      }}
    >
      <Text
        style={{
          color: c.foreground,
          fontSize: 32,
          fontWeight: "bold",
          marginBottom: 8,
        }}
      >
        Display
      </Text>
      <Text
        style={{
          color: c.foreground,
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 8,
        }}
      >
        Heading 1
      </Text>
      <Text
        style={{
          color: c.foreground,
          fontSize: 24,
          fontWeight: "600",
          marginBottom: 8,
        }}
      >
        Heading 2
      </Text>
      <Text
        style={{
          color: c.foreground,
          fontSize: 20,
          fontWeight: "600",
          marginBottom: 8,
        }}
      >
        Heading 3
      </Text>
      <Text
        style={{
          color: c.foreground,
          fontSize: 18,
          fontWeight: "500",
          marginBottom: 8,
        }}
      >
        Heading 4
      </Text>
      <Text
        style={{
          color: c.foreground,
          fontSize: 16,
          marginBottom: 8,
          lineHeight: 24,
        }}
      >
        Body text -
        这是正文文本，用于展示基础的阅读体验。正文应该具有良好的可读性。
      </Text>
      <Text style={{ color: c.mutedFg, fontSize: 14, marginBottom: 8 }}>
        Muted text - 这是次要文本，用于辅助信息。
      </Text>
      <Text style={{ color: c.mutedFg, fontSize: 12, marginBottom: 8 }}>
        Caption - 小号说明文字
      </Text>
      <Text style={{ color: c.primary, fontSize: 16, fontWeight: "500" }}>
        Primary link text →
      </Text>
    </View>
  );
}

// ============================================
// 颜色调色板
// ============================================
function ColorPalette() {
  const { c, colors } = useTheme();

  const colorItems = [
    {
      name: "Background",
      desc: "主背景色",
      bg: c.background,
      fg: c.foreground,
      rgb: colors.background,
    },
    {
      name: "Foreground",
      desc: "主前景色",
      bg: c.foreground,
      fg: c.background,
      rgb: colors.foreground,
    },
    {
      name: "Primary",
      desc: "主要操作",
      bg: c.primary,
      fg: c.primaryFg,
      rgb: colors.primary,
    },
    {
      name: "Secondary",
      desc: "次要操作",
      bg: c.secondary,
      fg: c.secondaryFg,
      rgb: colors.secondary,
    },
    {
      name: "Accent",
      desc: "强调高亮",
      bg: c.accent,
      fg: c.accentFg,
      rgb: colors.accent,
    },
    {
      name: "Muted",
      desc: "禁用状态",
      bg: c.muted,
      fg: c.mutedFg,
      rgb: colors.muted,
    },
    {
      name: "Destructive",
      desc: "危险操作",
      bg: c.destructive,
      fg: c.destructiveFg,
      rgb: colors.destructive,
    },
    {
      name: "Card",
      desc: "卡片背景",
      bg: c.card,
      fg: c.cardFg,
      rgb: colors.card,
    },
    {
      name: "Popover",
      desc: "弹出层",
      bg: c.popover,
      fg: c.popoverFg,
      rgb: colors.popover,
    },
    {
      name: "Border",
      desc: "边框",
      bg: c.border,
      fg: c.foreground,
      rgb: colors.border,
    },
    {
      name: "Input",
      desc: "输入框",
      bg: c.input,
      fg: c.foreground,
      rgb: colors.input,
    },
    {
      name: "Ring",
      desc: "焦点环",
      bg: c.ring,
      fg: c.foreground,
      rgb: colors.ring,
    },
  ];

  return (
    <View style={{ marginBottom: 24 }}>
      {colorItems.map((item) => (
        <View
          key={item.name}
          style={{
            backgroundColor: item.bg,
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: item.fg, fontSize: 18, fontWeight: "600" }}>
            {item.name}
          </Text>
          <Text
            style={{ color: alpha(item.fg, 0.7), fontSize: 12, marginTop: 4 }}
          >
            {item.desc} · RGB: {item.rgb}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ============================================
// 主页面
// ============================================
export default function ThemePreviewScreen() {
  const { currentTheme, colorMode, c } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingVertical: 24 }}>
        <Text
          style={{
            color: c.foreground,
            fontSize: 30,
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          🎨 主题预览
        </Text>
        <Text style={{ color: c.mutedFg, fontSize: 16 }}>
          当前: {currentTheme.name} · {colorMode === "dark" ? "深色" : "浅色"}
          模式
        </Text>
      </View>

      <SectionHeader title="选择主题" />
      <ThemeSwitcher />

      <SectionHeader title="按钮" />
      <ButtonPreview />

      <SectionHeader title="头像" />
      <AvatarPreview />

      <SectionHeader title="徽章" />
      <BadgePreview />

      <SectionHeader title="提示框" />
      <AlertPreview />

      <SectionHeader title="开关" />
      <SwitchPreview />

      <SectionHeader title="进度条" />
      <ProgressPreview />

      <SectionHeader title="列表" />
      <ListPreview />

      <SectionHeader title="数据卡片" />
      <StatsPreview />

      <SectionHeader title="骨架屏" />
      <SkeletonPreview />

      <SectionHeader title="分割线" />
      <DividerPreview />

      <SectionHeader title="输入框" />
      <InputPreview />

      <SectionHeader title="卡片" />
      <CardPreview />

      <SectionHeader title="弹出层" />
      <PopoverPreview />

      <SectionHeader title="排版" />
      <TypographyPreview />

      <SectionHeader title="调色板" />
      <ColorPalette />
    </ScrollView>
  );
}

// ============================================
// 区块标题
// ============================================
function SectionHeader({ title }: { title: string }) {
  const { c } = useTheme();

  return (
    <Text
      style={{
        color: c.foreground,
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 16,
      }}
    >
      {title}
    </Text>
  );
}
