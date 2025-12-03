import { rgbToColor, useTheme } from "@/providers/theme";
import { Pressable, ScrollView, Text, View } from "react-native";

// 主题选择器组件
function ThemeSwitcher() {
  const { availableThemes, themeId, setTheme, colors, colorMode } = useTheme();

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {availableThemes.map((theme) => {
          const isActive = theme.id === themeId;
          // 使用当前颜色模式的主题色预览
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
                borderColor: isActive
                  ? rgbToColor(colors.primary)
                  : rgbToColor(colors.border),
                backgroundColor: isActive
                  ? rgbToColor(colors.primary, 0.1)
                  : rgbToColor(colors.card),
              }}
            >
              {/* 颜色预览圆点 */}
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
                      backgroundColor: rgbToColor(colors.primary),
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 9999,
                    }}
                  >
                    <Text
                      style={{
                        color: rgbToColor(colors["primary-foreground"]),
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
                  color: isActive
                    ? rgbToColor(colors.primary)
                    : rgbToColor(colors["card-foreground"]),
                }}
              >
                {theme.name}
              </Text>
              <Text
                style={{
                  color: rgbToColor(colors["muted-foreground"]),
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {theme.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// 按钮预览组件
function ButtonPreview() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 24,
      }}
    >
      <Pressable
        style={{
          backgroundColor: rgbToColor(colors.primary),
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            color: rgbToColor(colors["primary-foreground"]),
            fontWeight: "600",
          }}
        >
          Primary
        </Text>
      </Pressable>
      <Pressable
        style={{
          backgroundColor: rgbToColor(colors.secondary),
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            color: rgbToColor(colors["secondary-foreground"]),
            fontWeight: "600",
          }}
        >
          Secondary
        </Text>
      </Pressable>
      <Pressable
        style={{
          backgroundColor: rgbToColor(colors.accent),
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            color: rgbToColor(colors["accent-foreground"]),
            fontWeight: "600",
          }}
        >
          Accent
        </Text>
      </Pressable>
      <Pressable
        style={{
          backgroundColor: rgbToColor(colors.destructive),
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            color: rgbToColor(colors["destructive-foreground"]),
            fontWeight: "600",
          }}
        >
          Destructive
        </Text>
      </Pressable>
      <Pressable
        style={{
          backgroundColor: rgbToColor(colors.muted),
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            color: rgbToColor(colors["muted-foreground"]),
            fontWeight: "600",
          }}
        >
          Muted
        </Text>
      </Pressable>
    </View>
  );
}

// 输入框预览
function InputPreview() {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          backgroundColor: rgbToColor(colors.input),
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: rgbToColor(colors.border),
          marginBottom: 12,
        }}
      >
        <Text style={{ color: rgbToColor(colors.foreground) }}>输入框预览</Text>
      </View>
      <View
        style={{
          backgroundColor: rgbToColor(colors.input),
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: 2,
          borderColor: rgbToColor(colors.ring),
        }}
      >
        <Text style={{ color: rgbToColor(colors.foreground) }}>
          聚焦状态 (带 Ring)
        </Text>
      </View>
    </View>
  );
}

// 卡片预览
function CardPreview() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: rgbToColor(colors.card),
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: rgbToColor(colors.border),
      }}
    >
      <Text
        style={{
          color: rgbToColor(colors["card-foreground"]),
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 8,
        }}
      >
        卡片标题
      </Text>
      <Text
        style={{
          color: rgbToColor(colors["card-foreground"], 0.8),
          marginBottom: 16,
        }}
      >
        这是一个卡片组件示例，展示卡片背景色和前景色的搭配效果。
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View
          style={{
            backgroundColor: rgbToColor(colors.primary, 0.2),
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 9999,
          }}
        >
          <Text
            style={{
              color: rgbToColor(colors.primary),
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            标签 1
          </Text>
        </View>
        <View
          style={{
            backgroundColor: rgbToColor(colors.secondary, 0.2),
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 9999,
          }}
        >
          <Text
            style={{
              color: rgbToColor(colors.secondary),
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            标签 2
          </Text>
        </View>
        <View
          style={{
            backgroundColor: rgbToColor(colors.accent, 0.2),
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 9999,
          }}
        >
          <Text
            style={{
              color: rgbToColor(colors.accent),
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            标签 3
          </Text>
        </View>
      </View>
    </View>
  );
}

// Popover 预览
function PopoverPreview() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: rgbToColor(colors.popover),
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: rgbToColor(colors.border),
      }}
    >
      <Text
        style={{
          color: rgbToColor(colors["popover-foreground"]),
          fontWeight: "600",
          marginBottom: 8,
        }}
      >
        弹出菜单 / 下拉框
      </Text>
      <View
        style={{
          backgroundColor: rgbToColor(colors.background, 0.5),
          borderRadius: 8,
          padding: 12,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: rgbToColor(colors["popover-foreground"]) }}>
          选项 1
        </Text>
      </View>
      <View
        style={{
          backgroundColor: rgbToColor(colors.primary, 0.1),
          borderRadius: 8,
          padding: 12,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: rgbToColor(colors["popover-foreground"]) }}>
          选项 2 (选中)
        </Text>
      </View>
      <View
        style={{
          backgroundColor: rgbToColor(colors.background, 0.5),
          borderRadius: 8,
          padding: 12,
        }}
      >
        <Text style={{ color: rgbToColor(colors["popover-foreground"]) }}>
          选项 3
        </Text>
      </View>
    </View>
  );
}

// 颜色调色板展示
function ColorPalette() {
  const { colors } = useTheme();

  const colorItems = [
    {
      name: "Background",
      desc: "主背景色",
      color: colors.background,
      textColor: colors.foreground,
    },
    {
      name: "Foreground",
      desc: "主前景色/文字",
      color: colors.foreground,
      textColor: colors.background,
    },
    {
      name: "Primary",
      desc: "主要操作/品牌色",
      color: colors.primary,
      textColor: colors["primary-foreground"],
    },
    {
      name: "Secondary",
      desc: "次要操作",
      color: colors.secondary,
      textColor: colors["secondary-foreground"],
    },
    {
      name: "Accent",
      desc: "强调/高亮",
      color: colors.accent,
      textColor: colors["accent-foreground"],
    },
    {
      name: "Muted",
      desc: "禁用/次要文字",
      color: colors.muted,
      textColor: colors["muted-foreground"],
    },
    {
      name: "Destructive",
      desc: "危险操作/错误",
      color: colors.destructive,
      textColor: colors["destructive-foreground"],
    },
    {
      name: "Card",
      desc: "卡片",
      color: colors.card,
      textColor: colors["card-foreground"],
    },
    {
      name: "Popover",
      desc: "弹出层",
      color: colors.popover,
      textColor: colors["popover-foreground"],
    },
    {
      name: "Border",
      desc: "边框",
      color: colors.border,
      textColor: colors.foreground,
    },
    {
      name: "Input",
      desc: "输入框",
      color: colors.input,
      textColor: colors.foreground,
    },
    {
      name: "Ring",
      desc: "焦点环",
      color: colors.ring,
      textColor: colors.foreground,
    },
  ];

  return (
    <View style={{ marginBottom: 24 }}>
      {colorItems.map((item) => (
        <View
          key={item.name}
          style={{
            backgroundColor: rgbToColor(item.color),
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              color: rgbToColor(item.textColor),
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              color: rgbToColor(item.textColor, 0.7),
              fontSize: 12,
              marginTop: 4,
            }}
          >
            {item.desc} · RGB: {item.color}
          </Text>
        </View>
      ))}
    </View>
  );
}

// 排版预览
function TypographyPreview() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        marginBottom: 24,
        backgroundColor: rgbToColor(colors.card),
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: rgbToColor(colors.border),
      }}
    >
      <Text
        style={{
          color: rgbToColor(colors.foreground),
          fontSize: 30,
          fontWeight: "bold",
          marginBottom: 8,
        }}
      >
        Heading 1
      </Text>
      <Text
        style={{
          color: rgbToColor(colors.foreground),
          fontSize: 24,
          fontWeight: "600",
          marginBottom: 8,
        }}
      >
        Heading 2
      </Text>
      <Text
        style={{
          color: rgbToColor(colors.foreground),
          fontSize: 20,
          fontWeight: "500",
          marginBottom: 8,
        }}
      >
        Heading 3
      </Text>
      <Text
        style={{
          color: rgbToColor(colors.foreground),
          fontSize: 16,
          marginBottom: 8,
        }}
      >
        Body text - 这是正文文本，用于展示基础的阅读体验。
      </Text>
      <Text
        style={{
          color: rgbToColor(colors["muted-foreground"]),
          fontSize: 14,
          marginBottom: 8,
        }}
      >
        Muted text - 这是次要文本，用于辅助信息。
      </Text>
      <Text
        style={{
          color: rgbToColor(colors.primary),
          fontSize: 16,
          fontWeight: "500",
        }}
      >
        Primary link text
      </Text>
    </View>
  );
}

export default function ThemePreviewScreen() {
  const { currentTheme, colorMode, colors } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: rgbToColor(colors.background) }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingVertical: 24 }}>
        <Text
          style={{
            color: rgbToColor(colors.foreground),
            fontSize: 30,
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          🎨 主题预览
        </Text>
        <Text
          style={{
            color: rgbToColor(colors["muted-foreground"]),
            fontSize: 16,
          }}
        >
          当前主题: {currentTheme.name} ·{" "}
          {colorMode === "dark" ? "深色模式" : "浅色模式"}
        </Text>
      </View>

      {/* Section: Theme Switcher */}
      <SectionHeader title="选择主题" colors={colors} />
      <ThemeSwitcher />

      {/* Section: Buttons */}
      <SectionHeader title="按钮" colors={colors} />
      <ButtonPreview />

      {/* Section: Inputs */}
      <SectionHeader title="输入框" colors={colors} />
      <InputPreview />

      {/* Section: Card */}
      <SectionHeader title="卡片" colors={colors} />
      <CardPreview />

      {/* Section: Popover */}
      <SectionHeader title="弹出层" colors={colors} />
      <PopoverPreview />

      {/* Section: Typography */}
      <SectionHeader title="排版" colors={colors} />
      <TypographyPreview />

      {/* Section: Color Palette */}
      <SectionHeader title="调色板" colors={colors} />
      <ColorPalette />
    </ScrollView>
  );
}

// 区块标题组件
function SectionHeader({
  title,
  colors,
}: {
  title: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <Text
      style={{
        color: rgbToColor(colors.foreground),
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 16,
      }}
    >
      {title}
    </Text>
  );
}
