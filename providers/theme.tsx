import {
  DEFAULT_THEME_ID,
  getThemeById,
  ThemeColors,
  ThemeDefinition,
  themes,
} from "@/constants/themes";
import { storage } from "@/utils/mmkv/mmkv";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

// 添加存储键
const THEME_STORAGE_KEY = "app_theme_id";

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
  /** 当前颜色值 */
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const colorMode: "light" | "dark" =
    systemColorScheme === "dark" ? "dark" : "light";

  // 从存储加载主题 ID
  const [themeId, setThemeId] = useState<string>(() => {
    const savedThemeId = storage.getString(THEME_STORAGE_KEY);
    return savedThemeId || DEFAULT_THEME_ID;
  });

  // 获取当前主题定义
  const currentTheme = useMemo(() => {
    return getThemeById(themeId) || getThemeById(DEFAULT_THEME_ID)!;
  }, [themeId]);

  // 当前颜色值
  const colors = useMemo(() => {
    return colorMode === "dark" ? currentTheme.dark : currentTheme.light;
  }, [currentTheme, colorMode]);

  // 切换主题
  const setTheme = useCallback((newThemeId: string) => {
    const theme = getThemeById(newThemeId);
    if (theme) {
      setThemeId(newThemeId);
      storage.setString(THEME_STORAGE_KEY, newThemeId);
    }
  }, []);

  const value: ThemeContextType = useMemo(
    () => ({
      currentTheme,
      themeId,
      colorMode,
      availableThemes: themes,
      setTheme,
      colors,
    }),
    [currentTheme, themeId, colorMode, setTheme, colors],
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
 * 将 RGB 字符串转换为 rgba 颜色
 * @param rgb RGB 字符串，如 "212 30 30"
 * @param alpha 透明度，默认 1
 */
export function rgbToColor(rgb: string, alpha: number = 1): string {
  return `rgba(${rgb.replace(/ /g, ", ")}, ${alpha})`;
}
