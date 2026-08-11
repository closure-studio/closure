import type {
  ActivityTimelineEntry,
  GameAccount,
  Operator,
  ServerChannel,
} from '@/schemas/game-account';
import { inventoryFixture } from './inventory';

const operatorTemplates: Omit<Operator, 'level' | 'trust' | 'elite'>[] = [
  { id: 'sga', name: '银灰', codename: 'SILVERASH', class: '近卫', rarity: 6, maxLevel: 90, potential: 4, skillLevel: 7, proficiency: [3, 2, 0] },
  { id: 'sar', name: '棘刺', codename: 'THORNS', class: '近卫', rarity: 6, maxLevel: 90, potential: 1, skillLevel: 7, proficiency: [0, 3, 1] },
  { id: 'sur', name: '能天使', codename: 'EXUSIAI', class: '狙击', rarity: 6, maxLevel: 90, potential: 6, skillLevel: 7, proficiency: [0, 0, 3] },
  { id: 'egl', name: '艾雅法拉', codename: 'EYJAFJALLA', class: '术师', rarity: 6, maxLevel: 90, potential: 2, skillLevel: 7, proficiency: [0, 3, 2] },
  { id: 'shn', name: '夜刀', codename: 'SHIRAYUKI', class: '狙击', rarity: 4, maxLevel: 70, potential: 6, skillLevel: 7, proficiency: [0, 0, 0] },
  { id: 'ptl', name: '推进之王', codename: 'SIEGE', class: '先锋', rarity: 6, maxLevel: 90, potential: 1, skillLevel: 7, proficiency: [1, 0, 0] },
  { id: 'ken', name: '凯尔希', codename: 'KAL\u2019TSIT', class: '医疗', rarity: 6, maxLevel: 90, potential: 1, skillLevel: 7, proficiency: [0, 2, 0] },
  { id: 'sus', name: '苏苏洛', codename: 'SUSSURRO', class: '医疗', rarity: 5, maxLevel: 80, potential: 3, skillLevel: 7, proficiency: [0, 1, 0] },
];

const activityTimeline: ActivityTimelineEntry[] = [
  { id: 't1', scheduleLabel: '07-18 ~ 08-01', title: '生于黑夜 · 复刻', tag: 'SIDE STORY', category: 'event', status: 'active', description: '限时活动关卡开放,可兑换限定家具与合成玉,注意理智消耗节奏。' },
  { id: 't2', scheduleLabel: '07-22 ~ 08-05', title: '限定寻访 · 逐光图纪', tag: 'BANNER', category: 'banner', status: 'active', description: '6★ 限定干员概率 UP,建议保留合成玉与寻访凭证。' },
  { id: 't3', scheduleLabel: '04:00 ~ 10:00', title: '版本维护更新', tag: 'MAINTENANCE', category: 'maintenance', status: 'upcoming', description: '服务器停机维护,期间无法登录,补偿理智将于维护后发放。' },
  { id: 't4', scheduleLabel: '全天', title: '危机合约 · 第 21 期', tag: 'CONTINGENCY', category: 'event', status: 'upcoming', description: '高难度轮换玩法开启,冲击更高合约等级获取赛季奖励。' },
  { id: 't5', scheduleLabel: '07-10 ~ 07-17', title: '每月轮换 · 资源收集', tag: 'NOTICE', category: 'notice', status: 'ended', description: '固定资源关卡轮换已结束,下轮将于下月初刷新。' },
];

function createEliteLevel(seed: number): Operator['elite'] {
  const eliteLevel = seed % 3;
  if (eliteLevel === 0 || eliteLevel === 1) return eliteLevel;
  return 2;
}

function createOperators(accountKey: string): Operator[] {
  const accountKeyCode = accountKey.charCodeAt(accountKey.length - 1);
  return operatorTemplates.map((operator, index) => ({
    ...operator,
    elite: createEliteLevel(accountKeyCode + index),
    level: Math.min(operator.maxLevel, 30 + ((accountKeyCode * (index + 3)) % 55)),
    trust: (accountKeyCode * 7 + index * 13) % 200,
  }));
}

function assembleGameAccount(
  input: Omit<GameAccount, 'operators' | 'inventory' | 'activityTimeline'>,
  accountKey: string,
): GameAccount {
  return {
    ...input,
    operators: createOperators(accountKey),
    inventory: { ...inventoryFixture },
    activityTimeline,
  };
}

export const initialGameAccounts = [
  assembleGameAccount({ id: 'acc-01', callsign: 'AMIYA-MAIN', uid: 'UID 1082 4471', server: '官服 · Bilibili', avatar: 'A', color: 'primary', doctorLevel: 120, exp: [86400, 100000], ap: [128, 135], apRecoverAt: '18:42', lmd: 4820000, orundum: 12480, originium: 96, recruitTickets: 14, drTitle: '资深博士', progress: '主线 14-21', online: '在线', baseMood: 86, factoryLoad: 92, trainingLoad: 100, stats: [{ label: '干员总数', value: '312', trend: '+2' }, { label: '精二干员', value: '48', trend: '+1' }, { label: '公招进行', value: '3 / 4', trend: '', warn: true }, { label: '理智溢出', value: '2h 15m', trend: '', warn: true }] }, 'acc-01'),
  assembleGameAccount({ id: 'acc-02', callsign: 'DOKUTAH-ALT', uid: 'UID 2277 0913', server: '国际服 · EN', avatar: 'D', color: 'warning', doctorLevel: 94, exp: [42100, 78000], ap: [61, 118], apRecoverAt: '21:07', lmd: 1960000, orundum: 5400, originium: 41, recruitTickets: 6, drTitle: '进阶博士', progress: '主线 11-08', online: '2 小时前', baseMood: 71, factoryLoad: 64, trainingLoad: 78, stats: [{ label: '干员总数', value: '208', trend: '+5' }, { label: '精二干员', value: '22', trend: '' }, { label: '公招进行', value: '1 / 4', trend: '' }, { label: '理智溢出', value: '充足', trend: '' }] }, 'acc-02'),
  assembleGameAccount({ id: 'acc-03', callsign: 'RECRUIT-03', uid: 'UID 3391 5560', server: '官服 · 官方', avatar: 'R', color: 'muted', doctorLevel: 58, exp: [12300, 40000], ap: [110, 96], apRecoverAt: '已满', lmd: 640000, orundum: 1820, originium: 12, recruitTickets: 3, drTitle: '见习博士', progress: '主线 6-15', online: '昨天', baseMood: 55, factoryLoad: 40, trainingLoad: 0, stats: [{ label: '干员总数', value: '96', trend: '+8' }, { label: '精二干员', value: '4', trend: '' }, { label: '公招进行', value: '0 / 4', trend: '', warn: true }, { label: '理智溢出', value: '已溢出', trend: '', warn: true }] }, 'acc-03'),
] satisfies [GameAccount, ...GameAccount[]];

let generatedAccountCount = 0;

export function createGameAccount(input: { accountIdentifier: string; serverChannel: ServerChannel }): GameAccount {
  generatedAccountCount += 1;
  const accountName = input.accountIdentifier.trim() || `DOCTOR-${generatedAccountCount}`;
  const server = input.serverChannel === '官服' ? '官服 · 官方' : 'B服 · Bilibili';
  const accountKey = `acc-new-${generatedAccountCount}`;
  return assembleGameAccount({ id: accountKey, callsign: accountName.toUpperCase().slice(0, 14), uid: `UID 90${generatedAccountCount} 0714`, server, avatar: accountName[0]?.toUpperCase() ?? 'N', color: 'primary', doctorLevel: 1, exp: [0, 3000], ap: [90, 90], apRecoverAt: '已满', lmd: 10000, orundum: 0, originium: 0, recruitTickets: 1, drTitle: '新任博士', progress: '主线 0-1', online: '在线', baseMood: 100, factoryLoad: 0, trainingLoad: 0, stats: [{ label: '干员总数', value: '12', trend: '+12' }, { label: '精二干员', value: '0', trend: '' }, { label: '公招进行', value: '0 / 4', trend: '' }, { label: '理智溢出', value: '充足', trend: '' }] }, accountKey);
}
