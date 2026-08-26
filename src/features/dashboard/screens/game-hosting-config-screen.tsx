import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { DashboardPageFrame } from '../components/dashboard-shell';
import { GameHostingConfigView } from '../components/game-hosting-config-view';
import type { ArkHostFailure } from '../api';
import type { ArkHostGameConfigPatch } from '@/schemas/arkhost';
import type { GameAccount } from '@/schemas/game-account';
import { useUpdateGameConfig } from '../queries';

type ConfigErrorKey =
  | 'hostingConfig.errors.invalidResponse'
  | 'hostingConfig.errors.operationRejected'
  | 'hostingConfig.errors.unavailable';

function getConfigErrorKey(error: ArkHostFailure | null): ConfigErrorKey | null {
  if (!error) return null;

  switch (error.code) {
    case 'operation-rejected':
      return 'hostingConfig.errors.operationRejected';
    case 'network-unavailable':
    case 'server-error':
    case 'timeout':
      return 'hostingConfig.errors.unavailable';
    case 'invalid-response':
      return 'hostingConfig.errors.invalidResponse';
  }

  return null;
}

export function GameHostingConfigScreen({ gameAccount }: { gameAccount: GameAccount }) {
  const { t } = useTranslation('dashboard');
  const {
    error,
    mutateAsync,
    reset,
    status,
  } = useUpdateGameConfig();
  const account = gameAccount.account;

  useEffect(() => {
    reset();
  }, [account, reset]);

  const handleSubmit = useCallback((patch: ArkHostGameConfigPatch) => {
    return mutateAsync({ account, patch }).then(() => undefined);
  }, [account, mutateAsync]);

  const errorKey = getConfigErrorKey(error ?? null);

  return (
    <DashboardPageFrame scroll>
      <GameHostingConfigView
        key={gameAccount.account}
        account={gameAccount.account}
        config={gameAccount.config}
        isSubmitting={status === 'pending'}
        onSubmit={handleSubmit}
        showSuccess={status === 'success'}
        submitError={errorKey ? t(errorKey) : null}
      />
    </DashboardPageFrame>
  );
}
