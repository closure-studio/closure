/**
 * 主题颜色定义
 * 每个主题包含 light 和 dark 两种模式
 * 颜色值使用 RGB 空格分隔格式 (e.g., "212 30 30")
 */

export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  "destructive-foreground": string;
  border: string;
  input: string;
  ring: string;
};

export type ThemeDefinition = {
  id: string;
  name: string;
  description: string;
  light: ThemeColors;
  dark: ThemeColors;
};

/**
 * 红色主题 (Rhodes Island)
 */
export const redTheme: ThemeDefinition = {
  id: "red",
  name: "红色主题",
  description: "罗德岛红色系",
  light: {
    background: "248 245 245",
    foreground: "6 4 4",
    card: "255 255 255",
    "card-foreground": "15 2 2",
    popover: "250 238 238",
    "popover-foreground": "15 2 2",
    primary: "212 30 30",
    "primary-foreground": "253 242 242",
    secondary: "203 127 76",
    "secondary-foreground": "79 45 23",
    muted: "219 210 210",
    "muted-foreground": "85 68 68",
    accent: "205 191 101",
    "accent-foreground": "77 70 25",
    destructive: "255 56 43",
    "destructive-foreground": "255 255 255",
    border: "241 233 233",
    input: "223 205 205",
    ring: "241 233 233",
  },
  dark: {
    background: "5 1 1",
    foreground: "254 247 247",
    card: "38 21 21",
    "card-foreground": "254 247 247",
    popover: "46 39 39",
    "popover-foreground": "254 247 247",
    primary: "227 57 57",
    "primary-foreground": "255 255 255",
    secondary: "200 126 76",
    "secondary-foreground": "78 46 24",
    muted: "219 210 210",
    "muted-foreground": "85 68 68",
    accent: "203 189 101",
    "accent-foreground": "76 69 26",
    destructive: "254 67 54",
    "destructive-foreground": "255 255 255",
    border: "68 57 57",
    input: "82 69 69",
    ring: "68 57 57",
  },
};

/**
 * 蓝色主题
 */
export const blueTheme: ThemeDefinition = {
  id: "blue",
  name: "蓝色主题",
  description: "经典蓝色系",
  light: {
    background: "245 247 249",
    foreground: "3 4 5",
    card: "255 255 255",
    "card-foreground": "0 7 14",
    popover: "237 244 252",
    "popover-foreground": "0 7 14",
    primary: "0 123 255",
    "primary-foreground": "240 247 255",
    secondary: "45 185 227",
    "secondary-foreground": "12 72 90",
    muted: "210 216 222",
    "muted-foreground": "65 76 88",
    accent: "255 40 84",
    "accent-foreground": "255 153 174",
    destructive: "255 56 43",
    "destructive-foreground": "255 255 255",
    border: "232 237 243",
    input: "202 214 227",
    ring: "232 237 243",
  },
  dark: {
    background: "0 2 4",
    foreground: "247 251 255",
    card: "18 30 42",
    "card-foreground": "247 251 255",
    popover: "38 43 48",
    "popover-foreground": "247 251 255",
    primary: "0 123 255",
    "primary-foreground": "255 255 255",
    secondary: "45 184 226",
    "secondary-foreground": "13 72 89",
    muted: "210 216 222",
    "muted-foreground": "65 76 88",
    accent: "255 40 84",
    "accent-foreground": "255 153 174",
    destructive: "254 67 54",
    "destructive-foreground": "255 255 255",
    border: "56 63 71",
    input: "67 76 85",
    ring: "56 63 71",
  },
};

// ============================================
// 明日方舟主题
// ============================================

/**
 * 深海猎人 (Abyssal Hunters)
 * 灵感来源：斯卡蒂、幽灵鲨、歌蕾蒂娅
 * 深海蓝紫色调，神秘而深邃
 */
export const abyssalTheme: ThemeDefinition = {
  id: "abyssal",
  name: "深海猎人",
  description: "来自伊比利亚的深海之力",
  light: {
    background: "244 246 250",
    foreground: "15 20 35",
    card: "255 255 255",
    "card-foreground": "15 20 35",
    popover: "235 240 250",
    "popover-foreground": "15 20 35",
    primary: "45 80 160",
    "primary-foreground": "240 245 255",
    secondary: "90 130 180",
    "secondary-foreground": "255 255 255",
    muted: "200 210 225",
    "muted-foreground": "70 85 110",
    accent: "130 80 170",
    "accent-foreground": "255 255 255",
    destructive: "200 60 80",
    "destructive-foreground": "255 255 255",
    border: "215 225 240",
    input: "195 205 225",
    ring: "215 225 240",
  },
  dark: {
    background: "8 12 22",
    foreground: "230 235 245",
    card: "18 25 42",
    "card-foreground": "230 235 245",
    popover: "25 32 50",
    "popover-foreground": "230 235 245",
    primary: "70 120 200",
    "primary-foreground": "255 255 255",
    secondary: "100 145 200",
    "secondary-foreground": "15 25 45",
    muted: "45 55 80",
    "muted-foreground": "160 175 200",
    accent: "150 100 200",
    "accent-foreground": "255 255 255",
    destructive: "220 80 100",
    "destructive-foreground": "255 255 255",
    border: "40 50 75",
    input: "50 62 90",
    ring: "40 50 75",
  },
};

/**
 * 莱茵生命 (Rhine Lab)
 * 灵感来源：赛恩娜、赛蕾娅、伊芙利特
 * 生命科技绿色调，专业而理性
 */
export const rhineTheme: ThemeDefinition = {
  id: "rhine",
  name: "莱茵生命",
  description: "源石技艺与生命科学的结晶",
  light: {
    background: "244 250 248",
    foreground: "10 25 20",
    card: "255 255 255",
    "card-foreground": "10 25 20",
    popover: "235 248 244",
    "popover-foreground": "10 25 20",
    primary: "0 150 120",
    "primary-foreground": "255 255 255",
    secondary: "60 180 160",
    "secondary-foreground": "10 50 40",
    muted: "200 220 215",
    "muted-foreground": "60 85 75",
    accent: "255 180 50",
    "accent-foreground": "50 35 0",
    destructive: "220 60 60",
    "destructive-foreground": "255 255 255",
    border: "210 230 225",
    input: "190 215 208",
    ring: "210 230 225",
  },
  dark: {
    background: "5 15 12",
    foreground: "230 245 240",
    card: "15 30 25",
    "card-foreground": "230 245 240",
    popover: "22 38 32",
    "popover-foreground": "230 245 240",
    primary: "40 190 160",
    "primary-foreground": "0 30 20",
    secondary: "80 200 175",
    "secondary-foreground": "10 45 35",
    muted: "35 55 48",
    "muted-foreground": "150 185 175",
    accent: "255 200 80",
    "accent-foreground": "50 35 0",
    destructive: "240 80 80",
    "destructive-foreground": "255 255 255",
    border: "35 55 48",
    input: "45 68 58",
    ring: "35 55 48",
  },
};

/**
 * 黑钢国际 (Blacksteel Worldwide)
 * 灵感来源：芙兰卡、雷蛇、杰西卡
 * 专业灰黑色调，冷静而可靠
 */
export const blacksteelTheme: ThemeDefinition = {
  id: "blacksteel",
  name: "黑钢国际",
  description: "专业、高效、值得信赖",
  light: {
    background: "247 248 250",
    foreground: "20 22 28",
    card: "255 255 255",
    "card-foreground": "20 22 28",
    popover: "240 242 246",
    "popover-foreground": "20 22 28",
    primary: "50 55 65",
    "primary-foreground": "250 251 253",
    secondary: "100 108 125",
    "secondary-foreground": "255 255 255",
    muted: "215 218 225",
    "muted-foreground": "85 90 105",
    accent: "200 160 60",
    "accent-foreground": "40 30 0",
    destructive: "200 50 50",
    "destructive-foreground": "255 255 255",
    border: "225 228 235",
    input: "205 210 220",
    ring: "225 228 235",
  },
  dark: {
    background: "12 13 16",
    foreground: "240 242 248",
    card: "22 24 30",
    "card-foreground": "240 242 248",
    popover: "30 32 40",
    "popover-foreground": "240 242 248",
    primary: "180 185 195",
    "primary-foreground": "20 22 28",
    secondary: "120 128 145",
    "secondary-foreground": "240 242 248",
    muted: "45 48 58",
    "muted-foreground": "155 160 175",
    accent: "220 180 80",
    "accent-foreground": "35 25 0",
    destructive: "230 70 70",
    "destructive-foreground": "255 255 255",
    border: "42 45 55",
    input: "52 56 68",
    ring: "42 45 55",
  },
};

/**
 * 企鹅物流 (Penguin Logistics)
 * 灵感来源：能天使、德克萨斯、拉普兰德
 * 活力橙黄色调，自由而热情
 */
export const penguinTheme: ThemeDefinition = {
  id: "penguin",
  name: "企鹅物流",
  description: "龙门最可靠的物流服务",
  light: {
    background: "255 251 245",
    foreground: "35 25 10",
    card: "255 255 255",
    "card-foreground": "35 25 10",
    popover: "255 248 235",
    "popover-foreground": "35 25 10",
    primary: "255 130 0",
    "primary-foreground": "255 255 255",
    secondary: "255 180 60",
    "secondary-foreground": "80 50 0",
    muted: "240 230 215",
    "muted-foreground": "120 95 60",
    accent: "80 80 85",
    "accent-foreground": "255 255 255",
    destructive: "220 50 50",
    "destructive-foreground": "255 255 255",
    border: "245 235 218",
    input: "235 220 195",
    ring: "245 235 218",
  },
  dark: {
    background: "18 12 5",
    foreground: "255 248 235",
    card: "35 25 15",
    "card-foreground": "255 248 235",
    popover: "45 35 22",
    "popover-foreground": "255 248 235",
    primary: "255 150 30",
    "primary-foreground": "35 20 0",
    secondary: "255 190 80",
    "secondary-foreground": "60 35 0",
    muted: "55 45 32",
    "muted-foreground": "195 175 145",
    accent: "150 150 160",
    "accent-foreground": "30 30 35",
    destructive: "240 70 70",
    "destructive-foreground": "255 255 255",
    border: "55 45 30",
    input: "68 55 38",
    ring: "55 45 30",
  },
};

/**
 * 龙门近卫局 (Lungmen Guard Department)
 * 灵感来源：陈、星熊、诗怀雅
 * 金色威严色调，正义而庄重
 */
export const lungmenTheme: ThemeDefinition = {
  id: "lungmen",
  name: "龙门近卫局",
  description: "守护龙门的坚盾与利剑",
  light: {
    background: "252 250 245",
    foreground: "30 25 15",
    card: "255 255 255",
    "card-foreground": "30 25 15",
    popover: "250 245 235",
    "popover-foreground": "30 25 15",
    primary: "180 145 50",
    "primary-foreground": "255 255 255",
    secondary: "140 115 60",
    "secondary-foreground": "255 250 235",
    muted: "230 222 205",
    "muted-foreground": "100 85 55",
    accent: "180 50 50",
    "accent-foreground": "255 255 255",
    destructive: "200 50 50",
    "destructive-foreground": "255 255 255",
    border: "235 228 210",
    input: "220 210 185",
    ring: "235 228 210",
  },
  dark: {
    background: "15 12 8",
    foreground: "250 245 230",
    card: "28 24 18",
    "card-foreground": "250 245 230",
    popover: "38 32 24",
    "popover-foreground": "250 245 230",
    primary: "210 175 70",
    "primary-foreground": "25 20 5",
    secondary: "170 145 85",
    "secondary-foreground": "250 245 225",
    muted: "50 45 35",
    "muted-foreground": "180 168 140",
    accent: "200 70 70",
    "accent-foreground": "255 255 255",
    destructive: "230 70 70",
    "destructive-foreground": "255 255 255",
    border: "48 42 32",
    input: "60 52 40",
    ring: "48 42 32",
  },
};

/**
 * 所有可用主题
 */
export const themes: ThemeDefinition[] = [
  redTheme,
  blueTheme,
  abyssalTheme,
  rhineTheme,
  blacksteelTheme,
  penguinTheme,
  lungmenTheme,
];

/**
 * 通过 ID 获取主题
 */
export function getThemeById(id: string): ThemeDefinition | undefined {
  return themes.find((theme) => theme.id === id);
}

/**
 * 默认主题 ID
 */
export const DEFAULT_THEME_ID = "red";
