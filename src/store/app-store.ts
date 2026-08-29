import * as v from "valibot";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { createJSONStorage, persist } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";

import { mmkvStateStorage } from "@/lib/mmkv";
import { apiNodeIdSchema } from "@/schemas/api-node";
import type { UserSession } from "@/schemas/auth";
import { persistedStoreStateSchema } from "@/schemas/local-state";
import type { PersistedStoreState } from "@/schemas/local-state";

export type AppStore = PersistedStoreState & {
  // auth
  setSession: (session: UserSession) => void;
  logout: () => void;
  // api node
  selectApiNode: (apiNodeId: unknown) => void;
};

export const APP_STORE_STORAGE_KEY = "closure.app-store";

const APP_STORE_VERSION = 1;

function initialState(): Pick<AppStore, "auth" | "selectedApiNodeId"> {
  return {
    auth: { session: null },
    selectedApiNodeId: "domestic",
  };
}

function persistedStateFromStore(state: AppStore): PersistedStoreState {
  return {
    auth: { session: state.auth.session },
    selectedApiNodeId: state.selectedApiNodeId,
  };
}

function unwrapStoredState(parsed: unknown): unknown {
  if (typeof parsed === "object" && parsed !== null && "state" in parsed) {
    return parsed.state;
  }
  return parsed;
}

function migrateStoredFormat(storage: StateStorage): void {
  const raw = storage.getItem(APP_STORE_STORAGE_KEY);
  if (typeof raw !== "string") return;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    storage.removeItem(APP_STORE_STORAGE_KEY);
    return;
  }
  const candidate = unwrapStoredState(parsed);
  const storedState = v.safeParse(persistedStoreStateSchema, candidate);
  if (!storedState.success) {
    storage.removeItem(APP_STORE_STORAGE_KEY);
    return;
  }
  if (candidate === parsed) {
    storage.setItem(
      APP_STORE_STORAGE_KEY,
      JSON.stringify({ state: storedState.output, version: APP_STORE_VERSION }),
    );
  }
}

export type AppStoreOptions = {
  storage?: StateStorage;
};

export function createAppStore(options: AppStoreOptions = {}) {
  const { storage = mmkvStateStorage } = options;
  migrateStoredFormat(storage);

  return createStore<AppStore>()(
    persist(
      (set) => ({
        ...initialState(),
        logout: () => {
          set({ auth: { session: null } });
        },
        selectApiNode: (apiNodeId) => {
          const parsedApiNodeId = v.safeParse(apiNodeIdSchema, apiNodeId);
          if (!parsedApiNodeId.success) return;
          set({ selectedApiNodeId: parsedApiNodeId.output });
        },
        setSession: (session) => {
          set({ auth: { session } });
        },
      }),
      {
        name: APP_STORE_STORAGE_KEY,
        version: APP_STORE_VERSION,
        partialize: persistedStateFromStore,
        storage: createJSONStorage(() => storage),
        merge: (persistedState, currentState) => {
          const storedState = v.safeParse(
            persistedStoreStateSchema,
            persistedState,
          );
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
