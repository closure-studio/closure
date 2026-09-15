import * as v from "valibot";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { createJSONStorage, persist } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";

import { mmkvStateStorage } from "@/lib/mmkv";
import type { ApiNodeId } from "@/schemas/api-node";
import type { UserSession } from "@/schemas/auth";
import { persistedStoreStateSchema } from "@/schemas/local-state";
import type { PersistedStoreState, RequestMode } from "@/schemas/local-state";

export type AppStore = PersistedStoreState & {
  setSession: (session: UserSession) => void;
  logout: () => void;
  setNextRequestMode: (mode: RequestMode) => void;
  selectApiNode: (apiNodeId: ApiNodeId) => void;
};

export const APP_STORE_STORAGE_KEY = "closure.app-store";

function initialState(): PersistedStoreState {
  return {
    auth: { session: null },
    selectedApiNodeId: "domestic",
    requestMode: "remote",
  };
}

function persistedStateFromStore(state: AppStore): PersistedStoreState {
  return {
    auth: { session: state.auth.session },
    selectedApiNodeId: state.selectedApiNodeId,
    requestMode: state.requestMode,
  };
}

export type AppStoreOptions = {
  storage?: StateStorage;
};

export function createAppStore(options: AppStoreOptions = {}) {
  const { storage = mmkvStateStorage } = options;

  return createStore<AppStore>()(
    persist(
      (set, get) => ({
        ...initialState(),
        setSession: (session) => set({ auth: { session } }),
        logout: () => set({ auth: { session: null } }),
        setNextRequestMode: (mode) => set({ requestMode: mode }),
        selectApiNode: (apiNodeId) => {
          if (apiNodeId !== get().selectedApiNodeId) set({ selectedApiNodeId: apiNodeId });
        },
      }),
      {
        name: APP_STORE_STORAGE_KEY,
        partialize: persistedStateFromStore,
        storage: createJSONStorage(() => storage),
        merge: (persistedState, currentState) => {
          const storedState = v.safeParse(persistedStoreStateSchema, persistedState);
          if (!storedState.success) return currentState;
          return {
            ...currentState,
            ...storedState.output,
          };
        },
      },
    ),
  );
}

export const appStore = createAppStore();

export function useAppStore<T>(selector: (state: AppStore) => T): T {
  return useStore(appStore, selector);
}
