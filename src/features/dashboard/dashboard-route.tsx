import { useGlobalSearchParams, usePathname } from 'expo-router';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';

import { ROUTES } from '@/constants/routes';
import type { GameAccount } from '@/schemas/game-account';
import {
  findGameAccountById,
  useGameAccountsQuery,
} from './queries';

type DashboardRouteParams = {
  gameAccountId?: string | string[];
};

type DashboardRouteContextValue = {
  gameAccountId: string | null;
  gameAccount: GameAccount | null;
  gameAccounts: readonly GameAccount[];
  gameAccountsQuery: ReturnType<typeof useGameAccountsQuery>;
};

const DashboardRouteContext = createContext<DashboardRouteContextValue | null>(null);

export function DashboardRouteProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { gameAccountId: rawGameAccountId } = useGlobalSearchParams<DashboardRouteParams>();
  const routeAccountId = typeof rawGameAccountId === 'string' ? rawGameAccountId : null;
  const isDashboardPath = pathname === ROUTES.dashboard
    || pathname.startsWith(`${ROUTES.dashboard}/`);
  const [retainedAccountId, setRetainedAccountId] = useState(routeAccountId);

  if (isDashboardPath && retainedAccountId !== routeAccountId) {
    setRetainedAccountId(routeAccountId);
  }
  const gameAccountId = isDashboardPath ? routeAccountId : retainedAccountId;

  const gameAccountsQuery = useGameAccountsQuery();
  const gameAccounts = gameAccountsQuery.data ?? [];
  const gameAccount = findGameAccountById(gameAccounts, gameAccountId);

  return (
    <DashboardRouteContext.Provider
      value={{ gameAccountId, gameAccount, gameAccounts, gameAccountsQuery }}
    >
      {children}
    </DashboardRouteContext.Provider>
  );
}

export function useDashboardRoute(): DashboardRouteContextValue {
  const context = useContext(DashboardRouteContext);
  if (!context) {
    throw new Error('useDashboardRoute must be used inside DashboardRouteProvider');
  }
  return context;
}
