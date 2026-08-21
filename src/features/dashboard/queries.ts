import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import * as v from 'valibot';

import {
  ARK_HOST_GAME_STATUS_CODE,
  arkHostCharactersSchema,
  arkHostGameDetailSchema,
  arkHostGameConfigPatchSchema,
  arkHostGameListEntrySchema,
  arkHostGameLogsSchema,
  arkHostSseEventSchema,
} from '@/schemas/arkhost';
import type {
  ArkHostGameConfig,
  ArkHostGameConfigPatch,
  ArkHostGameDetail,
  ArkHostGameListEntry,
  ArkHostGameLogs,
} from '@/schemas/arkhost';
import type { GameAccount } from '@/schemas/game-account';
import { appStore, useAppStore } from '@/store';
import { FailureError, unwrapResult } from '@/utils/failure-error';
import { getQueryDependencies } from '@/services/query-dependencies';
import type { ArkHostFailure, ArkHostSseSubscription } from './api';

export const arkHostQueryKeys = {
  characters: (account: string) => ['arkhost', 'characters', account] as const,
  detail: (account: string) => ['arkhost', 'detail', account] as const,
  gameAccounts: (userId: string) => ['arkhost', 'game-accounts', userId] as const,
  logs: (account: string) => ['arkhost', 'logs', account] as const,
};

/**
 * Validates ArkHost server payloads once at the Query cache ingress. A
 * malformed payload surfaces as an invalid-response query error instead of
 * poisoning the cache.
 */
function parseArkHostPayload<T>(schema: v.GenericSchema<unknown, T>, payload: unknown): T {
  const parsed = v.safeParse(schema, payload);
  if (!parsed.success) {
    throw new FailureError({ code: 'invalid-response', kind: 'invalid-response' });
  }
  return parsed.output;
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
      const result = await arkHostApi.fetchGameList();
      const entries = parseArkHostPayload(
        v.array(arkHostGameListEntrySchema),
        unwrapResult(result),
      );
      return entries.map(mapGameAccount);
    },
  });
}

export const gameDetailQueryOptions = (account: string) =>
  queryOptions({
    queryKey: arkHostQueryKeys.detail(account),
    queryFn: async () => {
      const { arkHostApi } = getQueryDependencies();
      const result = await arkHostApi.fetchGameDetail(account);
      return parseArkHostPayload(
        v.nullable(arkHostGameDetailSchema),
        unwrapResult(result),
      );
    },
  });

export function useGameDetailQuery(account: string | null) {
  return useQuery({
    ...gameDetailQueryOptions(account ?? ''),
    enabled: account !== null,
  });
}

export const charactersQueryOptions = (account: string) =>
  queryOptions({
    queryKey: arkHostQueryKeys.characters(account),
    queryFn: async () => {
      const { arkHostApi } = getQueryDependencies();
      const result = await arkHostApi.fetchCharacters(account);
      return parseArkHostPayload(arkHostCharactersSchema, unwrapResult(result));
    },
  });

export function useCharactersQuery(account: string | null) {
  return useQuery({
    ...charactersQueryOptions(account ?? ''),
    enabled: account !== null,
  });
}

export const logsQueryOptions = (account: string) =>
  queryOptions({
    queryKey: arkHostQueryKeys.logs(account),
    queryFn: async () => {
      const { arkHostApi } = getQueryDependencies();
      const result = await arkHostApi.fetchGameLogs(account, 0);
      return parseArkHostPayload(arkHostGameLogsSchema, unwrapResult(result));
    },
  });

export function useGameLogsQuery(account: string | null) {
  return useQuery({
    ...logsQueryOptions(account ?? ''),
    enabled: account !== null,
  });
}

export type UpdateGameConfigInput = {
  account: string;
  patch: ArkHostGameConfigPatch;
};

function mergeGameConfig(
  config: ArkHostGameConfig,
  patch: ArkHostGameConfigPatch,
): ArkHostGameConfig {
  return Object.assign({ ...config }, patch);
}

function updateGameConfigCache(
  queryClient: ReturnType<typeof useQueryClient>,
  { account, patch }: UpdateGameConfigInput,
) {
  const userId = appStore.getState().auth.session?.principal.id;
  if (userId) {
    queryClient.setQueryData<GameAccount[]>(
      arkHostQueryKeys.gameAccounts(userId),
      (previous) => previous?.map((gameAccount) => (
        gameAccount.account === account
          ? { ...gameAccount, config: mergeGameConfig(gameAccount.config, patch) }
          : gameAccount
      )),
    );
  }

  queryClient.setQueryData<ArkHostGameDetail | null>(
    arkHostQueryKeys.detail(account),
    (previous) => previous
      ? { ...previous, config: mergeGameConfig(previous.config, patch) }
      : previous,
  );
}

export function useUpdateGameConfig() {
  const queryClient = useQueryClient();
  return useMutation<ArkHostGameConfigPatch, ArkHostFailure, UpdateGameConfigInput>({
    mutationFn: async ({ account, patch }) => {
      const parsedPatch = v.safeParse(arkHostGameConfigPatchSchema, patch);
      if (!parsedPatch.success) {
        throw new FailureError({
          code: 'operation-rejected',
          diagnosticMessage: 'Invalid game config patch.',
          kind: 'business',
        });
      }
      const { arkHostApi } = getQueryDependencies();
      unwrapResult(
        await arkHostApi.updateGameConfig(account, parsedPatch.output),
      );
      return parsedPatch.output;
    },
    onSuccess: (parsedPatch, { account }) => {
      updateGameConfigCache(queryClient, { account, patch: parsedPatch });
    },
  });
}

export function selectGameAccountById(
  accounts: readonly GameAccount[] | undefined,
  accountId: string | null,
): GameAccount | null {
  if (accountId === null) return null;
  return accounts?.find((account) => account.account === accountId) ?? null;
}

/**
 * Single React composition entry for the selected Game Account object.
 * Derives the object from the Query list and the Store selection; never
 * stores a second copy of server data.
 */
export function useSelectedGameAccount(): GameAccount | null {
  const selectedGameAccountId = useAppStore((state) => state.selectedGameAccountId);
  const gameAccounts = useGameAccountsQuery().data;
  return selectGameAccountById(gameAccounts, selectedGameAccountId);
}

/**
 * Selected server resource hooks read the current account ID directly from
 * the Store and return the full Query result. They intentionally do not go
 * through `useSelectedGameAccount`, so querying detail/characters/logs does
 * not subscribe to the Game Account list.
 */
export function useSelectedGameDetailQuery() {
  const accountId = useAppStore((state) => state.selectedGameAccountId);
  return useGameDetailQuery(accountId);
}

export function useSelectedCharactersQuery() {
  const accountId = useAppStore((state) => state.selectedGameAccountId);
  return useCharactersQuery(accountId);
}

export function useSelectedGameLogsQuery() {
  const accountId = useAppStore((state) => state.selectedGameAccountId);
  return useGameLogsQuery(accountId);
}

/**
 * Prefetches detail/characters/logs for the accounts adjacent to the active
 * selection so a swipe or tap to a neighbor renders from cache. Intentionally
 * limited to the previous and next account only.
 */
export function useAdjacentGameAccountPrefetch(
  gameAccounts: readonly GameAccount[] | undefined,
  selectedGameAccountId: string | null,
) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!gameAccounts || gameAccounts.length < 2 || selectedGameAccountId === null) return;
    const activeIndex = gameAccounts.findIndex(
      (account) => account.account === selectedGameAccountId,
    );
    if (activeIndex < 0) return;
    const adjacentAccounts = [
      gameAccounts[activeIndex - 1],
      gameAccounts[activeIndex + 1],
    ].filter((account): account is GameAccount => account !== undefined);
    for (const account of adjacentAccounts) {
      void queryClient.prefetchQuery(gameDetailQueryOptions(account.account));
      void queryClient.prefetchQuery(charactersQueryOptions(account.account));
      void queryClient.prefetchQuery(logsQueryOptions(account.account));
    }
  }, [gameAccounts, queryClient, selectedGameAccountId]);
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
        const parsedEvent = v.safeParse(arkHostSseEventSchema, event);
        if (!parsedEvent.success) return;
        const validated = parsedEvent.output;
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
  }, [queryClient, session]);
}

/**
 * Clears the Query cache whenever the session principal identity changes or
 * the session ends, so no server data survives across users. This is bound to
 * the session transition itself (including direct `logout()` and `setSession`
 * with a different principal), not to any UI handler.
 */
export function useSessionQueryCacheReset() {
  const session = useAppStore((state) => state.auth.session);
  const queryClient = useQueryClient();
  const previousPrincipalId = useRef<string | null>(null);

  useEffect(() => {
    const principalId = session?.principal.id ?? null;
    if (previousPrincipalId.current === principalId) return;
    previousPrincipalId.current = principalId;
    queryClient.clear();
  }, [queryClient, session]);
}
