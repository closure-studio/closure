import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';

import type { GameAccount } from '@/schemas/game-account';
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
  const [selectedGameAccountId, setSelectedGameAccountId] = useState<string | null>(null);
  const gameAccountsQuery = useGameAccountsQuery();
  const matchedGameAccount = findGameAccountById(
    gameAccountsQuery.data,
    selectedGameAccountId,
  );

  if (
    selectedGameAccountId !== null
    && gameAccountsQuery.data
    && !matchedGameAccount
  ) {
    setSelectedGameAccountId(null);
  }

  const selectedGameAccount = matchedGameAccount
    ?? gameAccountsQuery.data?.[0]
    ?? null;

  return (
    <DashboardAccountContext.Provider
      value={{
        selectedGameAccount,
        gameAccountsQuery,
        selectGameAccount: setSelectedGameAccountId,
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
