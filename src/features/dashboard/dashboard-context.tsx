import { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';

import { useDashboardController } from './hooks/use-dashboard-controller';

type DashboardContextValue = ReturnType<typeof useDashboardController>;

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: PropsWithChildren) {
  const dashboard = useDashboardController();

  return (
    <DashboardContext.Provider value={dashboard}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardState() {
  const dashboard = useContext(DashboardContext);
  if (!dashboard) throw new Error('useDashboardState must be used within a DashboardProvider.');
  return dashboard;
}
