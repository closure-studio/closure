import {
    DEFAULT_NATIVEWIND_THEME_ID,
    getNativeWindThemeById,
    NativeWindThemeDefinition,
    nativeWindThemes,
} from "@/constants/nativewind-themes";
import { VariableContextProvider } from "nativewind";
import { createContext, useCallback, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { useData } from "./data";

type ColorScheme = "light" | "dark";

type NativeWindThemeContextType = {
  /** 当前主题定义 */
  currentTheme: NativeWindThemeDefinition;
  /** 当前主题 ID */
  themeId: string;
  /** 当前颜色模式 (light/dark) */
  colorMode: ColorScheme;
  /** 所有可用主题 */
  availableThemes: NativeWindThemeDefinition[];
  /** 切换主题 */
  setTheme: (themeId: string) => void;
};

const NativeWindThemeContext = createContext<NativeWindThemeContextType | null>(
  null,
);

/**
 * 将主题颜色转换为 CSS 变量格式（用于 VariableContextProvider）
 */
function themeToVars(theme: NativeWindThemeDefinition) {
  const colors = theme.colors;
  return {
    // Primary colors
    "--color-primary": colors["primary"],
    "--color-primary-focus": colors["primary-focus"],
    "--color-primary-content": colors["primary-content"],

    // Secondary colors
    "--color-secondary": colors["secondary"],
    "--color-secondary-focus": colors["secondary-focus"],
    "--color-secondary-content": colors["secondary-content"],

    // Accent colors
    "--color-accent": colors["accent"],
    "--color-accent-focus": colors["accent-focus"],
    "--color-accent-content": colors["accent-content"],

    // Neutral colors
    "--color-neutral": colors["neutral"],
    "--color-neutral-focus": colors["neutral-focus"],
    "--color-neutral-content": colors["neutral-content"],

    // Base colors
    "--color-base-100": colors["base-100"],
    "--color-base-200": colors["base-200"],
    "--color-base-300": colors["base-300"],
    "--color-base-content": colors["base-content"],

    // Semantic colors
    "--color-info": colors["info"],
    "--color-success": colors["success"],
    "--color-warning": colors["warning"],
    "--color-error": colors["error"],

    // Theme properties
    "--rounded-box": colors["--rounded-box"],
    "--rounded-btn": colors["--rounded-btn"],
    "--rounded-badge": colors["--rounded-badge"],
    "--animation-btn": colors["--animation-btn"],
    "--animation-input": colors["--animation-input"],
    "--btn-text-case": colors["--btn-text-case"],
    "--navbar-padding": colors["--navbar-padding"],
    "--border-btn": colors["--border-btn"],
  };
}

/**
 * NativeWind 主题提供者
 * 使用 NativeWind v5 的 VariableContextProvider 来管理主题
 */
export function NativeWindThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemColorScheme = useColorScheme();
  const colorMode: ColorScheme = systemColorScheme === "dark" ? "dark" : "light";

  // 从 appStates 获取主题 ID，如果没有则使用默认值
  const { appStates, updateAppStates } = useData();
  const themeId = appStates.nativeWindThemeId || DEFAULT_NATIVEWIND_THEME_ID;

  // 获取当前主题定义
  const currentTheme = useMemo(() => {
    return (
      getNativeWindThemeById(themeId) ||
      getNativeWindThemeById(DEFAULT_NATIVEWIND_THEME_ID)!
    );
  }, [themeId]);

  // 切换主题
  const setTheme = useCallback(
    (newThemeId: string) => {
      const theme = getNativeWindThemeById(newThemeId);
      if (theme) {
        updateAppStates((draft) => {
          draft.nativeWindThemeId = newThemeId;
        });
      }
    },
    [updateAppStates],
  );

  // 根据当前主题和颜色模式生成变量
  // 注意：由于现在 light 和 dark 使用同一种颜色，所以直接使用当前主题
  const themeVars = useMemo(() => {
    return themeToVars(currentTheme) as Record<`--${string}`, string>;
  }, [currentTheme]);

  const value: NativeWindThemeContextType = useMemo(
    () => ({
      currentTheme,
      themeId,
      colorMode,
      availableThemes: nativeWindThemes,
      setTheme,
    }),
    [currentTheme, themeId, colorMode, setTheme],
  );

  return (
    <NativeWindThemeContext.Provider value={value}>
      <VariableContextProvider value={themeVars}>
        {children}
      </VariableContextProvider>
    </NativeWindThemeContext.Provider>
  );
}

/**
 * 使用 NativeWind 主题 Hook
 */
export function useNativeWindTheme() {
  const context = useContext(NativeWindThemeContext);
  if (!context) {
    throw new Error(
      "useNativeWindTheme must be used within a NativeWindThemeProvider",
    );
  }
  return context;
}

