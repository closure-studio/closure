import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import * as v from 'valibot';

import {
  ARK_HOST_GAME_STATUS_CODE,
  gameCaptchaUpdateSchema,
} from '@/schemas/arkhost';
import type {
  ArkHostGameConfigPatch,
  ArkHostGameListEntry,
  ArkHostGameLogs,
  GameCaptchaUpdate,
} from '@/schemas/arkhost';
import type { GameAccount } from '@/schemas/game-account';
import { appStore, useAppStore } from '@/store';
import { unwrapResult } from '@/utils/failure-error';
import { arkHostApi, type ArkHostFailure, type ArkHostSseSubscription } from './api';
import { assertActive, inRequestScope, requestScope } from '@/services/request-scope';

function endpointKey() {
  return [appStore.getState().selectedApiNodeId] as const;
}

export const arkHostQueryKeys = {
  all: ['arkhost'] as const,
  detail: (account: string) => ['arkhost', ...endpointKey(), 'detail', account] as const,
  gameAccounts: (userId: string) => ['arkhost', ...endpointKey(), 'game-accounts', userId] as const,
  logs: (account: string) => ['arkhost', ...endpointKey(), 'logs', account] as const,
};

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
    createdAt: entry.status.created_at,
    isVerified: entry.status.is_verify,
    level: entry.status.level,
    nickname: entry.status.nick_name,
    platform: entry.status.platform,
    statusCode: entry.status.code,
    userId: entry.status.uuid,
  };
}

export function useGameAccountsQuery() {
  const scope = requestScope();
  useAppStore((state) => state.selectedApiNodeId);
  const session = useAppStore((state) => state.auth.session);
  const userId = session?.principal.id ?? '';
  return useQuery<GameAccount[]>({
    queryKey: arkHostQueryKeys.gameAccounts(userId),
    enabled: session !== null,
    queryFn: ({ signal }) => inRequestScope(async () => {
      const result = await arkHostApi.fetchGameList(signal);
      const entries = unwrapResult(result);
      return entries.map(mapGameAccount);
    }, scope),
  });
}

export const gameDetailQueryOptions = (account: string) => {
  const scope = requestScope();
  return queryOptions({
    queryKey: arkHostQueryKeys.detail(account),
    queryFn: ({ signal }) => inRequestScope(async () => {
      const result = await arkHostApi.fetchGameDetail(account, signal);
      return unwrapResult(result);
    }, scope),
  });
};

export function useGameDetailQuery(account: string | null) {
  useAppStore((state) => state.selectedApiNodeId);
  return useQuery({
    ...gameDetailQueryOptions(account ?? ''),
    enabled: account !== null,
  });
}

export const logsQueryOptions = (account: string) => {
  const scope = requestScope();
  return queryOptions({
    queryKey: arkHostQueryKeys.logs(account),
    queryFn: ({ signal }) => inRequestScope(async () => {
      const result = await arkHostApi.fetchGameLogs(account, 0, signal);
      return unwrapResult(result);
    }, scope),
  });
};

export function useGameLogsQuery(account: string | null) {
  useAppStore((state) => state.selectedApiNodeId);
  return useQuery({
    ...logsQueryOptions(account ?? ''),
    enabled: account !== null,
  });
}

type UpdateGameConfigInput = {
  account: string;
  patch: ArkHostGameConfigPatch;
};

async function invalidateGameAccountsQuery(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string | undefined,
): Promise<void> {
  if (!userId) return;
  await queryClient.invalidateQueries({
    queryKey: arkHostQueryKeys.gameAccounts(userId),
  });
}

export function useUpdateGameConfig() {
  const scope = requestScope();
  const queryClient = useQueryClient();
  return useMutation<ArkHostGameConfigPatch, ArkHostFailure, UpdateGameConfigInput, AbortSignal>({
    onMutate: () => scope,
    mutationFn: async ({ account, patch }) => {
      assertActive(scope);
      unwrapResult(
        await arkHostApi.updateGameConfig(account, patch, scope),
      );
      return patch;
    },
    onSuccess: async (_, { account }, scope) => {
      if (!scope || scope.aborted) return;
      await queryClient.invalidateQueries({
        queryKey: arkHostQueryKeys.detail(account),
      });
    },
  });
}

export function useLoginGame() {
  const scope = requestScope();
  const queryClient = useQueryClient();
  const userId = useAppStore((state) => state.auth.session?.principal.id);
  return useMutation<void, ArkHostFailure, string, AbortSignal>({
    onMutate: () => scope,
    mutationFn: async (account) => {
      assertActive(scope);
      unwrapResult(await arkHostApi.loginGame(account, scope));
    },
    onSuccess: (_, _account, scope) => scope && !scope.aborted ? invalidateGameAccountsQuery(queryClient, userId) : undefined,
  });
}

export function usePauseGame() {
  const scope = requestScope();
  const queryClient = useQueryClient();
  const userId = useAppStore((state) => state.auth.session?.principal.id);
  return useMutation<void, ArkHostFailure, string, AbortSignal>({
    onMutate: () => scope,
    mutationFn: async (account) => {
      assertActive(scope);
      unwrapResult(await arkHostApi.pauseGame(account, scope));
    },
    onSuccess: (_, _account, scope) => scope && !scope.aborted ? invalidateGameAccountsQuery(queryClient, userId) : undefined,
  });
}

export function useDeleteGame() {
  const scope = requestScope();
  const queryClient = useQueryClient();
  const userId = useAppStore((state) => state.auth.session?.principal.id);
  return useMutation<void, ArkHostFailure, string, AbortSignal>({
    onMutate: () => scope,
    mutationFn: async (account: string) => {
      assertActive(scope);
      unwrapResult(await arkHostApi.deleteGame(account, scope));
    },
    onSuccess: async (_, account, scope) => {
      if (!scope || scope.aborted) return;
      queryClient.removeQueries({ queryKey: arkHostQueryKeys.detail(account) });
      queryClient.removeQueries({ queryKey: arkHostQueryKeys.logs(account) });
      await invalidateGameAccountsQuery(queryClient, userId);
    },
  });
}

/**
 * Prefetches detail and logs for the accounts next to the active selection so
 * a swipe or tap to a neighbor can render from cache.
 */
export function useAdjacentGameAccountPrefetch(
  gameAccounts: readonly GameAccount[] | undefined,
  gameAccountId: string | null,
) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!gameAccounts || gameAccounts.length < 2 || gameAccountId === null) return;
    const activeIndex = gameAccounts.findIndex(
      (account) => account.account === gameAccountId,
    );
    if (activeIndex < 0) return;

    const adjacentAccounts = [
      gameAccounts[activeIndex - 1],
      gameAccounts[activeIndex + 1],
    ].filter((account): account is GameAccount => account !== undefined);

    for (const account of adjacentAccounts) {
      void queryClient.prefetchQuery(gameDetailQueryOptions(account.account));
      void queryClient.prefetchQuery(logsQueryOptions(account.account));
    }
  }, [gameAccounts, gameAccountId, queryClient]);
}

export function useSubmitGameCaptcha() {
  const scope = requestScope();
  return useMutation<void, ArkHostFailure, GameCaptchaUpdate>({
    mutationFn: async (input) => {
      assertActive(scope);
      const parsed = v.parse(gameCaptchaUpdateSchema, input);
      unwrapResult(await arkHostApi.submitGameCaptcha(parsed.account, parsed.captcha, scope));
    },
  });
}

export function useArkHostSync() {
  const node = useAppStore((state) => state.selectedApiNodeId);
  const session = useAppStore((state) => state.auth.session);
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!session) return;
    const userId = session.principal.id;
    const subscription: ArkHostSseSubscription = arkHostApi.subscribe(
      session.accessToken,
      (event) => {
        const validated = event;
        if (validated.type === 'game') {
          queryClient.setQueryData<GameAccount[]>(
            arkHostQueryKeys.gameAccounts(userId),
            validated.data.map(mapGameAccount),
          );
        } else if (validated.type === 'log') {
          queryClient.setQueryData<ArkHostGameLogs>(
            arkHostQueryKeys.logs(validated.data.name),
            (previous) => {
              const page = previous ?? { hasMore: true, logs: [] };
              const exists = page.logs.some((log) => log.id === validated.data.id);
              return exists
                ? page
                : { ...page, logs: [validated.data, ...page.logs] };
            },
          );
        }
      },
    );
    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, session, node]);
}

/**
 * Removes user-owned ArkHost queries whenever the session or selected node
 * changes. Public resource and node-probe queries keep their own lifecycles.
 */
export function useSessionQueryCacheReset() {
  const queryClient = useQueryClient();
  useEffect(() => appStore.subscribe((state, previous) => {
    if (state.auth.session !== previous.auth.session
      || state.selectedApiNodeId !== previous.selectedApiNodeId) {
      queryClient.removeQueries({ queryKey: arkHostQueryKeys.all });
    }
  }), [queryClient]);
}
