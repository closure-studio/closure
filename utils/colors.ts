import { useColorScheme } from "react-native";

/**
 * 简单的颜色工具函数，基于系统主题返回颜色
 */
export function useColors() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    background: isDark ? "#000000" : "#FFFFFF",
    foreground: isDark ? "#FFFFFF" : "#000000",
    card: isDark ? "#1C1C1E" : "#FFFFFF",
    cardFg: isDark ? "#FFFFFF" : "#000000",
    border: isDark ? "#38383A" : "#E5E5EA",
    primary: "#007AFF",
    primaryFg: "#FFFFFF",
    secondary: "#5856D6",
    muted: isDark ? "#2C2C2E" : "#F2F2F7",
    mutedFg: isDark ? "#98989D" : "#8E8E93",
    accent: "#FF9500",
    destructive: "#FF3B30",
  };
}

/**
 * 将颜色转换为带透明度的 rgba 格式
 */
export function alpha(color: string, opacity: number): string {
  // 如果是 #RRGGBB 格式，转换为 rgba
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // 如果已经是 rgba/rgb 格式，直接返回（简化处理）
  return color;
}

