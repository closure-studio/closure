import { alpha, rgbToColor, useTheme } from "@/providers/theme";
import { Pressable, ScrollView, Text, View } from "react-native";

// 主题选择器组件
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

// 按钮预览组件
function ButtonPreview() {
  const { c } = useTheme();

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
      <Pressable
        style={{
          backgroundColor: c.muted,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: c.mutedFg, fontWeight: "600" }}>Muted</Text>
      </Pressable>
    </View>
  );
}

// 输入框预览
function InputPreview() {
  const { c } = useTheme();

  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          backgroundColor: c.input,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: c.border,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: c.foreground }}>输入框预览</Text>
      </View>
      <View
        style={{
          backgroundColor: c.input,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: 2,
          borderColor: c.ring,
        }}
      >
        <Text style={{ color: c.foreground }}>聚焦状态 (带 Ring)</Text>
      </View>
    </View>
  );
}

// 卡片预览
function CardPreview() {
  const { c } = useTheme();

  return (
    <View
      style={{
        backgroundColor: c.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
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
          <Text style={{ color: c.secondary, fontSize: 14, fontWeight: "500" }}>
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
  );
}

// Popover 预览
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

// 颜色调色板展示
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

// 排版预览
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
          fontSize: 30,
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
          fontWeight: "500",
          marginBottom: 8,
        }}
      >
        Heading 3
      </Text>
      <Text style={{ color: c.foreground, fontSize: 16, marginBottom: 8 }}>
        Body text - 这是正文文本，用于展示基础的阅读体验。
      </Text>
      <Text style={{ color: c.mutedFg, fontSize: 14, marginBottom: 8 }}>
        Muted text - 这是次要文本，用于辅助信息。
      </Text>
      <Text style={{ color: c.primary, fontSize: 16, fontWeight: "500" }}>
        Primary link text
      </Text>
    </View>
  );
}

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
          当前主题: {currentTheme.name} ·{" "}
          {colorMode === "dark" ? "深色模式" : "浅色模式"}
        </Text>
      </View>

      {/* Section: Theme Switcher */}
      <SectionHeader title="选择主题" />
      <ThemeSwitcher />

      {/* Section: Buttons */}
      <SectionHeader title="按钮" />
      <ButtonPreview />

      {/* Section: Inputs */}
      <SectionHeader title="输入框" />
      <InputPreview />

      {/* Section: Card */}
      <SectionHeader title="卡片" />
      <CardPreview />

      {/* Section: Popover */}
      <SectionHeader title="弹出层" />
      <PopoverPreview />

      {/* Section: Typography */}
      <SectionHeader title="排版" />
      <TypographyPreview />

      {/* Section: Color Palette */}
      <SectionHeader title="调色板" />
      <ColorPalette />
    </ScrollView>
  );
}

// 区块标题组件
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
