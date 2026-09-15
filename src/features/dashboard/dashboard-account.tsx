import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';

import type { GameAccount } from '@/schemas/game-account';
import { useGameAccountsQuery } from './queries';

type DashboardAccountContextValue = {
  selectedGameAccount: GameAccount | null;
  gameAccountsQuery: ReturnType<typeof useGameAccountsQuery>;
  selectGameAccount: (gameAccountId: string) => void;
};

const DashboardAccountContext = createContext<DashboardAccountContextValue | null>(null);

export function DashboardAccountProvider({ children }: PropsWithChildren) {
  const [selectedGameAccountId, setSelectedGameAccountId] = useState<string | null>(null);
  const gameAccountsQuery = useGameAccountsQuery();
  const matchedGameAccount = selectedGameAccountId === null
    ? null
    : gameAccountsQuery.data?.find(
      (account) => account.account === selectedGameAccountId,
    ) ?? null;

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
