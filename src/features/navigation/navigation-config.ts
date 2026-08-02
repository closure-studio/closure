import {
  Boxes,
  CalendarClock,
  Grid2X2,
  ListChecks,
  PanelsTopLeft,
  ServerCog,
  UsersRound,
  Video,
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
  site: { id: 'site', route: '/settings/site', icon: PanelsTopLeft, sort: 20 },
  system: { id: 'system', route: '/settings/system', icon: ServerCog, sort: 10 },
  recordings: { id: 'recordings', route: '/settings/recordings', icon: Video, sort: 30 },
} as const;

export const settingsNavigation = {
  defaultPage: settingsPages.site,
  pages: settingsPages,
} as const;

export type DashboardPageId = keyof typeof dashboardNavigation.pages;
export type NavigationScope = 'dashboard' | 'settings';

export function getNavigationScope(pathname: string): NavigationScope {
  return pathname === '/settings' || pathname.startsWith('/settings/')
    ? 'settings'
    : 'dashboard';
}
