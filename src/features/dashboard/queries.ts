import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ARK_HOST_GAME_STATUS_CODE } from '@/schemas/arkhost';
import type {
  ArkHostApCostEntry,
  ArkHostCharacters,
  ArkHostGameDetail,
  ArkHostGameListEntry,
  ArkHostGameLogs,
  ArkHostGachaEvent,
  ArkHostSystemConfig,
} from '@/schemas/arkhost';
import type { GameAccount } from '@/schemas/game-account';
import { appStore, useAppStore } from '@/store';
import { FailureError } from '@/utils/failure-error';
import { getQueryDependencies } from '@/services/query-dependencies';
import type { ArkHostResult, ArkHostSseSubscription } from './api';

const EMPTY_CHARACTERS: ArkHostCharacters = { chars: [], total: 0 };
const EMPTY_GAME_LOGS: ArkHostGameLogs = { hasMore: false, logs: [] };

export type GamesSnapshot = {
  apCostRanking: ArkHostApCostEntry[];
  gameAccounts: GameAccount[];
  systemConfig: ArkHostSystemConfig;
};

export const arkHostQueryKeys = {
  characters: (account: string) => ['arkhost', 'characters', account] as const,
  detail: (account: string) => ['arkhost', 'detail', account] as const,
  gacha: ['arkhost', 'gacha'] as const,
  games: (userId: string) => ['arkhost', 'games', userId] as const,
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

export function useGamesQuery() {
  const session = useAppStore((state) => state.auth.session);
  const userId = session?.principal.id ?? '';
  return useQuery<GamesSnapshot>({
    queryKey: arkHostQueryKeys.games(userId),
    enabled: session !== null,
    queryFn: async () => {
      const { arkHostApi } = getQueryDependencies();
      const systemConfig = unwrap(await arkHostApi.fetchSystemConfig());
      const gameAccounts = unwrap(await arkHostApi.fetchGameList()).map(mapGameAccount);
      const apCostRanking = unwrap(await arkHostApi.fetchApCostRanking());
      return { apCostRanking, gameAccounts, systemConfig };
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

export function useActiveGameAccount(): GameAccount | null {
  const activeGameAccountId = useAppStore((state) => state.activeGameAccountId);
  const gamesQuery = useGamesQuery();
  const gameAccounts = gamesQuery.data?.gameAccounts ?? [];
  return gameAccounts.find((account) => account.account === activeGameAccountId)
    ?? gameAccounts[0]
    ?? null;
}

export function useActiveGameDetail(): ArkHostGameDetail | null {
  const account = useActiveGameAccount();
  const detailQuery = useGameDetailQuery(account?.account ?? null);
  return detailQuery.data ?? null;
}

export function useActiveCharacters(): ArkHostCharacters {
  const account = useActiveGameAccount();
  const charactersQuery = useCharactersQuery(account?.account ?? null);
  return charactersQuery.data ?? EMPTY_CHARACTERS;
}

export function useActiveLogs(): ArkHostGameLogs {
  const account = useActiveGameAccount();
  const logsQuery = useGameLogsQuery(account?.account ?? null);
  return logsQuery.data ?? EMPTY_GAME_LOGS;
}

export function useArkHostStream() {
  const session = useAppStore((state) => state.auth.session);
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!session) return;
    let subscription: ArkHostSseSubscription | null = null;
    const { arkHostApi } = getQueryDependencies();
    subscription = arkHostApi.subscribe(session.accessToken, (event) => {
      if (event.type === 'close') {
        subscription?.unsubscribe();
        return;
      }
      const userId = session.principal.id;
      if (event.type === 'game') {
        queryClient.setQueryData<GamesSnapshot>(
          arkHostQueryKeys.games(userId),
          (previous) => {
            if (!previous) return previous;
            const gameAccounts = event.data.map(mapGameAccount);
            const activeGameAccountId = appStore.getState().activeGameAccountId;
            if (activeGameAccountId
              && !gameAccounts.some((account) => account.account === activeGameAccountId)
            ) {
              appStore.getState().selectGameAccount(gameAccounts[0]?.account ?? null);
            }
            return { ...previous, gameAccounts };
          },
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
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [queryClient, session]);
}
