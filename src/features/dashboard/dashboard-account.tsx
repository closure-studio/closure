import { toast } from '@tamagui/toast/v2';
import { useTranslation } from 'react-i18next';
import { useMedia } from 'tamagui';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import type { GameAccount } from '@/schemas/game-account';
import { subscribeToLiveGameLogs, useGameAccountsQuery } from './queries';

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

export function useDashboardLiveLogToast() {
  const { t } = useTranslation('dashboard');
  const { large } = useMedia();
  const { selectedGameAccount } = useDashboardAccount();
  const accountId = selectedGameAccount?.account;

  useEffect(() => {
    if (large || !accountId) return;
    const toastId = `dashboard-live-log-${accountId}`;
    const unsubscribe = subscribeToLiveGameLogs((log) => {
      if (log.name === accountId) {
        toast.info(t('logs.title'), { id: toastId, description: log.content });
      }
    });
    return () => {
      unsubscribe();
      toast.dismiss(toastId);
    };
  }, [accountId, large, t]);
}
