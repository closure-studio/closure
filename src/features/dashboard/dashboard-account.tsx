import { useGlobalSearchParams } from 'expo-router';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
} from 'react';
import * as v from 'valibot';

import {
  gameAccountIdSchema,
  type GameAccount,
} from '@/schemas/game-account';
import {
  findGameAccountById,
  useGameAccountsQuery,
} from './queries';

type DashboardRouteParams = {
  gameAccountId?: string | string[];
};

type DashboardAccountContextValue = {
  routeGameAccountId: string | null;
  selectedGameAccount: GameAccount | null;
  gameAccountsQuery: ReturnType<typeof useGameAccountsQuery>;
  selectGameAccount: (gameAccountId: string) => void;
};

const DashboardAccountContext = createContext<DashboardAccountContextValue | null>(null);

export function DashboardAccountProvider({
  children,
  onSelectGameAccount,
}: PropsWithChildren<{ onSelectGameAccount: (gameAccountId: string) => void }>) {
  const { gameAccountId: routeGameAccountId } = useGlobalSearchParams<DashboardRouteParams>();
  const gameAccountIdResult = v.safeParse(gameAccountIdSchema, routeGameAccountId);
  const gameAccountId = gameAccountIdResult.success ? gameAccountIdResult.output : null;
  const gameAccountsQuery = useGameAccountsQuery();
  const selectedGameAccount = findGameAccountById(
    gameAccountsQuery.data,
    gameAccountId,
  );

  const selectGameAccount = useCallback((nextGameAccountId: string) => {
    if (nextGameAccountId === gameAccountId) return;

    onSelectGameAccount(nextGameAccountId);
  }, [gameAccountId, onSelectGameAccount]);

  return (
    <DashboardAccountContext.Provider
      value={{
        routeGameAccountId: gameAccountId,
        selectedGameAccount,
        gameAccountsQuery,
        selectGameAccount,
      }}
    >
      {children}
    </DashboardAccountContext.Provider>
  );
}

export function useDashboardAccount(): DashboardAccountContextValue {
  const context = useContext(DashboardAccountContext);
  if (!context) {
    throw new Error('useDashboardAccount must be used inside DashboardAccountProvider');
  }
  return context;
}
