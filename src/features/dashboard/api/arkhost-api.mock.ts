import type {
  ArkHostGameDetail,
  ArkHostGameListEntry,
} from "@/schemas/arkhost";
import type {
  ArkHostApi,
  ArkHostResult,
  ArkHostSseEvent,
  ArkHostSseListener,
  ArkHostSseSubscription,
} from "./arkhost-api";
import {
  mockArkHostCharactersResponse,
  mockArkHostGameDetailResponse,
  mockArkHostGameListResponse,
  mockArkHostGameLogsResponse,
  mockArkHostSecondaryCharactersResponse,
  mockArkHostTertiaryCharactersResponse,
} from "@/mocks/arkhost";

const MOCK_ARKHOST_DELAY_MS = 250;
export const MOCK_ARKHOST_SSE_RECONNECT_DELAY_MS = 5000;

const success = <T>(data: T): ArkHostResult<T> => ({ data, ok: true });
const failure = <T>(): ArkHostResult<T> => ({
  error: { code: "operation-rejected", kind: "business" },
  ok: false,
});

class MockSseSubscription {
  readonly #listener: ArkHostSseListener;
  #connected = true;
  #reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  #unsubscribed = false;

  constructor(listener: ArkHostSseListener) {
    this.#listener = listener;
  }

  dispatch(event: ArkHostSseEvent) {
    if (!this.#connected || this.#unsubscribed) return;
    this.#listener(event);
  }

  scheduleReconnect() {
    if (this.#unsubscribed || this.#reconnectTimer !== null) return;
    this.#connected = false;
    this.#reconnectTimer = setTimeout(() => {
      this.#reconnectTimer = null;
      if (this.#unsubscribed) return;
      this.#connected = true;
    }, MOCK_ARKHOST_SSE_RECONNECT_DELAY_MS);
  }

  unsubscribe() {
    if (this.#unsubscribed) return;
    this.#unsubscribed = true;
    this.#connected = false;
    if (this.#reconnectTimer !== null) {
      clearTimeout(this.#reconnectTimer);
      this.#reconnectTimer = null;
    }
  }
}

const mockCharactersByAccount = new Map([
  ["G18928069156", mockArkHostCharactersResponse],
  ["G16601716973", mockArkHostSecondaryCharactersResponse],
  ["G17107372623", mockArkHostTertiaryCharactersResponse],
]);

export class MockArkHostApi implements ArkHostApi {
  readonly #delayMs: number;
  readonly #subscriptions = new Set<MockSseSubscription>();
  #gameList: ArkHostGameListEntry[];
  #detail: ArkHostGameDetail | null;

  constructor(delayMs = MOCK_ARKHOST_DELAY_MS) {
    this.#delayMs = delayMs;
    this.#gameList =
      mockArkHostGameListResponse.code === 1
        ? structuredClone(mockArkHostGameListResponse.data)
        : [];
    this.#detail =
      mockArkHostGameDetailResponse.code === 1
        ? structuredClone(mockArkHostGameDetailResponse.data)
        : null;
  }

  get activeSubscriptionCount(): number {
    return this.#subscriptions.size;
  }

  async #wait() {
    if (this.#delayMs === 0) return;
    await new Promise<void>((resolve) => setTimeout(resolve, this.#delayMs));
  }

  emit(event: ArkHostSseEvent) {
    for (const subscription of this.#subscriptions) subscription.dispatch(event);
  }

  simulateTransportClose() {
    for (const subscription of this.#subscriptions) subscription.scheduleReconnect();
  }

  async deleteGame(account: string) {
    await this.#wait();
    const index = this.#gameList.findIndex(
      (entry) => entry.status.account === account,
    );
    if (index === -1) return failure<boolean>();
    this.#gameList.splice(index, 1);
    if (this.#detail?.config.account === account) this.#detail = null;
    return success(true);
  }

  async fetchCharacters(account: string) {
    await this.#wait();
    const response = mockCharactersByAccount.get(account);
    const characters =
      response?.code === 1
        ? structuredClone(response.data)
        : { chars: [], total: 0 };
    return success(characters);
  }
  async fetchGameDetail(account: string) {
    await this.#wait();
    return success(
      this.#detail?.config.account === account
        ? structuredClone(this.#detail)
        : null,
    );
  }
  async fetchGameList() {
    await this.#wait();
    return success(structuredClone(this.#gameList));
  }
  async fetchGameLogs(account: string, afterId: number) {
    await this.#wait();
    const logs =
      mockArkHostGameLogsResponse.code === 1
        ? mockArkHostGameLogsResponse.data.logs.filter(
            (entry) =>
              entry.name === account && (afterId === 0 || entry.id < afterId),
          )
        : [];
    return success({
      hasMore:
        logs.length > 0 &&
        mockArkHostGameLogsResponse.code === 1 &&
        mockArkHostGameLogsResponse.data.hasMore,
      logs: structuredClone(logs),
    });
  }
  subscribe(
    _accessToken: string,
    listener: ArkHostSseListener,
  ): ArkHostSseSubscription {
    const subscription = new MockSseSubscription(listener);
    this.#subscriptions.add(subscription);
    return {
      unsubscribe: () => {
        this.#subscriptions.delete(subscription);
        subscription.unsubscribe();
      },
    };
  }
}
