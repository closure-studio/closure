import { useCallback, useState } from 'react';

import { createGameAccount, initialGameAccounts } from '../mocks/game-accounts';
import { selectActiveGameAccount } from '../selectors';
import type { GameAccount, LinkGameAccountCredentials } from '@/schemas/game-account';

export function useDashboardController() {
  const [gameAccounts, setGameAccounts] = useState<GameAccount[]>(initialGameAccounts);
  const [activeGameAccountId, setActiveGameAccountId] = useState(initialGameAccounts[0].id);
  const [isLinkGameAccountSheetOpen, setIsLinkGameAccountSheetOpen] = useState(false);
  const activeGameAccount = selectActiveGameAccount(gameAccounts, activeGameAccountId);

  const selectGameAccount = useCallback((gameAccountId: string) => {
    setActiveGameAccountId(gameAccountId);
  }, []);

  const linkGameAccount = useCallback((credentials: LinkGameAccountCredentials) => {
    const newGameAccount = createGameAccount({
      accountIdentifier: credentials.accountIdentifier,
      serverChannel: credentials.serverChannel,
    });
    setGameAccounts((currentGameAccounts) => [...currentGameAccounts, newGameAccount]);
    setActiveGameAccountId(newGameAccount.id);
  }, []);

  const toggleRoutineTaskCompletion = useCallback((taskId: string) => {
    setGameAccounts((currentGameAccounts) => currentGameAccounts.map((gameAccount) => gameAccount.id === activeGameAccountId
      ? { ...gameAccount, routineTasks: gameAccount.routineTasks.map((task) => task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task) }
      : gameAccount));
  }, [activeGameAccountId]);

  return {
    activeGameAccount,
    activeGameAccountId,
    gameAccounts,
    isLinkGameAccountSheetOpen,
    linkGameAccount,
    selectGameAccount,
    setIsLinkGameAccountSheetOpen,
    toggleRoutineTaskCompletion,
  };
}
