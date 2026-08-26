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
  overview: { id: 'overview', segment: 'overview', icon: Grid2X2, sort: 10 },
  settings: { id: 'settings', segment: 'settings', icon: Settings2, sort: 20 },
  operators: { id: 'operators', segment: 'operators', icon: UsersRound, sort: 30 },
  inventory: { id: 'inventory', segment: 'inventory', icon: Boxes, sort: 40 },
  activity: { id: 'activity', segment: 'activity', icon: CalendarClock, sort: 50 },
} as const;

export const dashboardNavigation = {
  defaultPage: dashboardPages.overview,
  pages: dashboardPages,
} as const;

export const sortedDashboardPages = Object.values(dashboardPages).sort((left, right) => left.sort - right.sort);

const settingsPages = {
  network: { id: 'network', segment: 'network', route: ROUTES.settingsNetwork, icon: Wifi, sort: 10 },
  account: { id: 'account', segment: 'account', route: ROUTES.settingsAccount, icon: ShieldCheck, sort: 20 },
  contributors: { id: 'contributors', segment: 'contributors', route: ROUTES.settingsContributors, icon: HeartHandshake, sort: 30 },
} as const;

export const settingsNavigation = {
  defaultPage: settingsPages.network,
  pages: settingsPages,
} as const;

export const sortedSettingsPages = Object.values(settingsPages).sort((left, right) => left.sort - right.sort);

export type DashboardPageId = keyof typeof dashboardNavigation.pages;
export type SettingsPageId = keyof typeof settingsNavigation.pages;
export type SettingsPageRoute =
  (typeof settingsNavigation.pages)[SettingsPageId]['route'];
export type NavigationScope = 'dashboard' | 'settings';

export function dashboardPageHref(
  pageId: DashboardPageId,
  gameAccountId: string,
): Href {
  switch (pageId) {
    case 'overview':
      return { pathname: '/dashboard/overview', params: { gameAccountId } };
    case 'settings':
      return { pathname: '/dashboard/settings', params: { gameAccountId } };
    case 'operators':
      return { pathname: '/dashboard/operators', params: { gameAccountId } };
    case 'inventory':
      return { pathname: '/dashboard/inventory', params: { gameAccountId } };
    case 'activity':
      return { pathname: '/dashboard/activity', params: { gameAccountId } };
  }
}

export function getDashboardPageId(pathname: string): DashboardPageId | null {
  const segment = pathname.split('/').filter(Boolean).at(-1);
  return Object.values(dashboardPages).find((page) => page.segment === segment)?.id ?? null;
}

export function getSettingsPageId(pathname: string): SettingsPageId | null {
  const segment = pathname.split('/').filter(Boolean).at(-1);
  return Object.values(settingsPages).find((page) => page.segment === segment)?.id ?? null;
}
