/**
 * NativeWind v5 主题定义
 * 使用 CSS 变量方式，支持主题切换
 * 所有颜色值使用 RGB 空格分隔格式 (e.g., "249 215 47")
 */

export type NativeWindThemeColors = {
  // Primary colors
  'primary': string;
  'primary-focus': string;
  'primary-content': string;
  
  // Secondary colors
  'secondary': string;
  'secondary-focus': string;
  'secondary-content': string;
  
  // Accent colors
  'accent': string;
  'accent-focus': string;
  'accent-content': string;
  
  // Neutral colors
  'neutral': string;
  'neutral-focus': string;
  'neutral-content': string;
  
  // Base colors
  'base-100': string;
  'base-200': string;
  'base-300': string;
  'base-content': string;
  
  // Semantic colors
  'info': string;
  'success': string;
  'warning': string;
  'error': string;
  
  // Additional theme properties
  '--rounded-box': string;
  '--rounded-btn': string;
  '--rounded-badge': string;
  '--animation-btn': string;
  '--animation-input': string;
  '--btn-text-case': string;
  '--navbar-padding': string;
  '--border-btn': string;
};

export type NativeWindThemeDefinition = {
  id: string;
  name: string;
  description: string;
  colors: NativeWindThemeColors;
};

/**
 * 将 hex 颜色转换为 RGB 空格分隔格式
 * @param hex hex 颜色值，如 "#f9d72f" 或 "f9d72f"
 * @returns RGB 空格分隔格式，如 "249 215 47"
 */
function hexToRgb(hex: string): string {
  // 移除 # 符号
  const cleanHex = hex.replace('#', '');
  
  // 解析 RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return `${r} ${g} ${b}`;
}

/**
 * Bumblebee 主题
 * 明亮的黄色调主题
 */
export const bumblebeeTheme: NativeWindThemeDefinition = {
  id: 'bumblebee',
  name: 'Bumblebee',
  description: '明亮的黄色调主题',
  colors: {
    'primary': hexToRgb('#f9d72f'),
    'primary-focus': hexToRgb('#e9c307'),
    'primary-content': hexToRgb('#18182f'),
    
    'secondary': hexToRgb('#dfa62a'),
    'secondary-focus': hexToRgb('#be8b1e'),
    'secondary-content': hexToRgb('#ffffff'),
    
    'accent': hexToRgb('#18182f'),
    'accent-focus': hexToRgb('#111122'),
    'accent-content': hexToRgb('#ffffff'),
    
    'neutral': hexToRgb('#18182f'),
    'neutral-focus': hexToRgb('#111122'),
    'neutral-content': hexToRgb('#ffffff'),
    
    'base-100': hexToRgb('#ffffff'),
    'base-200': hexToRgb('#f5f5f5'),
    'base-300': hexToRgb('#e3e3e3'),
    'base-content': hexToRgb('#000000'),
    
    'info': hexToRgb('#1c92f2'),
    'success': hexToRgb('#009485'),
    'warning': hexToRgb('#ff9900'),
    'error': hexToRgb('#ff5724'),
    
    '--rounded-box': '1rem',
    '--rounded-btn': '.5rem',
    '--rounded-badge': '1.9rem',
    '--animation-btn': '.25s',
    '--animation-input': '.2s',
    '--btn-text-case': 'uppercase',
    '--navbar-padding': '.5rem',
    '--border-btn': '1px',
  },
};

/**
 * 所有可用的 NativeWind 主题
 */
export const nativeWindThemes: NativeWindThemeDefinition[] = [
  bumblebeeTheme,
];

/**
 * 通过 ID 获取主题
 */
export function getNativeWindThemeById(id: string): NativeWindThemeDefinition | undefined {
  return nativeWindThemes.find((theme) => theme.id === id);
}

/**
 * 默认主题 ID
 */
export const DEFAULT_NATIVEWIND_THEME_ID = 'bumblebee';

