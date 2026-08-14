import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ARK_HOST_GAME_STATUS_CODE } from '@/schemas/arkhost';
import type {
  ArkHostCharacters,
  ArkHostGameDetail,
  ArkHostGameListEntry,
  ArkHostGameLogs,
  ArkHostGachaEvent,
} from '@/schemas/arkhost';
import type { GameAccount } from '@/schemas/game-account';
import { useAppStore } from '@/store';
import { FailureError } from '@/utils/failure-error';
import { getQueryDependencies } from '@/services/query-dependencies';
import type { ArkHostResult, ArkHostSseSubscription } from './api';

const EMPTY_CHARACTERS: ArkHostCharacters = { chars: [], total: 0 };
const EMPTY_GAME_LOGS: ArkHostGameLogs = { hasMore: false, logs: [] };

export const arkHostQueryKeys = {
  characters: (account: string) => ['arkhost', 'characters', account] as const,
  detail: (account: string) => ['arkhost', 'detail', account] as const,
  gameAccounts: (userId: string) => ['arkhost', 'game-accounts', userId] as const,
  gacha: ['arkhost', 'gacha'] as const,
  logs: (account: string) => ['arkhost', 'logs', account] as const,
};

function unwrap<T>(result: ArkHostResult<T>): T {
  if (!result.ok) throw new FailureError(result.error);
  return result.data;
}

function mapGameAccount(entry: ArkHostGameListEntry): GameAccount {
  const color = entry.status.code === ARK_HOST_GAME_STATUS_CODE.gameError
    || entry.status.code === ARK_HOST_GAME_STATUS_CODE.loginFailed
    ? 'warning'
    : entry.status.code === ARK_HOST_GAME_STATUS_CODE.running
      ? 'primary'
      : 'muted';
  return {
    account: entry.status.account,
    ap: entry.status.ap,
    avatar: entry.status.avatar,
    captchaInfo: entry.captcha_info,
    color,
    config: entry.game_config,
    createdAt: entry.status.created_at,
    isVerified: entry.status.is_verify,
    level: entry.status.level,
    nickname: entry.status.nick_name,
    platform: entry.status.platform,
    statusCode: entry.status.code,
    statusText: entry.status.text,
    userId: entry.status.uuid,
  };
}

export function useGameAccountsQuery() {
  const session = useAppStore((state) => state.auth.session);
  const userId = session?.principal.id ?? '';
  return useQuery<GameAccount[]>({
    queryKey: arkHostQueryKeys.gameAccounts(userId),
    enabled: session !== null,
    queryFn: async () => {
      const { arkHostApi } = getQueryDependencies();
      return unwrap(await arkHostApi.fetchGameList()).map(mapGameAccount);
    },
  });
}

export function useGameDetailQuery(account: string | null) {
  const { arkHostApi } = getQueryDependencies();
  return useQuery<ArkHostGameDetail | null>({
    queryKey: arkHostQueryKeys.detail(account ?? ''),
    enabled: account !== null,
    queryFn: async () => {
      if (!account) return null;
      return unwrap(await arkHostApi.fetchGameDetail(account));
    },
  });
}

export function useCharactersQuery(account: string | null) {
  const { arkHostApi } = getQueryDependencies();
  return useQuery<ArkHostCharacters>({
    queryKey: arkHostQueryKeys.characters(account ?? ''),
    enabled: account !== null,
    queryFn: async () => {
      if (!account) return EMPTY_CHARACTERS;
      return unwrap(await arkHostApi.fetchCharacters(account));
    },
  });
}

export function useGameLogsQuery(account: string | null) {
  const { arkHostApi } = getQueryDependencies();
  return useQuery<ArkHostGameLogs>({
    queryKey: arkHostQueryKeys.logs(account ?? ''),
    enabled: account !== null,
    queryFn: async () => {
      if (!account) return EMPTY_GAME_LOGS;
      return unwrap(await arkHostApi.fetchGameLogs(account, 0));
    },
  });
}

export function useSelectedGameAccount(): GameAccount | null {
  const selectedGameAccountId = useAppStore((state) => state.selectedGameAccountId);
  const gameAccountsQuery = useGameAccountsQuery();
  if (selectedGameAccountId === null) return null;
  const gameAccounts = gameAccountsQuery.data ?? [];
  return gameAccounts.find((account) => account.account === selectedGameAccountId)
    ?? null;
}

export function useSelectedGameDetail(): ArkHostGameDetail | null {
  const account = useSelectedGameAccount();
  const detailQuery = useGameDetailQuery(account?.account ?? null);
  return detailQuery.data ?? null;
}

export function useSelectedCharacters(): ArkHostCharacters {
  const account = useSelectedGameAccount();
  const charactersQuery = useCharactersQuery(account?.account ?? null);
  return charactersQuery.data ?? EMPTY_CHARACTERS;
}

export function useSelectedLogs(): ArkHostGameLogs {
  const account = useSelectedGameAccount();
  const logsQuery = useGameLogsQuery(account?.account ?? null);
  return logsQuery.data ?? EMPTY_GAME_LOGS;
}

export function useDeleteGameAccount() {
  const session = useAppStore((state) => state.auth.session);
  const queryClient = useQueryClient();
  const userId = session?.principal.id ?? '';
  return useMutation({
    mutationFn: async (accountId: string) => {
      const { arkHostApi } = getQueryDependencies();
      const result = await arkHostApi.deleteGame(accountId);
      if (!result.ok || result.data !== true) {
        throw new FailureError({ code: 'operation-rejected', kind: 'business' });
      }
      return true;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: arkHostQueryKeys.gameAccounts(userId),
        exact: true,
      });
    },
  });
}

export function useArkHostSync() {
  const session = useAppStore((state) => state.auth.session);
  const queryClient = useQueryClient();
  useGameAccountsQuery();
  useEffect(() => {
    if (!session) return;
    const userId = session.principal.id;
    const { arkHostApi } = getQueryDependencies();
    const subscription: ArkHostSseSubscription = arkHostApi.subscribe(
      session.accessToken,
      (event) => {
        if (event.type === 'game') {
          queryClient.setQueryData<GameAccount[]>(
            arkHostQueryKeys.gameAccounts(userId),
            event.data.map(mapGameAccount),
          );
        } else if (event.type === 'log') {
          queryClient.setQueryData<ArkHostGameLogs>(
            arkHostQueryKeys.logs(event.data.name),
            (previous) => {
              const page = previous ?? { hasMore: true, logs: [] };
              const exists = page.logs.some((log) => log.id === event.data.id);
              return exists
                ? page
                : { ...page, logs: [event.data, ...page.logs] };
            },
          );
        } else {
          queryClient.setQueryData<ArkHostGachaEvent[]>(
            arkHostQueryKeys.gacha,
            event.data,
          );
        }
      },
    );
    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, session]);
}
