import {
  Boxes,
  CalendarClock,
  Grid2X2,
  LayoutDashboard,
  ListChecks,
  PanelsTopLeft,
  ServerCog,
  UsersRound,
  Video,
} from 'lucide-react-native';

export const dashboardSections = [
  { id: 'overview', icon: Grid2X2 },
  { id: 'operatorRoster', icon: UsersRound },
  { id: 'materialInventory', icon: Boxes },
  { id: 'routineTasks', icon: ListChecks },
  { id: 'activityTimeline', icon: CalendarClock },
] as const;

export const navigationPages = [
  { id: 'dashboard', route: '/', icon: LayoutDashboard },
  { id: 'system', route: '/system', icon: ServerCog },
  { id: 'site', route: '/settings', icon: PanelsTopLeft },
  { id: 'records', route: '/records', icon: Video },
] as const;

export type NavigationPageId = (typeof navigationPages)[number]['id'];
export type NavigationPageRoute = (typeof navigationPages)[number]['route'];
export type DashboardSectionId = (typeof dashboardSections)[number]['id'];
export type NavigationMode = 'dashboard' | 'matrix';

export type MatrixReturnAction =
  | { kind: 'back' }
  | { kind: 'replace'; route: '/' };

export function getNavigationMode(pathname: string): NavigationMode {
  return pathname === '/' ? 'dashboard' : 'matrix';
}

export function shouldShowMobileBottomNavigation(activePageId: NavigationPageId): boolean {
  return activePageId !== 'site';
}

export function getMatrixReturnAction(enteredFromDashboard: boolean, canGoBack: boolean): MatrixReturnAction {
  return enteredFromDashboard && canGoBack
    ? { kind: 'back' }
    : { kind: 'replace', route: '/' };
}
