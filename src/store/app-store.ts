import * as v from 'valibot';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { MockAuthAdapter } from '@/features/auth/api';
import type { AuthAdapter, AuthFailure } from '@/features/auth/api';
import { MockArkHostApi, RemoteGameResourcesApi } from '@/features/dashboard/api';
import type {
  ArkHostApi,
  ArkHostFailure,
  ArkHostSseSubscription,
  GameResourcesApi,
} from '@/features/dashboard/api';
import {
  bundledCharacterTable,
  bundledGameResources,
  bundledItemTable,
  bundledStageTable,
} from '@/features/dashboard/game-data';
import { mmkvStateStorage } from '@/lib/mmkv';
import { loginSubmissionSchema } from '@/schemas/auth';
import type { LoginSubmission } from '@/schemas/auth';
import { ARK_HOST_GAME_STATUS_CODE } from '@/schemas/arkhost';
import type { ArkHostCharacters, ArkHostGameDetail, ArkHostGameListEntry, ArkHostGameLogs } from '@/schemas/arkhost';
import type { GameAccount } from '@/schemas/game-account';
import { persistedStoreStateSchema } from '@/schemas/local-state';
import type { CharacterTable, GameResourcesState, ItemTable, StageTable } from '@/schemas/game-data';
import type { GamesState, PersistedAppState, PersistedStoreState } from '@/schemas/local-state';
import { createAppPersistStorage } from './app-storage';
import type { SyncStateStorage } from './app-storage';

type OperationStatus = 'failed' | 'idle' | 'pending' | 'succeeded';
type LoginStatus = OperationStatus;

type AuthStoreState = PersistedAppState['auth'] & {
  loginError: AuthFailure | null;
  loginStatus: LoginStatus;
  rememberSession: boolean;
};

type GamesStoreState = {
  data: GamesState;
  detailStatusByAccount: Record<string, OperationStatus>;
  error: ArkHostFailure | null;
  loadStatus: OperationStatus;
  logsStatusByAccount: Record<string, OperationStatus>;
  sseStatus: 'closed' | 'connected';
};

type AppStoreState = {
  auth: AuthStoreState;
  gameResources: GameResourcesState;
  games: GamesStoreState;
};

const unauthenticatedAuthState: AuthStoreState = {
  loginError: null,
  loginStatus: 'idle',
  rememberSession: false,
  session: null,
};

const emptyGamesStoreState: GamesStoreState = {
  data: null,
  detailStatusByAccount: {},
  error: null,
  loadStatus: 'idle',
  logsStatusByAccount: {},
  sseStatus: 'closed',
};

const emptyGameResourcesState: GameResourcesState = {
  character: null,
  checkedAt: null,
  item: null,
  stage: null,
};

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const GAME_RESOURCES_CHECK_INTERVAL_MS = HOURS_PER_DAY
  * MINUTES_PER_HOUR
  * SECONDS_PER_MINUTE
  * MILLISECONDS_PER_SECOND;

type AppStoreActions = {
  initializeGameResources: () => Promise<void>;
  initializeGames: () => Promise<void>;
  loadGameDetail: (account: string) => Promise<void>;
  loadGameLogs: (account: string) => Promise<void>;
  login: (submission: LoginSubmission) => Promise<void>;
  logout: () => void;
  selectGameAccount: (gameAccountId: string) => void;
  updateGameResources: () => Promise<void>;
};

export type AppStore = AppStoreState & AppStoreActions;

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

function persistedAppStateFromStore(state: AppStore): PersistedAppState {
  if (!state.auth.rememberSession || !state.auth.session) {
    return { auth: { session: null }, games: null };
  }
  return { auth: { session: state.auth.session }, games: state.games.data };
}

function persistedStateFromStore(state: AppStore): PersistedStoreState {
  return {
    app: persistedAppStateFromStore(state),
    gameResources: state.gameResources,
  };
}

function parsePersistedState(persistedState: unknown): PersistedStoreState | null {
  const result = v.safeParse(persistedStoreStateSchema, persistedState);
  return result.success ? result.output : null;
}

function isNewer(updatedAt: string, currentUpdatedAt: string) {
  return Date.parse(updatedAt) > Date.parse(currentUpdatedAt);
}

function restoredGameResources(resources: GameResourcesState): GameResourcesState {
  return {
    character: resources.character
      && isNewer(resources.character.updatedAt, bundledGameResources.character.updatedAt)
      ? resources.character
      : null,
    checkedAt: resources.checkedAt,
    item: resources.item
      && isNewer(resources.item.updatedAt, bundledGameResources.item.updatedAt)
      ? resources.item
      : null,
    stage: resources.stage
      && isNewer(resources.stage.updatedAt, bundledGameResources.stage.updatedAt)
      ? resources.stage
      : null,
  };
}

export function createAppStore(
  storage: SyncStateStorage = mmkvStateStorage,
  authAdapter: AuthAdapter = new MockAuthAdapter(),
  arkHostApi: ArkHostApi = new MockArkHostApi(),
  gameResourcesApi: GameResourcesApi = new RemoteGameResourcesApi(),
) {
  let gameResourcesRequest: Promise<void> | null = null;
  let sseSubscription: ArkHostSseSubscription | null = null;

  const persistStorage = createAppPersistStorage(storage);

  return createStore<AppStore>()(
    persist(
      immer((set, get) => {
        const closeSse = () => {
          sseSubscription?.unsubscribe();
          sseSubscription = null;
        };

        const connectSse = () => {
          const session = get().auth.session;
          if (!session || sseSubscription) return;
          sseSubscription = arkHostApi.subscribe(session.accessToken, (event) => {
            if (event.type === 'close') {
              closeSse();
              set((state) => { state.games.sseStatus = 'closed'; });
              return;
            }
            set((state) => {
              const snapshot = state.games.data;
              if (!snapshot) return;
              if (event.type === 'game') {
                snapshot.gameAccounts = event.data.map(mapGameAccount);
                if (!snapshot.gameAccounts.some((account) => account.account === snapshot.activeGameAccountId)) {
                  snapshot.activeGameAccountId = snapshot.gameAccounts[0]?.account ?? null;
                }
              } else if (event.type === 'log') {
                const page = snapshot.logsByAccount[event.data.name] ?? { hasMore: true, logs: [] };
                if (!page.logs.some((log) => log.id === event.data.id)) page.logs.unshift(event.data);
                snapshot.logsByAccount[event.data.name] = page;
              } else {
                snapshot.gachaEvents = event.data;
              }
            });
          });
          set((state) => { state.games.sseStatus = 'connected'; });
        };

        const loadAccountData = async (account: string) => {
          set((state) => { state.games.detailStatusByAccount[account] = 'pending'; });
          const [detailResult, charactersResult] = await Promise.all([
            arkHostApi.fetchGameDetail(account),
            arkHostApi.fetchCharacters(account),
          ]);
          if (!detailResult.ok || !charactersResult.ok) {
            set((state) => {
              state.games.detailStatusByAccount[account] = 'failed';
              state.games.error = !detailResult.ok ? detailResult.error : charactersResult.ok ? null : charactersResult.error;
            });
            return;
          }
          set((state) => {
            if (!state.games.data) return;
            if (detailResult.data) state.games.data.detailsByAccount[account] = detailResult.data;
            state.games.data.charactersByAccount[account] = charactersResult.data;
            state.games.detailStatusByAccount[account] = 'succeeded';
          });
        };

        return {
          auth: unauthenticatedAuthState,
          gameResources: emptyGameResourcesState,
          games: emptyGamesStoreState,
          initializeGameResources: async () => {
            const checkedAt = get().gameResources.checkedAt;
            if (checkedAt !== null && Date.now() - checkedAt < GAME_RESOURCES_CHECK_INTERVAL_MS) return;
            await get().updateGameResources();
          },
          initializeGames: async () => {
            const session = get().auth.session;
            if (!session || get().games.loadStatus === 'pending') return;
            const snapshot = get().games.data;
            if (snapshot?.ownerUserId === session.principal.id) {
              set((state) => { state.games.loadStatus = 'succeeded'; });
              connectSse();
              return;
            }
            set((state) => {
              state.games = { ...emptyGamesStoreState, loadStatus: 'pending' };
            });
            const [configResult, listResult, rankingResult] = await Promise.all([
              arkHostApi.fetchSystemConfig(),
              arkHostApi.fetchGameList(),
              arkHostApi.fetchApCostRanking(),
            ]);
            const failedResult = [configResult, listResult, rankingResult].find((result) => !result.ok);
            if (failedResult && !failedResult.ok) {
              set((state) => {
                state.games.error = failedResult.error;
                state.games.loadStatus = 'failed';
              });
              return;
            }
            if (!configResult.ok || !listResult.ok || !rankingResult.ok) return;
            const gameAccounts = listResult.data.map(mapGameAccount);
            const activeGameAccountId = gameAccounts[0]?.account ?? null;
            set((state) => {
              state.games.data = {
                activeGameAccountId,
                apCostRanking: rankingResult.data,
                charactersByAccount: {},
                detailsByAccount: {},
                gameAccounts,
                gachaEvents: [],
                logsByAccount: {},
                ownerUserId: session.principal.id,
                systemConfig: configResult.data,
              };
              state.games.error = null;
              state.games.loadStatus = 'succeeded';
            });
            if (activeGameAccountId) await loadAccountData(activeGameAccountId);
            connectSse();
          },
          loadGameDetail: loadAccountData,
          loadGameLogs: async (account) => {
            if (get().games.logsStatusByAccount[account] === 'pending') return;
            set((state) => { state.games.logsStatusByAccount[account] = 'pending'; });
            const existing = get().games.data?.logsByAccount[account];
            const afterId = existing?.logs.at(-1)?.id ?? 0;
            const result = await arkHostApi.fetchGameLogs(account, afterId);
            set((state) => {
              if (!result.ok) {
                state.games.error = result.error;
                state.games.logsStatusByAccount[account] = 'failed';
                return;
              }
              const snapshot = state.games.data;
              if (!snapshot) return;
              const previous = snapshot.logsByAccount[account]?.logs ?? [];
              const existingIds = new Set(previous.map((entry) => entry.id));
              snapshot.logsByAccount[account] = {
                hasMore: result.data.hasMore,
                logs: [...previous, ...result.data.logs.filter((entry) => !existingIds.has(entry.id))],
              };
              state.games.logsStatusByAccount[account] = 'succeeded';
            });
          },
          login: async (submission) => {
            if (get().auth.loginStatus === 'pending') return;
            const parsedSubmission = v.safeParse(loginSubmissionSchema, submission);
            if (!parsedSubmission.success) {
              set((state) => {
                state.auth.loginError = { code: 'invalid-input', kind: 'business' };
                state.auth.loginStatus = 'failed';
              });
              return;
            }
            set((state) => {
              state.auth.loginError = null;
              state.auth.loginStatus = 'pending';
            });
            try {
              const result = await authAdapter.login(parsedSubmission.output.credentials);
              if (!result.ok) {
                set((state) => {
                  state.auth.loginError = result.error;
                  state.auth.loginStatus = 'failed';
                  state.auth.rememberSession = false;
                  state.auth.session = null;
                  state.games = emptyGamesStoreState;
                });
                return;
              }
              const previousOwner = get().games.data?.ownerUserId;
              set((state) => {
                state.auth.loginError = null;
                state.auth.loginStatus = 'succeeded';
                state.auth.rememberSession = parsedSubmission.output.rememberSession;
                state.auth.session = result.data;
                if (previousOwner && previousOwner !== result.data.principal.id) state.games = emptyGamesStoreState;
              });
              await get().initializeGames();
            } catch (error: unknown) {
              set((state) => {
                state.auth.loginError = null;
                state.auth.loginStatus = 'failed';
              });
              throw error;
            }
          },
          logout: () => {
            closeSse();
            set((state) => {
              state.auth = unauthenticatedAuthState;
              state.games = emptyGamesStoreState;
            });
          },
          selectGameAccount: (gameAccountId) => {
            const snapshot = get().games.data;
            if (!snapshot?.gameAccounts.some((account) => account.account === gameAccountId)) return;
            set((state) => { if (state.games.data) state.games.data.activeGameAccountId = gameAccountId; });
            if (!snapshot.detailsByAccount[gameAccountId] && get().games.detailStatusByAccount[gameAccountId] !== 'pending') {
              loadAccountData(gameAccountId).catch((error: unknown) => {
                set((state) => {
                  state.games.detailStatusByAccount[gameAccountId] = 'failed';
                  state.games.error = {
                    code: 'server-error',
                    diagnosticMessage: error instanceof Error ? error.message : 'Unexpected ArkHost detail error.',
                    kind: 'transport',
                  };
                });
              });
            }
          },
          updateGameResources: () => {
            if (gameResourcesRequest) return gameResourcesRequest;
            const current = get().gameResources;
            const characterUpdatedAt = current.character?.updatedAt
              ?? bundledGameResources.character.updatedAt;
            const itemUpdatedAt = current.item?.updatedAt
              ?? bundledGameResources.item.updatedAt;
            const stageUpdatedAt = current.stage?.updatedAt
              ?? bundledGameResources.stage.updatedAt;
            const request = Promise.allSettled([
              gameResourcesApi.fetchCharacter(characterUpdatedAt),
              gameResourcesApi.fetchItem(itemUpdatedAt),
              gameResourcesApi.fetchStage(stageUpdatedAt),
            ]).then(([characterResult, itemResult, stageResult]) => {
              set((state) => {
                if (
                  characterResult.status === 'fulfilled'
                  && characterResult.value.kind === 'updated'
                  && isNewer(characterResult.value.updatedAt, characterUpdatedAt)
                ) {
                  state.gameResources.character = {
                    table: characterResult.value.table,
                    updatedAt: characterResult.value.updatedAt,
                  };
                }
                if (
                  itemResult.status === 'fulfilled'
                  && itemResult.value.kind === 'updated'
                  && isNewer(itemResult.value.updatedAt, itemUpdatedAt)
                ) {
                  state.gameResources.item = {
                    table: itemResult.value.table,
                    updatedAt: itemResult.value.updatedAt,
                  };
                }
                if (
                  stageResult.status === 'fulfilled'
                  && stageResult.value.kind === 'updated'
                  && isNewer(stageResult.value.updatedAt, stageUpdatedAt)
                ) {
                  state.gameResources.stage = {
                    table: stageResult.value.table,
                    updatedAt: stageResult.value.updatedAt,
                  };
                }
                state.gameResources.checkedAt = Date.now();
              });
            }).finally(() => {
              gameResourcesRequest = null;
            });
            gameResourcesRequest = request;
            return request;
          },
        };
      }),
      {
        merge: (persistedState, currentState) => {
          const storedState = parsePersistedState(persistedState);
          if (!storedState) {
            return currentState;
          }
          const games = storedState.app.auth.session
            && storedState.app.games?.ownerUserId === storedState.app.auth.session.principal.id
            ? storedState.app.games
            : null;
          return {
            ...currentState,
            auth: {
              ...currentState.auth,
              rememberSession: storedState.app.auth.session !== null,
              session: storedState.app.auth.session,
            },
            gameResources: restoredGameResources(storedState.gameResources),
            games: {
              ...currentState.games,
              data: games,
              loadStatus: games ? 'succeeded' : 'idle',
            },
          };
        },
        name: 'closure.store',
        partialize: persistedStateFromStore,
        storage: persistStorage,
      },
    ),
  );
}

const appStore = createAppStore();

export function useAppStore<T>(selector: (state: AppStore) => T): T {
  return useStore(appStore, selector);
}

export function selectActiveGameAccount(state: AppStore): GameAccount | null {
  const snapshot = state.games.data;
  if (!snapshot) return null;
  return snapshot.gameAccounts.find((account) => account.account === snapshot.activeGameAccountId)
    ?? snapshot.gameAccounts[0]
    ?? null;
}

export function selectActiveGameDetail(state: AppStore): ArkHostGameDetail | null {
  const account = selectActiveGameAccount(state);
  return account ? state.games.data?.detailsByAccount[account.account] ?? null : null;
}

export function selectActiveCharacters(state: AppStore): ArkHostCharacters {
  const account = selectActiveGameAccount(state);
  return account ? state.games.data?.charactersByAccount[account.account] ?? { chars: [], total: 0 } : { chars: [], total: 0 };
}

export function selectActiveLogs(state: AppStore): ArkHostGameLogs {
  const account = selectActiveGameAccount(state);
  return account ? state.games.data?.logsByAccount[account.account] ?? { hasMore: false, logs: [] } : { hasMore: false, logs: [] };
}

export function selectCharacterTable(state: AppStore): CharacterTable {
  return state.gameResources.character?.table ?? bundledCharacterTable;
}

export function selectCharacterUpdatedAt(state: AppStore): string {
  return state.gameResources.character?.updatedAt ?? bundledGameResources.character.updatedAt;
}

export function selectItemTable(state: AppStore): ItemTable {
  return state.gameResources.item?.table ?? bundledItemTable;
}

export function selectItemUpdatedAt(state: AppStore): string {
  return state.gameResources.item?.updatedAt ?? bundledGameResources.item.updatedAt;
}

export function selectStageTable(state: AppStore): StageTable {
  return state.gameResources.stage?.table ?? bundledStageTable;
}

export function selectStageUpdatedAt(state: AppStore): string {
  return state.gameResources.stage?.updatedAt ?? bundledGameResources.stage.updatedAt;
}
