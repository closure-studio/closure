import { MockArkHostApi, mockArkHostGachaEvents } from ".";

describe("MockArkHostApi", () => {
  it("serves core and account-scoped ArkHost data", async () => {
    const api = new MockArkHostApi(0);
    const [config, games, ranking, detail, characters, logs] =
      await Promise.all([
        api.fetchSystemConfig(),
        api.fetchGameList(),
        api.fetchApCostRanking(),
        api.fetchGameDetail("G18928069156"),
        api.fetchCharacters("G18928069156"),
        api.fetchGameLogs("G18928069156", 0),
      ]);
    expect(config.ok && config.data.apiVersion).toBe(1);
    expect(games.ok && games.data).toHaveLength(3);
    expect(ranking.ok && ranking.data).toHaveLength(10);
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

  it("updates mock-owned state through write operations", async () => {
    const api = new MockArkHostApi(0);
    expect(
      await api.updateGameConfig("G18928069156", { is_stopped: true }),
    ).toEqual({ data: undefined, ok: true });
    expect(await api.updateSystemConfig({ announcement: "updated" })).toEqual({
      data: undefined,
      ok: true,
    });
    const games = await api.fetchGameList();
    const config = await api.fetchSystemConfig();
    expect(games.ok && games.data[0]?.game_config.is_stopped).toBe(true);
    expect(config.ok && config.data.announcement).toBe("updated");
  });

  it("provides a controllable SSE subscription", () => {
    const api = new MockArkHostApi(0);
    const listener = jest.fn();
    const subscription = api.subscribe("mock-token", listener);
    api.emit({ data: mockArkHostGachaEvents, type: "ssr" });
    expect(listener).toHaveBeenCalledTimes(1);
    subscription.unsubscribe();
    api.emit({ type: "close" });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
