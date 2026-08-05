import {
  Boxes,
  CalendarClock,
  Grid2X2,
  HeartHandshake,
  ListChecks,
  ShieldCheck,
  UsersRound,
  Wifi,
} from 'lucide-react-native';

const dashboardPages = {
  overview: { id: 'overview', route: '/dashboard/overview', icon: Grid2X2, sort: 10 },
  operators: { id: 'operators', route: '/dashboard/operators', icon: UsersRound, sort: 20 },
  inventory: { id: 'inventory', route: '/dashboard/inventory', icon: Boxes, sort: 30 },
  tasks: { id: 'tasks', route: '/dashboard/tasks', icon: ListChecks, sort: 40 },
  activity: { id: 'activity', route: '/dashboard/activity', icon: CalendarClock, sort: 50 },
} as const;

export const dashboardNavigation = {
  defaultPage: dashboardPages.overview,
  pages: dashboardPages,
} as const;

const settingsPages = {
  network: { id: 'network', route: '/settings/network', icon: Wifi, sort: 10 },
  account: { id: 'account', route: '/settings/account', icon: ShieldCheck, sort: 20 },
  contributors: { id: 'contributors', route: '/settings/contributors', icon: HeartHandshake, sort: 30 },
} as const;

export const settingsNavigation = {
  defaultPage: settingsPages.network,
  pages: settingsPages,
} as const;

export type DashboardPageId = keyof typeof dashboardNavigation.pages;
export type SettingsPageId = keyof typeof settingsNavigation.pages;
export type SettingsPageRoute =
  (typeof settingsNavigation.pages)[SettingsPageId]['route'];
export type NavigationScope = 'dashboard' | 'settings';

export function getNavigationScope(pathname: string): NavigationScope {
  return pathname === '/settings' || pathname.startsWith('/settings/')
    ? 'settings'
    : 'dashboard';
}
