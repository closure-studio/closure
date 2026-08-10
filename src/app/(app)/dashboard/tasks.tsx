import {
  DashboardPageScroll,
  RoutineTasksView,
  useDashboardState,
} from '@/features/dashboard';

export default function DashboardTasksRoute() {
  const { activeGameAccount, toggleRoutineTaskCompletion } = useDashboardState();

  return (
    <DashboardPageScroll>
      <RoutineTasksView
        tasks={activeGameAccount.routineTasks}
        onToggle={toggleRoutineTaskCompletion}
      />
    </DashboardPageScroll>
  );
}
