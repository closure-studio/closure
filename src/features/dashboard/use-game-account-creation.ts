import { toast } from '@tamagui/toast/v2';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ARK_HOST_MAX_GAME_ACCOUNTS_PER_USER } from '@/schemas/arkhost';
import type { ArkHostCreateGameInput } from '@/schemas/arkhost';
import type { ArkHostFailure } from './api';
import { useDashboardAccount } from './dashboard-account';
import { useCreateGame, useLoginGame } from './queries';

type CreationErrorKey =
  | 'account.errors.invalidResponse'
  | 'account.errors.rejected'
  | 'account.errors.unavailable'
  | 'account.errors.verification';

function getCreationErrorKey(error: ArkHostFailure | null): CreationErrorKey | null {
  if (!error) return null;

  switch (error.code) {
    case 'operation-rejected':
      return 'account.errors.rejected';
    case 'invalid-response':
      return 'account.errors.invalidResponse';
    case 'network-unavailable':
    case 'server-error':
    case 'timeout':
      return 'account.errors.unavailable';
  }

  return 'account.errors.verification';
}

export function useGameAccountCreation({
  onGameAccountSelected,
}: {
  onGameAccountSelected: () => void;
}) {
  const { t } = useTranslation('dashboard');
  const { gameAccountsQuery, selectGameAccount } = useDashboardAccount();
  const createGame = useCreateGame();
  const loginGame = useLoginGame();
  const [open, setOpen] = useState(false);
  const gameAccounts = gameAccountsQuery.data ?? [];
  const canCreateGame = gameAccountsQuery.isSuccess
    && gameAccounts.length < ARK_HOST_MAX_GAME_ACCOUNTS_PER_USER;

  const isPending = createGame.isPending || loginGame.isPending;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    createGame.reset();
    loginGame.reset();
    setOpen(nextOpen);
  };

  const submit = async (input: ArkHostCreateGameInput) => {
    const createdAccountId = await createGame.mutateAsync(input);
    if (!createdAccountId) {
      toast.warning(t('account.syncFailed'));
      return;
    }

    selectGameAccount(createdAccountId);
    onGameAccountSelected();

    try {
      await loginGame.mutateAsync(createdAccountId);
      toast.success(t('account.success'));
    } catch {
      toast.warning(t('account.startFailed'));
    }
  };

  const errorKey = getCreationErrorKey(createGame.error ?? null);

  return {
    canCreateGame,
    dialog: {
      error: errorKey ? t(errorKey) : null,
      isPending,
      onClearError: createGame.reset,
      onOpenChange: handleOpenChange,
      onSubmit: submit,
      open,
    },
    openDialog: () => handleOpenChange(true),
  };
}
