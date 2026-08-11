import * as v from 'valibot';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createGameAccount, initialGameAccounts } from '@/features/dashboard/mocks/game-accounts';
import { mmkvStateStorage } from '@/lib/mmkv';
import type { AuthState, LoginCredentials } from '@/schemas/auth';
import type { GameAccount, LinkGameAccountCredentials } from '@/schemas/game-account';
import { persistedAppStateSchema } from '@/schemas/local-state';
import type { GamesState, PersistedAppState } from '@/schemas/local-state';

export const APP_STORE_STORAGE_KEY = 'closure.app-store';

const unauthenticatedUserState: AuthState = {
  credentials: null,
  status: 'unauthenticated',
  token: null,
};

const emptyGamesState: GamesState = {
  activeGameAccountId: null,
  gameAccounts: [],
};

type AppStoreActions = {
  linkGameAccount: (credentials: LinkGameAccountCredentials) => void;
  selectGameAccount: (gameAccountId: string) => void;
  signIn: (credentials: LoginCredentials) => void;
  signOut: () => void;
};

export type AppStore = PersistedAppState & AppStoreActions;

function initialGamesState(): GamesState {
  return {
    activeGameAccountId: initialGameAccounts[0].id,
    gameAccounts: [...initialGameAccounts],
  };
}

function persistedStateFromStore(state: AppStore): PersistedAppState {
  return {
    games: state.games,
    user: state.user,
  };
}

function parsePersistedState(persistedState: unknown): PersistedAppState | null {
  const result = v.safeParse(persistedAppStateSchema, persistedState);
  return result.success ? result.output : null;
}

export function createAppStore(storage: StateStorage = mmkvStateStorage) {
  return createStore<AppStore>()(
    persist(
      immer((set) => ({
        games: emptyGamesState,
        linkGameAccount: (credentials) => {
          const newGameAccount = createGameAccount(credentials);
          set((state) => {
            state.games.gameAccounts.push(newGameAccount);
            state.games.activeGameAccountId = newGameAccount.id;
          });
        },
        selectGameAccount: (gameAccountId) => {
          set((state) => {
            if (state.games.gameAccounts.some((gameAccount) => gameAccount.id === gameAccountId)) {
              state.games.activeGameAccountId = gameAccountId;
            }
          });
        },
        signIn: (credentials) => {
          set((state) => {
            state.user = {
              credentials,
              status: 'authenticated',
              token: 'mock-session-token',
            };
            if (state.games.gameAccounts.length === 0) state.games = initialGamesState();
          });
        },
        signOut: () => {
          set((state) => {
            state.user = unauthenticatedUserState;
            state.games = emptyGamesState;
          });
        },
        user: unauthenticatedUserState,
      })),
      {
        merge: (persistedState, currentState) => {
          const storedState = parsePersistedState(persistedState);
          if (!storedState) {
            storage.removeItem(APP_STORE_STORAGE_KEY);
            return currentState;
          }

          return { ...currentState, ...storedState };
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
