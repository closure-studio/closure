import {
  createContext,
  type PropsWithChildren,
  useContext,
} from 'react';

import type { GameAccount } from '@/schemas/game-account';
import { useAppStore } from '@/store';
import {
  findGameAccountById,
  useGameAccountsQuery,
} from './queries';

type DashboardAccountContextValue = {
  selectedGameAccount: GameAccount | null;
  gameAccountsQuery: ReturnType<typeof useGameAccountsQuery>;
  selectGameAccount: (gameAccountId: string) => void;
};

const DashboardAccountContext = createContext<DashboardAccountContextValue | null>(null);

export function DashboardAccountProvider({ children }: PropsWithChildren) {
  const selectedGameAccountId = useAppStore(
    (state) => state.selectedGameAccountId,
  );
  const selectGameAccount = useAppStore((state) => state.selectGameAccount);
  const gameAccountsQuery = useGameAccountsQuery();
  const selectedGameAccount = findGameAccountById(
    gameAccountsQuery.data,
    selectedGameAccountId,
  ) ?? gameAccountsQuery.data?.[0] ?? null;

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
