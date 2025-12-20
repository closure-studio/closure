import { bumblebeeTheme } from "@/constants/nativewind-themes";
import { VariableContextProvider, useColorScheme } from "nativewind";

/**
 * 将 RGB 空格分隔格式转换为 hex 颜色
 * @param rgb RGB 空格分隔格式，如 "249 215 47"
 * @returns hex 颜色值，如 "#f9d72f"
 */
function rgbToHex(rgb: string): string {
  const [r, g, b] = rgb.split(" ").map(Number);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * 将主题颜色转换为 CSS 变量格式
 * 返回的格式应该是 hex 颜色值，如 "#f9d72f"
 */
function themeToVars(theme: typeof bumblebeeTheme) {
  const colors = theme.colors;
  return {
    "--color-primary": rgbToHex(colors["primary"]),
    "--color-primary-focus": rgbToHex(colors["primary-focus"]),
    "--color-primary-content": rgbToHex(colors["primary-content"]),
    "--color-secondary": rgbToHex(colors["secondary"]),
    "--color-secondary-focus": rgbToHex(colors["secondary-focus"]),
    "--color-secondary-content": rgbToHex(colors["secondary-content"]),
    "--color-accent": rgbToHex(colors["accent"]),
    "--color-accent-focus": rgbToHex(colors["accent-focus"]),
    "--color-accent-content": rgbToHex(colors["accent-content"]),
    "--color-neutral": rgbToHex(colors["neutral"]),
    "--color-neutral-focus": rgbToHex(colors["neutral-focus"]),
    "--color-neutral-content": rgbToHex(colors["neutral-content"]),
    "--color-base-100": rgbToHex(colors["base-100"]),
    "--color-base-200": rgbToHex(colors["base-200"]),
    "--color-base-300": rgbToHex(colors["base-300"]),
    "--color-base-content": rgbToHex(colors["base-content"]),
    "--color-info": rgbToHex(colors["info"]),
    "--color-success": rgbToHex(colors["success"]),
    "--color-warning": rgbToHex(colors["warning"]),
    "--color-error": rgbToHex(colors["error"]),
    "--rounded-box": colors["--rounded-box"],
    "--rounded-btn": colors["--rounded-btn"],
    "--rounded-badge": colors["--rounded-badge"],
    "--animation-btn": colors["--animation-btn"],
    "--animation-input": colors["--animation-input"],
  };
}

/**
 * 主题定义
 */
const themes = {
  bumblebee: {
    light: themeToVars(bumblebeeTheme),
    dark: themeToVars(bumblebeeTheme),
  },
};

/**
 * NativeWind 主题组件
 */
export function NativeWindTheme({
  name = "bumblebee",
  children,
}: {
  name?: keyof typeof themes;
  children: React.ReactNode;
}) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === "dark" ? "dark" : "light";
  const themeVars = themes[name]?.[scheme] || themes.bumblebee.light;

  return (
    <VariableContextProvider value={themeVars}>
      {children}
    </VariableContextProvider>
  );
}

