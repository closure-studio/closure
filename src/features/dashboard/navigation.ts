import { Boxes, CalendarClock, Grid2X2, ListChecks, UsersRound } from 'lucide-react-native';

export const dashboardSections = [
  { id: 'overview', icon: Grid2X2 },
  { id: 'operatorRoster', icon: UsersRound },
  { id: 'materialInventory', icon: Boxes },
  { id: 'routineTasks', icon: ListChecks },
  { id: 'activityTimeline', icon: CalendarClock },
] as const;

export type DashboardSectionId = (typeof dashboardSections)[number]['id'];
