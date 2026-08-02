import { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import type { DashboardSectionId } from './navigation-config';

type NavigationContextValue = {
  activeDashboardSectionId: DashboardSectionId;
  selectDashboardSection: (sectionId: DashboardSectionId) => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: PropsWithChildren) {
  const [activeDashboardSectionId, selectDashboardSection] = useState<DashboardSectionId>('overview');
  const value = useMemo(
    () => ({ activeDashboardSectionId, selectDashboardSection }),
    [activeDashboardSectionId],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationState() {
  const navigation = useContext(NavigationContext);
  if (!navigation) throw new Error('useNavigationState must be used within a NavigationProvider.');
  return navigation;
}
