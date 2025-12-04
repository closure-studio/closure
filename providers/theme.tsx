import {
  DEFAULT_THEME_ID,
  getThemeById,
  ThemeColors,
  ThemeDefinition,
  themes,
} from "@/constants/themes";
import { createContext, useCallback, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { useData } from "./data";

/**
 * 预计算的 RGBA 颜色值（可直接用于 style）
 */
export type ComputedColors = {
  // 基础颜色
  background: string;
  foreground: string;
  card: string;
  cardFg: string;
  popover: string;
  popoverFg: string;
  primary: string;
  primaryFg: string;
  secondary: string;
  secondaryFg: string;
  muted: string;
  mutedFg: string;
  accent: string;
  accentFg: string;
  destructive: string;
  destructiveFg: string;
  border: string;
  input: string;
  ring: string;
};

type ThemeContextType = {
  /** 当前主题定义 */
  currentTheme: ThemeDefinition;
  /** 当前主题 ID */
  themeId: string;
  /** 当前颜色模式 (light/dark) */
  colorMode: "light" | "dark";
  /** 所有可用主题 */
  availableThemes: ThemeDefinition[];
  /** 切换主题 */
  setTheme: (themeId: string) => void;
  /** 原始 RGB 颜色值 */
  colors: ThemeColors;
  /** 预计算的 RGBA 颜色值（可直接用于 style） */
  c: ComputedColors;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * 将 RGB 字符串转换为 rgba 颜色
 * @param rgb RGB 字符串，如 "212 30 30"
 * @param alpha 透明度，默认 1
 */
export function rgbToColor(rgb: string, alpha: number = 1): string {
  return `rgba(${rgb.replace(/ /g, ", ")}, ${alpha})`;
}

/**
 * 将 ThemeColors 转换为预计算的颜色值
 */
function computeColors(colors: ThemeColors): ComputedColors {
  return {
    background: rgbToColor(colors.background),
    foreground: rgbToColor(colors.foreground),
    card: rgbToColor(colors.card),
    cardFg: rgbToColor(colors["card-foreground"]),
    popover: rgbToColor(colors.popover),
    popoverFg: rgbToColor(colors["popover-foreground"]),
    primary: rgbToColor(colors.primary),
    primaryFg: rgbToColor(colors["primary-foreground"]),
    secondary: rgbToColor(colors.secondary),
    secondaryFg: rgbToColor(colors["secondary-foreground"]),
    muted: rgbToColor(colors.muted),
    mutedFg: rgbToColor(colors["muted-foreground"]),
    accent: rgbToColor(colors.accent),
    accentFg: rgbToColor(colors["accent-foreground"]),
    destructive: rgbToColor(colors.destructive),
    destructiveFg: rgbToColor(colors["destructive-foreground"]),
    border: rgbToColor(colors.border),
    input: rgbToColor(colors.input),
    ring: rgbToColor(colors.ring),
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const colorMode: "light" | "dark" =
    systemColorScheme === "dark" ? "dark" : "light";

  // 从 appStates 获取主题 ID
  const { appStates, updateAppStates } = useData();
  const themeId = appStates.themeId || DEFAULT_THEME_ID;

  // 获取当前主题定义
  const currentTheme = useMemo(() => {
    return getThemeById(themeId) || getThemeById(DEFAULT_THEME_ID)!;
  }, [themeId]);

  // 当前颜色值（原始 RGB）
  const colors = useMemo(() => {
    return colorMode === "dark" ? currentTheme.dark : currentTheme.light;
  }, [currentTheme, colorMode]);

  // 预计算的颜色值（可直接用于 style）
  const c = useMemo(() => computeColors(colors), [colors]);

  // 切换主题 - 更新 appStates
  const setTheme = useCallback(
    (newThemeId: string) => {
      const theme = getThemeById(newThemeId);
      if (theme) {
        updateAppStates((draft) => {
          draft.themeId = newThemeId;
        });
      }
    },
    [updateAppStates],
  );

  const value: ThemeContextType = useMemo(
    () => ({
      currentTheme,
      themeId,
      colorMode,
      availableThemes: themes,
      setTheme,
      colors,
      c,
    }),
    [currentTheme, themeId, colorMode, setTheme, colors, c],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * 使用主题 Hook
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * 创建带透明度的颜色
 * @param color 预计算的颜色值
 * @param alpha 透明度 0-1
 */
export function alpha(color: string, a: number): string {
  // 从 rgba(r, g, b, 1) 提取 r, g, b 并设置新的 alpha
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${a})`;
  }
  return color;
}
