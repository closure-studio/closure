import { mockArkHostGachaEvents } from '@/mocks/arkhost';
import { MockArkHostApi } from './arkhost-api.mock';

describe("MockArkHostApi", () => {
  it("serves core ArkHost data", async () => {
    const api = new MockArkHostApi(0);
    const [games, detail, characters, logs] = await Promise.all([
      api.fetchGameList(),
      api.fetchGameDetail("G18928069156"),
      api.fetchCharacters("G18928069156"),
      api.fetchGameLogs("G18928069156", 0),
    ]);
    expect(games.ok && games.data).toHaveLength(3);
    expect(detail.ok && detail.data?.inventory?.["31034"]).toBe(131);
    expect(characters.ok && characters.data.total).toBe(422);
    expect(logs.ok && logs.data.logs).toHaveLength(10);
  });

  it("serves a distinct character roster for each mock game account", async () => {
    const api = new MockArkHostApi(0);
    const [primary, secondary, tertiary, unknown] = await Promise.all([
      api.fetchCharacters("G18928069156"),
      api.fetchCharacters("G16601716973"),
      api.fetchCharacters("G17107372623"),
      api.fetchCharacters("G00000000000"),
    ]);
    expect(primary.ok && primary.data.total).toBe(422);
    expect(secondary.ok && secondary.data.total).toBe(60);
    expect(tertiary.ok && tertiary.data.total).toBe(103);
    expect(unknown.ok && unknown.data).toEqual({ chars: [], total: 0 });
  });

  it("deletes a game account and keeps server reads consistent", async () => {
    const api = new MockArkHostApi(0);
    expect(await api.deleteGame("G18928069156")).toEqual({
      data: true,
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
        is_stopped: true,
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
    ).toMatchObject({ is_stopped: true, keeping_ap: 12 });
    expect(detail.ok && detail.data?.config).toMatchObject({
      is_stopped: true,
      keeping_ap: 12,
    });
    expect(detail.ok && detail.data?.config.is_auto_battle).toBe(true);
  });

  it("rejects updating an unknown game account", async () => {
    const api = new MockArkHostApi(0);
    expect(
      await api.updateGameConfig("G00000000000", { is_stopped: true }),
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
