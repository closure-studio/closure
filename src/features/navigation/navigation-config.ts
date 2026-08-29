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

export const dashboardPages = [
  { id: 'overview', icon: Grid2X2 },
  { id: 'settings', icon: Settings2 },
  { id: 'operators', icon: UsersRound },
  { id: 'inventory', icon: Boxes },
  { id: 'activity', icon: CalendarClock },
] as const;
export const dashboardDefaultPageId: DashboardPageId = 'overview';

const settingsPages = {
  network: { id: 'network', route: ROUTES.settingsNetwork, icon: Wifi },
  account: { id: 'account', route: ROUTES.settingsAccount, icon: ShieldCheck },
  contributors: { id: 'contributors', route: ROUTES.settingsContributors, icon: HeartHandshake },
} as const;

export const settingsPagesList = Object.values(settingsPages);
export const settingsDefaultPage = settingsPages.network;

export type DashboardPageId = (typeof dashboardPages)[number]['id'];
export type SettingsPageId = keyof typeof settingsPages;
export type SettingsPageRoute =
  (typeof settingsPages)[SettingsPageId]['route'];
export type NavigationScope = 'dashboard' | 'settings';

export function dashboardPageHref(
  pageId: DashboardPageId,
): Href {
  return `/dashboard/${pageId}`;
}

export function getSettingsPageId(pathname: string): SettingsPageId | null {
  return settingsPagesList.find((page) => page.route === pathname)?.id ?? null;
}
