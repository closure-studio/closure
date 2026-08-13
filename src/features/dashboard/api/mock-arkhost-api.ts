import * as v from "valibot";

import {
  arkHostCaptchaSubmissionSchema,
  arkHostGameConfigPatchSchema,
  arkHostSystemConfigPatchSchema,
} from "@/schemas/arkhost";
import type {
  ArkHostGameDetail,
  ArkHostGameListEntry,
  ArkHostSystemConfig,
} from "@/schemas/arkhost";
import type {
  ArkHostApi,
  ArkHostResult,
  ArkHostSseEvent,
  ArkHostSseListener,
  ArkHostSseSubscription,
} from "./arkhost-api";
import {
  mockArkHostApCostResponse,
  mockArkHostCharactersResponse,
  mockArkHostGameDetailResponse,
  mockArkHostGameListResponse,
  mockArkHostGameLogsResponse,
  mockArkHostSecondaryCharactersResponse,
  mockArkHostSystemConfigResponse,
  mockArkHostTertiaryCharactersResponse,
} from "./mock-arkhost-fixtures";

const MOCK_ARKHOST_DELAY_MS = 250;

const success = <T>(data: T): ArkHostResult<T> => ({ data, ok: true });
const failure = <T>(): ArkHostResult<T> => ({
  error: { code: "operation-rejected", kind: "business" },
  ok: false,
});

const mockCharactersByAccount = new Map([
  ["G18928069156", mockArkHostCharactersResponse],
  ["G16601716973", mockArkHostSecondaryCharactersResponse],
  ["G17107372623", mockArkHostTertiaryCharactersResponse],
]);

export class MockArkHostApi implements ArkHostApi {
  readonly #delayMs: number;
  readonly #listeners = new Set<ArkHostSseListener>();
  #gameList: ArkHostGameListEntry[];
  #systemConfig: ArkHostSystemConfig;
  #detail: ArkHostGameDetail | null;

  constructor(delayMs = MOCK_ARKHOST_DELAY_MS) {
    this.#delayMs = delayMs;
    this.#gameList =
      mockArkHostGameListResponse.code === 1
        ? structuredClone(mockArkHostGameListResponse.data)
        : [];
    this.#systemConfig =
      mockArkHostSystemConfigResponse.code === 1
        ? structuredClone(mockArkHostSystemConfigResponse.data)
        : (() => {
            throw new Error("Mock System Config must be successful.");
          })();
    this.#detail =
      mockArkHostGameDetailResponse.code === 1
        ? structuredClone(mockArkHostGameDetailResponse.data)
        : null;
  }

  async #wait() {
    if (this.#delayMs === 0) return;
    await new Promise<void>((resolve) => setTimeout(resolve, this.#delayMs));
  }

  emit(event: ArkHostSseEvent) {
    for (const listener of this.#listeners) listener(event);
  }

  async fetchApCostRanking() {
    await this.#wait();
    return success(
      mockArkHostApCostResponse.code === 1
        ? structuredClone(mockArkHostApCostResponse.data)
        : [],
    );
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
  async fetchGameLogsAsAdmin(
    account: string,
    _userId: string,
    afterId: number,
  ) {
    return this.fetchGameLogs(account, afterId);
  }
  async fetchSystemConfig() {
    await this.#wait();
    return success(structuredClone(this.#systemConfig));
  }
  async loginGame(account: string, captchaToken: string) {
    await this.#wait();
    return account && captchaToken ? success(undefined) : failure<void>();
  }
  async submitCaptcha(account: string, submission: unknown) {
    await this.#wait();
    return account &&
      v.safeParse(arkHostCaptchaSubmissionSchema, submission).success
      ? success(undefined)
      : failure<void>();
  }
  subscribe(
    _accessToken: string,
    listener: ArkHostSseListener,
  ): ArkHostSseSubscription {
    this.#listeners.add(listener);
    return {
      unsubscribe: () => {
        this.#listeners.delete(listener);
      },
    };
  }
  async updateGameConfig(account: string, patch: unknown) {
    await this.#wait();
    const parsed = v.safeParse(arkHostGameConfigPatchSchema, patch);
    const game = this.#gameList.find(
      (entry) => entry.status.account === account,
    );
    if (!parsed.success || !game) return failure<void>();
    Object.assign(game.game_config, parsed.output, { account });
    if (this.#detail?.config.account === account)
      Object.assign(this.#detail.config, parsed.output, { account });
    return success(undefined);
  }
  async updateSystemConfig(patch: unknown) {
    await this.#wait();
    const parsed = v.safeParse(arkHostSystemConfigPatchSchema, patch);
    if (!parsed.success) return failure<void>();
    Object.assign(this.#systemConfig, parsed.output);
    return success(undefined);
  }
}
