import { useGlobalSearchParams } from 'expo-router';
import { createContext, type PropsWithChildren, useContext } from 'react';
import * as v from 'valibot';

import {
  gameAccountRouteParamsSchema,
  type GameAccount,
} from '@/schemas/game-account';
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
  const params = useGlobalSearchParams<DashboardRouteParams>();
  const parsedParams = v.safeParse(gameAccountRouteParamsSchema, params);
  const gameAccountId = parsedParams.success ? parsedParams.output.gameAccountId : null;
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
