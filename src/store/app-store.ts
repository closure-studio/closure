import * as v from 'valibot';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { MockAuthAdapter } from '@/features/auth/api';
import type { AuthAdapter, AuthFailure } from '@/features/auth/api';
import { createGameAccount, initialGameAccounts } from '@/features/dashboard/mocks/game-accounts';
import { mmkvStateStorage } from '@/lib/mmkv';
import { loginSubmissionSchema } from '@/schemas/auth';
import type { LoginSubmission } from '@/schemas/auth';
import type { GameAccount, LinkGameAccountCredentials } from '@/schemas/game-account';
import { persistedAppStateSchema } from '@/schemas/local-state';
import type { GamesState, PersistedAppState } from '@/schemas/local-state';

export const APP_STORE_STORAGE_KEY = 'closure.app-store';

type LoginStatus = 'failed' | 'idle' | 'pending' | 'succeeded';

type AuthStoreState = PersistedAppState['auth'] & {
  loginError: AuthFailure | null;
  loginStatus: LoginStatus;
  rememberSession: boolean;
};

type AppStoreState = Omit<PersistedAppState, 'auth'> & { auth: AuthStoreState };

const unauthenticatedAuthState: AuthStoreState = {
  loginError: null,
  loginStatus: 'idle',
  rememberSession: false,
  session: null,
};

const emptyGamesState: GamesState = {
  activeGameAccountId: null,
  gameAccounts: [],
};

type AppStoreActions = {
  linkGameAccount: (credentials: LinkGameAccountCredentials) => void;
  login: (submission: LoginSubmission) => Promise<void>;
  logout: () => void;
  selectGameAccount: (gameAccountId: string) => void;
};

export type AppStore = AppStoreState & AppStoreActions;

function initialGamesState(): GamesState {
  return {
    activeGameAccountId: initialGameAccounts[0].id,
    gameAccounts: [...initialGameAccounts],
  };
}

function persistedStateFromStore(state: AppStore): PersistedAppState {
  if (!state.auth.rememberSession || !state.auth.session) {
    return {
      auth: { session: null },
      games: emptyGamesState,
    };
  }

  return {
    auth: { session: state.auth.session },
    games: state.games,
  };
}

function parsePersistedState(persistedState: unknown): PersistedAppState | null {
  const result = v.safeParse(persistedAppStateSchema, persistedState);
  return result.success ? result.output : null;
}

export function createAppStore(
  storage: StateStorage = mmkvStateStorage,
  authAdapter: AuthAdapter = new MockAuthAdapter(),
) {
  return createStore<AppStore>()(
    persist(
      immer((set, get) => ({
        auth: unauthenticatedAuthState,
        games: emptyGamesState,
        linkGameAccount: (credentials) => {
          const newGameAccount = createGameAccount(credentials);
          set((state) => {
            state.games.gameAccounts.push(newGameAccount);
            state.games.activeGameAccountId = newGameAccount.id;
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
              });
              return;
            }

            set((state) => {
              state.auth.loginError = null;
              state.auth.loginStatus = 'succeeded';
              state.auth.rememberSession = parsedSubmission.output.rememberSession;
              state.auth.session = result.data;
              if (state.games.gameAccounts.length === 0) state.games = initialGamesState();
            });
          } catch (error: unknown) {
            set((state) => {
              state.auth.loginError = null;
              state.auth.loginStatus = 'failed';
            });
            throw error;
          }
        },
        logout: () => {
          set((state) => {
            state.auth = unauthenticatedAuthState;
            state.games = emptyGamesState;
          });
        },
        selectGameAccount: (gameAccountId) => {
          set((state) => {
            if (state.games.gameAccounts.some((gameAccount) => gameAccount.id === gameAccountId)) {
              state.games.activeGameAccountId = gameAccountId;
            }
          });
        },
      })),
      {
        merge: (persistedState, currentState) => {
          const storedState = parsePersistedState(persistedState);
          if (!storedState) {
            storage.removeItem(APP_STORE_STORAGE_KEY);
            return currentState;
          }

          return {
            ...currentState,
            auth: {
              ...currentState.auth,
              rememberSession: storedState.auth.session !== null,
              session: storedState.auth.session,
            },
            games: storedState.games,
          };
        },
        name: APP_STORE_STORAGE_KEY,
        onRehydrateStorage: () => (_state, error) => {
          if (error) storage.removeItem(APP_STORE_STORAGE_KEY);
        },
        partialize: persistedStateFromStore,
        storage: createJSONStorage<PersistedAppState>(() => storage),
      },
    ),
  );
}

const appStore = createAppStore();

export function useAppStore<T>(selector: (state: AppStore) => T): T {
  return useStore(appStore, selector);
}

export function selectActiveGameAccount(state: AppStore): GameAccount {
  const activeGameAccount = state.games.gameAccounts.find(
    (gameAccount) => gameAccount.id === state.games.activeGameAccountId,
  ) ?? state.games.gameAccounts[0];

  if (!activeGameAccount) throw new Error('Dashboard requires at least one Game Account.');
  return activeGameAccount;
}
