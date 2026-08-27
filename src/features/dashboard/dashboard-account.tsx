import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useState,
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
  selectedGameAccount: GameAccount | null;
  gameAccountsQuery: ReturnType<typeof useGameAccountsQuery>;
  selectGameAccount: (gameAccountId: string) => void;
};

const DashboardAccountContext = createContext<DashboardAccountContextValue | null>(null);

export function DashboardAccountProvider({ children }: PropsWithChildren) {
  const { gameAccountId: routeGameAccountId } = useLocalSearchParams<DashboardRouteParams>();
  const router = useRouter();
  const [gameAccountId, setGameAccountId] = useState<string | null>(() => {
    const result = v.safeParse(gameAccountIdSchema, routeGameAccountId);
    return result.success ? result.output : null;
  });
  const gameAccountsQuery = useGameAccountsQuery();
  const selectedGameAccount = findGameAccountById(
    gameAccountsQuery.data,
    gameAccountId,
  );

  const selectGameAccount = useCallback((nextGameAccountId: string) => {
    if (nextGameAccountId === gameAccountId) return;

    setGameAccountId(nextGameAccountId);
    router.setParams({ gameAccountId: nextGameAccountId });
  }, [gameAccountId, router]);

  return (
    <DashboardAccountContext.Provider
      value={{
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
