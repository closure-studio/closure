import { RefreshCw } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Spinner, XStack, YStack, getTokens } from 'tamagui';

import { MonoText, TerminalNotice } from '@/components';
import { DashboardPageFrame } from '../components/dashboard-shell';
import { GameHostingConfigView } from '../components/game-hosting-config-view';
import type { ArkHostFailure } from '../api';
import type { ArkHostGameConfigPatch } from '@/schemas/arkhost';
import type { GameAccount } from '@/schemas/game-account';
import { FailureError } from '@/utils/failure-error';
import { useGameDetailQuery, useUpdateGameConfig } from '../queries';

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

function getDetailErrorKey(error: Error | null): ConfigErrorKey {
  return error instanceof FailureError && error.code === 'invalid-response'
    ? 'hostingConfig.errors.invalidResponse'
    : 'hostingConfig.errors.unavailable';
}

export function GameHostingConfigScreen({ gameAccount }: { gameAccount: GameAccount }) {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const colors = getTokens().color;
  const {
    error,
    mutateAsync,
    reset,
    status,
  } = useUpdateGameConfig();
  const account = gameAccount.account;
  const detailQuery = useGameDetailQuery(account);
  const detail = detailQuery.data;

  useEffect(() => {
    reset();
  }, [account, reset]);

  const handleSubmit = useCallback((patch: ArkHostGameConfigPatch) => {
    return mutateAsync({ account, patch }).then(() => undefined);
  }, [account, mutateAsync]);

  const errorKey = getConfigErrorKey(error ?? null);

  if (detailQuery.isPending) {
    return (
      <DashboardPageFrame scroll>
        <XStack items="center" gap="$2" py="$3">
          <Spinner size="small" color="$appAccent" />
          <MonoText size="$1" color="$appMuted">
            {t('hostingConfig.loading')}
          </MonoText>
        </XStack>
      </DashboardPageFrame>
    );
  }

  if (detailQuery.isError || !detail) {
    return (
      <DashboardPageFrame scroll>
        <YStack gap="$3">
          <TerminalNotice tone="danger">
            {t(getDetailErrorKey(detailQuery.error))}
          </TerminalNotice>
          <Button
            self="flex-start"
            icon={detailQuery.isFetching
              ? <Spinner size="small" color="$appAccent" />
              : <RefreshCw size={16} color={colors.appAccent.val} />}
            disabled={detailQuery.isFetching}
            onPress={() => {
              void detailQuery.refetch();
            }}
          >
            {tCommon('actions.retry')}
          </Button>
        </YStack>
      </DashboardPageFrame>
    );
  }

  return (
    <DashboardPageFrame scroll>
      <GameHostingConfigView
        key={gameAccount.account}
        config={detail.config}
        rooms={detail.building?.rooms}
        isSubmitting={status === 'pending'}
        onSubmit={handleSubmit}
        submitError={errorKey ? t(errorKey) : null}
      />
    </DashboardPageFrame>
  );
}
