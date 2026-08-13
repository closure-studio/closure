import { MockAuthAdapter } from "@/features/auth/api";
import { MockArkHostApi } from "@/features/dashboard/api";
import { mockArkHostGachaEvents } from "@/mocks/arkhost";
import type { ApiNodeAdapter } from "@/features/settings/api-node/api";
import type { GameResourcesApi } from "@/features/dashboard/api";
import {
  bundledGameResources,
} from "@/features/dashboard/game-data";
import type { SyncStateStorage } from "./app-storage";
import {
  createAppStore,
  selectActiveCharacters,
  selectActiveGameAccount,
  selectActiveGameDetail,
  selectCharacterUpdatedAt,
  selectItemTable,
  selectItemUpdatedAt,
  selectStageUpdatedAt,
} from "./app-store";

function createMemoryStorage(): SyncStateStorage {
  const values = new Map<string, string>();
  return {
    getItem: (name) => values.get(name) ?? null,
    removeItem: (name) => {
      values.delete(name);
    },
    setItem: (name, value) => {
      values.set(name, value);
    },
  };
}

const submission = {
  credentials: { identifier: "doctor", password: "secret" },
  rememberSession: true,
};
const EXPECTED_GAME_ACCOUNT_COUNT = 3;
const EXPECTED_CHARACTER_COUNT = 422;
const EXPECTED_SECONDARY_CHARACTER_COUNT = 60;
const EXPECTED_TERTIARY_CHARACTER_COUNT = 103;
const EXPECTED_INVENTORY_QUANTITY = 131;

function createGameResourcesApi(overrides: Partial<GameResourcesApi> = {}): GameResourcesApi {
  return {
    fetchCharacter: () => Promise.resolve({ kind: "not-modified" }),
    fetchItem: () => Promise.resolve({ kind: "not-modified" }),
    fetchStage: () => Promise.resolve({ kind: "not-modified" }),
    ...overrides,
  };
}

describe("App Store ArkHost integration", () => {
  it("loads core ArkHost data and the active account immediately after login", async () => {
    const store = createAppStore(
      { storage: createMemoryStorage(), authAdapter: new MockAuthAdapter(0), arkHostApi: new MockArkHostApi(0) },
    );
    await store.getState().login(submission);
    expect(store.getState().games.loadStatus).toBe("succeeded");
    expect(store.getState().games.data?.gameAccounts).toHaveLength(
      EXPECTED_GAME_ACCOUNT_COUNT,
    );
    expect(selectActiveGameAccount(store.getState())?.account).toBe(
      "G18928069156",
    );
    expect(selectActiveGameDetail(store.getState())?.inventory?.["31034"]).toBe(
      EXPECTED_INVENTORY_QUANTITY,
    );
    expect(selectActiveCharacters(store.getState()).total).toBe(
      EXPECTED_CHARACTER_COUNT,
    );
  });

  it("loads the selected game account's distinct character roster", async () => {
    const store = createAppStore(
      { storage: createMemoryStorage(), authAdapter: new MockAuthAdapter(0), arkHostApi: new MockArkHostApi(0) },
    );
    await store.getState().login(submission);
    store.getState().selectGameAccount("G16601716973");
    await store.getState().loadGameDetail("G16601716973");
    expect(selectActiveCharacters(store.getState()).total).toBe(
      EXPECTED_SECONDARY_CHARACTER_COUNT,
    );
    store.getState().selectGameAccount("G17107372623");
    await store.getState().loadGameDetail("G17107372623");
    expect(selectActiveCharacters(store.getState()).total).toBe(
      EXPECTED_TERTIARY_CHARACTER_COUNT,
    );
  });

  it("applies controlled SSE events and clears all game data on logout", async () => {
    const api = new MockArkHostApi(0);
    const store = createAppStore(
      { storage: createMemoryStorage(), authAdapter: new MockAuthAdapter(0), arkHostApi: api },
    );
    await store.getState().login(submission);
    api.emit({ data: mockArkHostGachaEvents, type: "ssr" });
    expect(store.getState().games.data?.gachaEvents).toHaveLength(
      mockArkHostGachaEvents.length,
    );
    store.getState().logout();
    expect(store.getState().games.data).toBeNull();
    expect(store.getState().games.sseStatus).toBe("closed");
  });

  it("uses a validated persisted snapshot without calling ArkHost again", async () => {
    const storage = createMemoryStorage();
    const firstApi = new MockArkHostApi(0);
    const firstStore = createAppStore(
      { storage, authAdapter: new MockAuthAdapter(0), arkHostApi: firstApi },
    );
    await firstStore.getState().login(submission);
    const secondApi = new MockArkHostApi(0);
    const fetchGameList = jest.spyOn(secondApi, "fetchGameList");
    const secondStore = createAppStore(
      { storage, authAdapter: new MockAuthAdapter(0), arkHostApi: secondApi },
    );
    await secondStore.persist.rehydrate();
    await secondStore.getState().initializeGames();
    expect(secondStore.getState().games.data?.gameAccounts).toHaveLength(
      EXPECTED_GAME_ACCOUNT_COUNT,
    );
    expect(fetchGameList).not.toHaveBeenCalled();
  });
});

describe("App Store API Node and auth operations", () => {
  it("queries API Nodes once, persists selection, and keeps it through logout", async () => {
    const storage = createMemoryStorage();
    const queryNodes = jest.fn().mockResolvedValue({
        data: [
          { id: "domestic", description: "Domestic", latencyMs: 20, outcome: "reachable" },
          { id: "overseas", description: "Overseas", latencyMs: 120, outcome: "reachable" },
        ],
        ok: true,
      });
    const apiNodeAdapter: ApiNodeAdapter = {
      queryNodes,
    };
    const store = createAppStore({
      apiNodeAdapter,
      authAdapter: new MockAuthAdapter(0),
      arkHostApi: new MockArkHostApi(0),
      storage,
    });

    expect(store.getState().network.selectedApiNodeId).toBe("domestic");
    await Promise.all([
      store.getState().initializeApiNodes(),
      store.getState().initializeApiNodes(),
    ]);
    expect(queryNodes).toHaveBeenCalledTimes(1);
    expect(store.getState().network.nodes).toHaveLength(2);
    store.getState().selectApiNode("overseas");
    store.getState().logout();
    expect(store.getState().network.selectedApiNodeId).toBe("overseas");

    const rehydratedStore = createAppStore({ storage });
    await rehydratedStore.persist.rehydrate();
    expect(rehydratedStore.getState().network.selectedApiNodeId).toBe("overseas");
  });

  it("keeps nodes when a refresh fails", async () => {
    let shouldFail = false;
    const apiNodeAdapter: ApiNodeAdapter = {
      queryNodes: jest.fn().mockImplementation(() => Promise.resolve(shouldFail
        ? { error: { code: "timeout", kind: "transport" }, ok: false }
        : {
          data: [{ id: "domestic", description: "Domestic", latencyMs: 20, outcome: "reachable" }],
          ok: true,
        })),
    };
    const store = createAppStore({
      apiNodeAdapter,
      authAdapter: new MockAuthAdapter(0),
      arkHostApi: new MockArkHostApi(0),
      storage: createMemoryStorage(),
    });
    await store.getState().initializeApiNodes();
    shouldFail = true;
    await store.getState().refreshApiNodes();
    expect(store.getState().network.nodes).toHaveLength(1);
    expect(store.getState().network.queryStatus).toBe("failed");
    expect(store.getState().network.queryError?.code).toBe("timeout");
  });

  it("coordinates recovery and password update through the auth adapter", async () => {
    const store = createAppStore({
      authAdapter: new MockAuthAdapter(0),
      arkHostApi: new MockArkHostApi(0),
      storage: createMemoryStorage(),
    });
    await store.getState().requestPasswordRecovery({ identifier: " doctor@rhodes.is " });
    expect(store.getState().auth.passwordRecoveryStatus).toBe("succeeded");
    await store.getState().requestPasswordRecovery({ identifier: "unknown@example.com" });
    expect(store.getState().auth.passwordRecoveryStatus).toBe("failed");
    expect(store.getState().auth.passwordRecoveryError?.code).toBe("user-not-found");

    await store.getState().updatePassword({
      currentPassword: "closure-password",
      newPassword: "new-password",
      repeatNewPassword: "new-password",
    });
    expect(store.getState().auth.passwordUpdateError?.code).toBe("session-expired");
    await store.getState().login(submission);
    await store.getState().updatePassword({
      currentPassword: "closure-password",
      newPassword: "new-password",
      repeatNewPassword: "new-password",
    });
    expect(store.getState().auth.passwordUpdateStatus).toBe("succeeded");
  });
});

describe("App Store game resources", () => {
  it("updates each table independently and exposes its current time", async () => {
    const updatedAt = "2026-08-11T10:20:41.000Z";
    const api = createGameResourcesApi({
      fetchCharacter: () => Promise.resolve({ kind: "unavailable" }),
      fetchItem: () => Promise.resolve({
        kind: "updated",
        table: { item_alpha: { icon: "ITEM_ALPHA", name: "测试物品甲" } },
        updatedAt,
      }),
      fetchStage: () => Promise.reject(new Error("offline")),
    });
    const store = createAppStore(
      { storage: createMemoryStorage(), authAdapter: new MockAuthAdapter(0), arkHostApi: new MockArkHostApi(0), gameResourcesApi: api },
    );

    await store.getState().updateGameResources();

    expect(selectItemTable(store.getState())).toEqual({
      item_alpha: { icon: "ITEM_ALPHA", name: "测试物品甲" },
    });
    expect(selectItemUpdatedAt(store.getState())).toBe(updatedAt);
    expect(selectCharacterUpdatedAt(store.getState())).toBe(
      bundledGameResources.character.updatedAt,
    );
    expect(selectStageUpdatedAt(store.getState())).toBe(
      bundledGameResources.stage.updatedAt,
    );
    expect(store.getState().gameResources.checkedAt).not.toBeNull();
  });

  it("ignores resources that are not newer than the current table", async () => {
    const api = createGameResourcesApi({
      fetchItem: () => Promise.resolve({
        kind: "updated",
        table: { item_alpha: { icon: "ITEM_ALPHA", name: "测试物品甲" } },
        updatedAt: bundledGameResources.item.updatedAt,
      }),
    });
    const store = createAppStore(
      { storage: createMemoryStorage(), authAdapter: new MockAuthAdapter(0), arkHostApi: new MockArkHostApi(0), gameResourcesApi: api },
    );

    await store.getState().updateGameResources();

    expect(selectItemUpdatedAt(store.getState())).toBe(
      bundledGameResources.item.updatedAt,
    );
    expect(selectItemTable(store.getState())).not.toHaveProperty("item_alpha");
  });

  it("reuses an in-flight update and skips the next automatic check for 24 hours", async () => {
    let resolveItem: (() => void) | undefined;
    const itemResult = new Promise<{ kind: "not-modified" }>((resolve) => {
      resolveItem = () => resolve({ kind: "not-modified" });
    });
    const api = createGameResourcesApi({ fetchItem: () => itemResult });
    const fetchItem = jest.spyOn(api, "fetchItem");
    const store = createAppStore(
      { storage: createMemoryStorage(), authAdapter: new MockAuthAdapter(0), arkHostApi: new MockArkHostApi(0), gameResourcesApi: api },
    );

    const first = store.getState().updateGameResources();
    const second = store.getState().updateGameResources();
    expect(fetchItem).toHaveBeenCalledTimes(1);
    resolveItem?.();
    await Promise.all([first, second]);

    await store.getState().initializeGameResources();
    expect(fetchItem).toHaveBeenCalledTimes(1);
  });
});
