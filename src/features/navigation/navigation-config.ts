import {
  Boxes,
  CalendarClock,
  Grid2X2,
  HeartHandshake,
  ShieldCheck,
  Settings2,
  UsersRound,
  Wifi,
} from 'lucide-react-native';
import type { Href } from 'expo-router';

import { ROUTES } from '@/constants/routes';

const dashboardPages = {
  overview: { id: 'overview', icon: Grid2X2 },
  settings: { id: 'settings', icon: Settings2 },
  operators: { id: 'operators', icon: UsersRound },
  inventory: { id: 'inventory', icon: Boxes },
  activity: { id: 'activity', icon: CalendarClock },
} as const;

export const dashboardPagesList = Object.values(dashboardPages);
export const dashboardDefaultPageId: DashboardPageId = 'overview';

const settingsPages = {
  network: { id: 'network', route: ROUTES.settingsNetwork, icon: Wifi },
  account: { id: 'account', route: ROUTES.settingsAccount, icon: ShieldCheck },
  contributors: { id: 'contributors', route: ROUTES.settingsContributors, icon: HeartHandshake },
} as const;

export const settingsPagesList = Object.values(settingsPages);
export const settingsDefaultPage = settingsPages.network;

export type DashboardPageId = keyof typeof dashboardPages;
export type SettingsPageId = keyof typeof settingsPages;
export type SettingsPageRoute =
  (typeof settingsPages)[SettingsPageId]['route'];
export type NavigationScope = 'dashboard' | 'settings';

export function dashboardPageHref(
  pageId: DashboardPageId,
  gameAccountId: string,
): Href {
  return `/dashboard/${gameAccountId}/${pageId}`;
}

export function getSettingsPageId(pathname: string): SettingsPageId | null {
  return settingsPagesList.find((page) => page.route === pathname)?.id ?? null;
}
