import { useGlobalSearchParams } from 'expo-router';
import {
  createContext,
  type PropsWithChildren,
  useContext,
} from 'react';

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
  const { gameAccountId: rawGameAccountId } = useGlobalSearchParams<DashboardRouteParams>();
  const gameAccountId = typeof rawGameAccountId === 'string' ? rawGameAccountId : null;

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
