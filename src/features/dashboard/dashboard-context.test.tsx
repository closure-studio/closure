import { act, renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { DashboardProvider, useDashboardState } from './dashboard-context';

function DashboardTestProvider({ children }: PropsWithChildren) {
  return <DashboardProvider>{children}</DashboardProvider>;
}

describe('DashboardProvider', () => {
  it('keeps dashboard state while its routed child changes', async () => {
    const { rerender, result } = await renderHook(
      ({ pageId }: { pageId: string }) => ({ dashboard: useDashboardState(), pageId }),
      {
        initialProps: { pageId: 'overview' },
        wrapper: DashboardTestProvider,
      },
    );
    const task = result.current.dashboard.activeGameAccount.routineTasks[0];
    if (!task) throw new Error('Expected the dashboard fixture to include a routine task.');

    await act(() => {
      result.current.dashboard.toggleRoutineTaskCompletion(task.id);
    });
    await rerender({ pageId: 'tasks' });

    const updatedTask = result.current.dashboard.activeGameAccount.routineTasks.find(
      (candidate) => candidate.id === task.id,
    );
    expect(result.current.pageId).toBe('tasks');
    expect(updatedTask?.isCompleted).toBe(!task.isCompleted);
  });
});
