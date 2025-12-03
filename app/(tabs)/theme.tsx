import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 颜色卡片组件
function ColorCard({
  name,
  bgClass,
  textClass,
  description,
}: {
  name: string;
  bgClass: string;
  textClass: string;
  description?: string;
}) {
  return (
    <View className={`${bgClass} rounded-2xl p-4 mb-3 shadow-sm`}>
      <Text className={`${textClass} text-lg font-semibold`}>{name}</Text>
      {description && (
        <Text className={`${textClass} text-sm opacity-70 mt-1`}>
          {description}
        </Text>
      )}
    </View>
  );
}

// 按钮预览组件
function ButtonPreview() {
  return (
    <View className="flex-row flex-wrap gap-3 mb-6">
      <Pressable className="bg-primary px-5 py-3 rounded-xl active:opacity-80">
        <Text className="text-primary-foreground font-semibold">Primary</Text>
      </Pressable>
      <Pressable className="bg-secondary px-5 py-3 rounded-xl active:opacity-80">
        <Text className="text-secondary-foreground font-semibold">
          Secondary
        </Text>
      </Pressable>
      <Pressable className="bg-accent px-5 py-3 rounded-xl active:opacity-80">
        <Text className="text-accent-foreground font-semibold">Accent</Text>
      </Pressable>
      <Pressable className="bg-destructive px-5 py-3 rounded-xl active:opacity-80">
        <Text className="text-destructive-foreground font-semibold">
          Destructive
        </Text>
      </Pressable>
      <Pressable className="bg-muted px-5 py-3 rounded-xl active:opacity-80">
        <Text className="text-muted-foreground font-semibold">Muted</Text>
      </Pressable>
    </View>
  );
}

// 输入框预览
function InputPreview() {
  return (
    <View className="mb-6">
      <View className="bg-input rounded-xl px-4 py-3 border border-border mb-3">
        <Text className="text-foreground">Input field preview</Text>
      </View>
      <View className="bg-input rounded-xl px-4 py-3 border-2 border-ring">
        <Text className="text-foreground">Focused input (with ring)</Text>
      </View>
    </View>
  );
}

// 卡片组件预览
function CardPreview() {
  return (
    <View className="bg-card rounded-2xl p-5 mb-6 border border-border shadow-lg">
      <Text className="text-card-foreground text-xl font-bold mb-2">
        Card Title
      </Text>
      <Text className="text-card-foreground opacity-80 mb-4">
        This is an example card component showing how content looks with the
        card background and foreground colors.
      </Text>
      <View className="flex-row gap-2">
        <View className="bg-primary/20 px-3 py-1 rounded-full">
          <Text className="text-primary text-sm font-medium">Tag 1</Text>
        </View>
        <View className="bg-secondary/20 px-3 py-1 rounded-full">
          <Text className="text-secondary text-sm font-medium">Tag 2</Text>
        </View>
        <View className="bg-accent/20 px-3 py-1 rounded-full">
          <Text className="text-accent text-sm font-medium">Tag 3</Text>
        </View>
      </View>
    </View>
  );
}

// Popover 预览
function PopoverPreview() {
  return (
    <View className="bg-popover rounded-xl p-4 mb-6 border border-border">
      <Text className="text-popover-foreground font-semibold mb-2">
        Popover / Dropdown
      </Text>
      <View className="bg-background/50 rounded-lg p-3 mb-2">
        <Text className="text-popover-foreground">Option 1</Text>
      </View>
      <View className="bg-primary/10 rounded-lg p-3 mb-2">
        <Text className="text-popover-foreground">Option 2 (selected)</Text>
      </View>
      <View className="bg-background/50 rounded-lg p-3">
        <Text className="text-popover-foreground">Option 3</Text>
      </View>
    </View>
  );
}

// 颜色调色板展示
function ColorPalette() {
  const colors = [
    {
      name: "Background",
      bg: "bg-background",
      text: "text-foreground",
      desc: "主背景色",
    },
    {
      name: "Foreground",
      bg: "bg-foreground",
      text: "text-background",
      desc: "主前景色/文字",
    },
    {
      name: "Primary",
      bg: "bg-primary",
      text: "text-primary-foreground",
      desc: "主要操作/品牌色",
    },
    {
      name: "Secondary",
      bg: "bg-secondary",
      text: "text-secondary-foreground",
      desc: "次要操作",
    },
    {
      name: "Accent",
      bg: "bg-accent",
      text: "text-accent-foreground",
      desc: "强调/高亮",
    },
    {
      name: "Muted",
      bg: "bg-muted",
      text: "text-muted-foreground",
      desc: "禁用/次要文字",
    },
    {
      name: "Destructive",
      bg: "bg-destructive",
      text: "text-destructive-foreground",
      desc: "危险操作/错误",
    },
    { name: "Card", bg: "bg-card", text: "text-card-foreground", desc: "卡片" },
    {
      name: "Popover",
      bg: "bg-popover",
      text: "text-popover-foreground",
      desc: "弹出层",
    },
    { name: "Border", bg: "bg-border", text: "text-foreground", desc: "边框" },
    { name: "Input", bg: "bg-input", text: "text-foreground", desc: "输入框" },
    { name: "Ring", bg: "bg-ring", text: "text-foreground", desc: "焦点环" },
  ];

  return (
    <View className="mb-6">
      {colors.map((color) => (
        <ColorCard
          key={color.name}
          name={color.name}
          bgClass={color.bg}
          textClass={color.text}
          description={color.desc}
        />
      ))}
    </View>
  );
}

// 排版预览
function TypographyPreview() {
  return (
    <View className="mb-6 bg-card rounded-2xl p-5 border border-border">
      <Text className="text-foreground text-3xl font-bold mb-2">Heading 1</Text>
      <Text className="text-foreground text-2xl font-semibold mb-2">
        Heading 2
      </Text>
      <Text className="text-foreground text-xl font-medium mb-2">
        Heading 3
      </Text>
      <Text className="text-foreground text-base mb-2">
        Body text - 这是正文文本，用于展示基础的阅读体验。
      </Text>
      <Text className="text-muted-foreground text-sm mb-2">
        Muted text - 这是次要文本，用于辅助信息。
      </Text>
      <Text className="text-primary text-base font-medium">
        Primary link text
      </Text>
    </View>
  );
}

export default function ThemePreviewScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="py-6">
          <Text className="text-foreground text-3xl font-bold mb-2">
            🎨 Theme Preview
          </Text>
          <Text className="text-muted-foreground text-base">
            NativeWind v5 主题颜色预览
          </Text>
        </View>

        {/* Section: Buttons */}
        <View className="mb-2">
          <Text className="text-foreground text-xl font-semibold mb-4">
            Buttons
          </Text>
          <ButtonPreview />
        </View>

        {/* Section: Inputs */}
        <View className="mb-2">
          <Text className="text-foreground text-xl font-semibold mb-4">
            Inputs
          </Text>
          <InputPreview />
        </View>

        {/* Section: Card */}
        <View className="mb-2">
          <Text className="text-foreground text-xl font-semibold mb-4">
            Card
          </Text>
          <CardPreview />
        </View>

        {/* Section: Popover */}
        <View className="mb-2">
          <Text className="text-foreground text-xl font-semibold mb-4">
            Popover
          </Text>
          <PopoverPreview />
        </View>

        {/* Section: Typography */}
        <View className="mb-2">
          <Text className="text-foreground text-xl font-semibold mb-4">
            Typography
          </Text>
          <TypographyPreview />
        </View>

        {/* Section: Color Palette */}
        <View className="mb-2">
          <Text className="text-foreground text-xl font-semibold mb-4">
            Color Palette
          </Text>
          <ColorPalette />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
