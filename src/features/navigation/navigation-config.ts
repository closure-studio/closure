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
  overview: { id: 'overview', route: '/dashboard/overview', icon: Grid2X2 },
  settings: { id: 'settings', route: '/dashboard/settings', icon: Settings2 },
  operators: { id: 'operators', route: '/dashboard/operators', icon: UsersRound },
  inventory: { id: 'inventory', route: '/dashboard/inventory', icon: Boxes },
  activity: { id: 'activity', route: '/dashboard/activity', icon: CalendarClock },
} as const;

export const dashboardNavigation = {
  defaultPage: dashboardPages.overview,
  pages: dashboardPages,
} as const;

export const dashboardPagesList = Object.values(dashboardPages);

const settingsPages = {
  network: { id: 'network', route: ROUTES.settingsNetwork, icon: Wifi },
  account: { id: 'account', route: ROUTES.settingsAccount, icon: ShieldCheck },
  contributors: { id: 'contributors', route: ROUTES.settingsContributors, icon: HeartHandshake },
} as const;

export const settingsNavigation = {
  defaultPage: settingsPages.network,
  pages: settingsPages,
} as const;

export const settingsPagesList = Object.values(settingsPages);

export type DashboardPageId = keyof typeof dashboardNavigation.pages;
export type SettingsPageId = keyof typeof settingsNavigation.pages;
export type SettingsPageRoute =
  (typeof settingsNavigation.pages)[SettingsPageId]['route'];
export type NavigationScope = 'dashboard' | 'settings';

export function dashboardPageHref(
  pageId: DashboardPageId,
  gameAccountId: string,
): Href {
  return {
    pathname: dashboardPages[pageId].route,
    params: { gameAccountId },
  };
}

export function getDashboardPageId(pathname: string): DashboardPageId | null {
  return dashboardPagesList.find((page) => page.route === pathname)?.id ?? null;
}

export function getSettingsPageId(pathname: string): SettingsPageId | null {
  return settingsPagesList.find((page) => page.route === pathname)?.id ?? null;
}
