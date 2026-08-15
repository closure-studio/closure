import {
  Boxes,
  CalendarClock,
  Grid2X2,
  HeartHandshake,
  ShieldCheck,
  UsersRound,
  Wifi,
} from 'lucide-react-native';

import { ROUTES } from '@/constants/routes';

const dashboardPages = {
  overview: { id: 'overview', route: ROUTES.dashboardOverview, icon: Grid2X2, sort: 10 },
  operators: { id: 'operators', route: ROUTES.dashboardOperators, icon: UsersRound, sort: 20 },
  inventory: { id: 'inventory', route: ROUTES.dashboardInventory, icon: Boxes, sort: 30 },
  activity: { id: 'activity', route: ROUTES.dashboardActivity, icon: CalendarClock, sort: 40 },
} as const;

export const dashboardNavigation = {
  defaultPage: dashboardPages.overview,
  pages: dashboardPages,
} as const;

export const sortedDashboardPages = Object.values(dashboardPages).sort((left, right) => left.sort - right.sort);

const settingsPages = {
  network: { id: 'network', route: ROUTES.settingsNetwork, icon: Wifi, sort: 10 },
  account: { id: 'account', route: ROUTES.settingsAccount, icon: ShieldCheck, sort: 20 },
  contributors: { id: 'contributors', route: ROUTES.settingsContributors, icon: HeartHandshake, sort: 30 },
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

export function getNavigationScope(pathname: string): NavigationScope {
  return pathname === ROUTES.settings || pathname.startsWith(`${ROUTES.settings}/`)
    ? 'settings'
    : 'dashboard';
}
