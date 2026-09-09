import { mockArkHostGachaEvents } from '@/mocks/arkhost';
import { MockArkHostApi } from './arkhost-api.mock';

describe("MockArkHostApi", () => {
  it("serves core ArkHost data", async () => {
    const api = new MockArkHostApi(0);
    const [games, detail, logs] = await Promise.all([
      api.fetchGameList(),
      api.fetchGameDetail("G18928069156"),
      api.fetchGameLogs("G18928069156", 0),
    ]);
    expect(games.ok && games.data).toHaveLength(3);
    expect(detail.ok && detail.data?.inventory?.["31034"]).toBe(131);
    expect(detail.ok && Object.keys(detail.data?.troop?.chars ?? {})).toHaveLength(426);
    expect(logs.ok && logs.data.logs).toHaveLength(10);
  });

  it("serves a distinct character roster for each mock game account", async () => {
    const api = new MockArkHostApi(0);
    const [primary, secondary, tertiary, unknown] = await Promise.all([
      api.fetchGameDetail("G18928069156"),
      api.fetchGameDetail("G16601716973"),
      api.fetchGameDetail("G17107372623"),
      api.fetchGameDetail("G00000000000"),
    ]);
    expect(primary.ok && Object.keys(primary.data?.troop?.chars ?? {})).toHaveLength(426);
    expect(secondary.ok && Object.keys(secondary.data?.troop?.chars ?? {})).toHaveLength(60);
    expect(tertiary.ok && Object.keys(tertiary.data?.troop?.chars ?? {})).toHaveLength(103);
    expect(unknown.ok && unknown.data).toBeNull();
  });

  it("isolates snapshots between callers, accounts and API instances", async () => {
    const api = new MockArkHostApi(0);
    const first = await api.fetchGameDetail('G18928069156');
    if (!first.ok || !first.data?.troop) throw new Error('Expected troop');
    first.data.troop.chars = {};
    const second = await api.fetchGameDetail('G18928069156');
    expect(second.ok && Object.keys(second.data?.troop?.chars ?? {})).toHaveLength(426);
    await api.updateGameConfig('G16601716973', { keeping_ap: 42 });
    const secondary = await api.fetchGameDetail('G16601716973');
    expect(secondary.ok && secondary.data?.config.keeping_ap).toBe(42);
    const fresh = await new MockArkHostApi(0).fetchGameDetail('G16601716973');
    expect(fresh.ok && fresh.data?.config.keeping_ap).toBe(0);
    await api.deleteGame('G16601716973');
    expect(await api.fetchGameDetail('G16601716973')).toEqual({ ok: true, data: null });
    expect(second.ok && second.data?.config.keeping_ap).toBe(0);
  });

  it("deletes a game account and keeps server reads consistent", async () => {
    const api = new MockArkHostApi(0);
    expect(await api.deleteGame("G18928069156")).toEqual({
      data: undefined,
      ok: true,
    });
    const games = await api.fetchGameList();
    expect(games.ok && games.data).toHaveLength(2);
    expect(
      games.ok && games.data.some((entry) => entry.status.account === "G18928069156"),
    ).toBe(false);
    const detail = await api.fetchGameDetail("G18928069156");
    expect(detail.ok && detail.data).toBeNull();
  });

  it("updates statusCode when pausing and logging in", async () => {
    const api = new MockArkHostApi(0);

    expect(await api.pauseGame("G18928069156")).toEqual({
      data: undefined,
      ok: true,
    });
    const pausedGames = await api.fetchGameList();
    expect(
      pausedGames.ok
        && pausedGames.data.find((entry) => entry.status.account === "G18928069156")
          ?.status,
    ).toMatchObject({ code: 0 });

    expect(await api.loginGame("G18928069156")).toEqual({
      data: undefined,
      ok: true,
    });
    const loggingInGames = await api.fetchGameList();
    expect(
      loggingInGames.ok
        && loggingInGames.data.find((entry) => entry.status.account === "G18928069156")
          ?.status,
    ).toMatchObject({ code: 1 });
  });

  it("rejects pausing or logging in an unknown game account", async () => {
    const api = new MockArkHostApi(0);
    const expectedFailure = {
      error: { code: "operation-rejected", kind: "business" },
      ok: false,
    };

    await expect(api.pauseGame("G00000000000")).resolves.toEqual(expectedFailure);
    await expect(api.loginGame("G00000000000")).resolves.toEqual(expectedFailure);
  });

  it("rejects deleting an unknown game account", async () => {
    const api = new MockArkHostApi(0);
    expect(await api.deleteGame("G00000000000")).toEqual({
      error: { code: "operation-rejected", kind: "business" },
      ok: false,
    });
  });

  it("updates game settings and keeps list and detail reads consistent", async () => {
    const api = new MockArkHostApi(0);
    expect(
      await api.updateGameConfig("G18928069156", {
        keeping_ap: 12,
      }),
    ).toEqual({ data: undefined, ok: true });

    const [games, detail] = await Promise.all([
      api.fetchGameList(),
      api.fetchGameDetail("G18928069156"),
    ]);
    expect(
      games.ok
        && games.data.find((entry) => entry.status.account === "G18928069156")
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
      await api.updateGameConfig("G00000000000", { keeping_ap: 12 }),
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
