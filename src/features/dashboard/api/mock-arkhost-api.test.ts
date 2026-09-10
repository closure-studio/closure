import { mockArkHostGachaEvents } from '@/mocks/arkhost';
import {
  bundledCharacterTable,
  bundledItemTable,
  bundledStageTable,
} from '../game-data';
import { MockArkHostApi } from './arkhost-api.mock';

describe("MockArkHostApi", () => {
  it('uses identifiers from the bundled game resource tables', async () => {
    const api = new MockArkHostApi(0);
    const games = await api.fetchGameList();
    if (!games.ok) throw new Error('Expected game list');

    for (const game of games.data) {
      for (const task of game.game_config.battle_tasks) {
        expect(bundledStageTable[task.stage_id]).toBeDefined();
      }

      const detail = await api.fetchGameDetail(game.status.account);
      if (!detail.ok || !detail.data) throw new Error('Expected game detail');
      for (const operator of Object.values(detail.data.troop?.chars ?? {})) {
        expect(bundledCharacterTable[operator.charId]).toBeDefined();
      }
      for (const itemId of Object.keys(detail.data.inventory ?? {})) {
        expect(bundledItemTable[itemId]).toBeDefined();
      }
    }
  });

  it("serves core ArkHost data", async () => {
    const api = new MockArkHostApi(0);
    const [games, detail, logs] = await Promise.all([
      api.fetchGameList(),
      api.fetchGameDetail("G00000000001"),
      api.fetchGameLogs("G00000000001", 0),
    ]);
    expect(games.ok && games.data).toHaveLength(3);
    expect(detail.ok && detail.data?.inventory?.["31034"]).toBe(12);
    expect(detail.ok && Object.keys(detail.data?.troop?.chars ?? {})).toHaveLength(1);
    expect(logs.ok && logs.data.logs).toHaveLength(1);
  });

  it("serves a distinct character roster for each mock game account", async () => {
    const api = new MockArkHostApi(0);
    const [primary, secondary, tertiary, unknown] = await Promise.all([
      api.fetchGameDetail("G00000000001"),
      api.fetchGameDetail("G00000000002"),
      api.fetchGameDetail("G00000000003"),
      api.fetchGameDetail("G99999999999"),
    ]);
    expect(primary.ok && Object.keys(primary.data?.troop?.chars ?? {})).toHaveLength(1);
    expect(secondary.ok && Object.keys(secondary.data?.troop?.chars ?? {})).toHaveLength(1);
    expect(tertiary.ok && Object.keys(tertiary.data?.troop?.chars ?? {})).toHaveLength(1);
    expect(unknown.ok && unknown.data).toBeNull();
  });

  it("isolates snapshots between callers, accounts and API instances", async () => {
    const api = new MockArkHostApi(0);
    const first = await api.fetchGameDetail('G00000000001');
    if (!first.ok || !first.data?.troop) throw new Error('Expected troop');
    first.data.troop.chars = {};
    const second = await api.fetchGameDetail('G00000000001');
    expect(second.ok && Object.keys(second.data?.troop?.chars ?? {})).toHaveLength(1);
    await api.updateGameConfig('G00000000002', { keeping_ap: 42 });
    const secondary = await api.fetchGameDetail('G00000000002');
    expect(secondary.ok && secondary.data?.config.keeping_ap).toBe(42);
    const fresh = await new MockArkHostApi(0).fetchGameDetail('G00000000002');
    expect(fresh.ok && fresh.data?.config.keeping_ap).toBe(0);
    await api.deleteGame('G00000000002');
    expect(await api.fetchGameDetail('G00000000002')).toEqual({ ok: true, data: null });
    expect(second.ok && second.data?.config.keeping_ap).toBe(0);
  });

  it("deletes a game account and keeps server reads consistent", async () => {
    const api = new MockArkHostApi(0);
    expect(await api.deleteGame("G00000000001")).toEqual({
      data: undefined,
      ok: true,
    });
    const games = await api.fetchGameList();
    expect(games.ok && games.data).toHaveLength(2);
    expect(
      games.ok && games.data.some((entry) => entry.status.account === "G00000000001"),
    ).toBe(false);
    const detail = await api.fetchGameDetail("G00000000001");
    expect(detail.ok && detail.data).toBeNull();
  });

  it("updates statusCode when pausing and logging in", async () => {
    const api = new MockArkHostApi(0);

    expect(await api.pauseGame("G00000000001")).toEqual({
      data: undefined,
      ok: true,
    });
    const pausedGames = await api.fetchGameList();
    expect(
      pausedGames.ok
        && pausedGames.data.find((entry) => entry.status.account === "G00000000001")
          ?.status,
    ).toMatchObject({ code: 0 });

    expect(await api.loginGame("G00000000001")).toEqual({
      data: undefined,
      ok: true,
    });
    const loggingInGames = await api.fetchGameList();
    expect(
      loggingInGames.ok
        && loggingInGames.data.find((entry) => entry.status.account === "G00000000001")
          ?.status,
    ).toMatchObject({ code: 1 });
  });

  it("rejects pausing or logging in an unknown game account", async () => {
    const api = new MockArkHostApi(0);
    const expectedFailure = {
      error: { code: "operation-rejected", kind: "business" },
      ok: false,
    };

    await expect(api.pauseGame("G99999999999")).resolves.toEqual(expectedFailure);
    await expect(api.loginGame("G99999999999")).resolves.toEqual(expectedFailure);
  });

  it("rejects deleting an unknown game account", async () => {
    const api = new MockArkHostApi(0);
    expect(await api.deleteGame("G99999999999")).toEqual({
      error: { code: "operation-rejected", kind: "business" },
      ok: false,
    });
  });

  it("updates game settings and keeps list and detail reads consistent", async () => {
    const api = new MockArkHostApi(0);
    expect(
      await api.updateGameConfig("G00000000001", {
        keeping_ap: 12,
      }),
    ).toEqual({ data: undefined, ok: true });

    const [games, detail] = await Promise.all([
      api.fetchGameList(),
      api.fetchGameDetail("G00000000001"),
    ]);
    expect(
      games.ok
        && games.data.find((entry) => entry.status.account === "G00000000001")
          ?.game_config,
    ).toMatchObject({ keeping_ap: 12 });
    expect(detail.ok && detail.data?.config).toMatchObject({
      keeping_ap: 12,
    });
    expect(detail.ok && detail.data?.config.is_auto_battle).toBe(true);
  });

  it("rejects updating an unknown game account", async () => {
    const api = new MockArkHostApi(0);
    expect(
      await api.updateGameConfig("G99999999999", { keeping_ap: 12 }),
    ).toEqual({
      error: { code: "operation-rejected", kind: "business" },
      ok: false,
    });
  });

  it("provides a controllable SSE subscription that stops after unsubscribe", () => {
    const api = new MockArkHostApi(0);
    const listener = jest.fn();
    const subscription = api.subscribe("mock-token", listener);
    expect(api.activeSubscriptionCount).toBe(1);
    api.emit({ data: mockArkHostGachaEvents, type: "ssr" });
    expect(listener).toHaveBeenCalledTimes(1);
    subscription.unsubscribe();
    expect(api.activeSubscriptionCount).toBe(0);
    api.emit({ data: mockArkHostGachaEvents, type: "ssr" });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("unsubscribe cancels a pending reconnect", () => {
    jest.useFakeTimers();
    const api = new MockArkHostApi(0);
    const subscription = api.subscribe("mock-token", jest.fn());
    api.simulateTransportClose();
    expect(jest.getTimerCount()).toBe(1);
    subscription.unsubscribe();
    expect(jest.getTimerCount()).toBe(0);
    jest.useRealTimers();
  });
});
