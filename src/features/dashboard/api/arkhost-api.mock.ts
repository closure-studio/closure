import {
  ARK_HOST_MAX_GAME_ACCOUNTS_PER_USER,
  ARK_HOST_GAME_PLATFORM,
  ARK_HOST_GAME_STATUS_CODE,
  type ArkHostCreateGameInput,
  type ArkHostGameConfigPatch,
  type ArkHostGameDetail,
  type ArkHostGameListEntry,
  type GameCaptchaSubmission,
} from "@/schemas/arkhost";
import { assertActive, requestScope } from '@/services/request-scope';
import type {
  ArkHostApi,
  ArkHostResult,
  ArkHostSseEvent,
  ArkHostSseHandlers,
  ArkHostSseSubscription,
} from "./arkhost-api";
import {
  mockArkHostGameListResponse,
  mockArkHostGameDetails,
  mockArkHostGameLogsResponse,
} from "@/mocks/arkhost";

const MOCK_ARKHOST_DELAY_MS = 250;

const success = <T>(data: T): ArkHostResult<T> => ({ data, ok: true });
const failure = <T>(): ArkHostResult<T> => ({
  error: { code: "operation-rejected", kind: "business" },
  ok: false,
});

type MockSseSubscription = { handlers: ArkHostSseHandlers };

export class MockArkHostApi implements ArkHostApi {
  async submitGameCaptcha(account: string, _input: GameCaptchaSubmission, signal = requestScope()): Promise<ArkHostResult<void>> {
    await this.#wait(signal);
    assertActive(signal);
    const entry = this.#gameList.find((game) => game.status.account === account);
    if (!entry) return failure<void>();
    entry.captcha_info.challenge = '';
    entry.captcha_info.geetestId = '';
    return success(undefined);
  }
  readonly #delayMs: number;
  readonly #subscriptions = new Set<MockSseSubscription>();
  #gameList: ArkHostGameListEntry[];
  #details: Map<string, ArkHostGameDetail>;

  constructor(delayMs = MOCK_ARKHOST_DELAY_MS) {
    this.#delayMs = delayMs;
    this.#gameList =
      mockArkHostGameListResponse.code === 1
        ? structuredClone(mockArkHostGameListResponse.data)
        : [];
    this.#details = new Map(mockArkHostGameDetails.map((detail) => [
      detail.config.account, structuredClone(detail),
    ]));
  }

  get activeSubscriptionCount(): number {
    return this.#subscriptions.size;
  }

  async #wait(signal: AbortSignal) {
    assertActive(signal);
    if (this.#delayMs === 0) return;
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        signal.removeEventListener('abort', cancel);
        resolve();
      }, this.#delayMs);
      const cancel = () => {
        clearTimeout(timer);
        reject(new Error('Request cancelled'));
      };
      signal.addEventListener('abort', cancel, { once: true });
    });
  }

  emit(event: ArkHostSseEvent) {
    for (const subscription of this.#subscriptions) {
      subscription.handlers.onEvent(event);
    }
  }

  #setGameStatusCode(account: string, statusCode: number): ArkHostResult<void> {
    const entry = this.#gameList.find(
      (game) => game.status.account === account,
    );
    if (!entry) return failure<void>();

    entry.status.code = statusCode;
    return success(undefined);
  }

  async createGame(input: ArkHostCreateGameInput, signal = requestScope()) {
    await this.#wait(signal);
    assertActive(signal);
    if (this.#gameList.length >= ARK_HOST_MAX_GAME_ACCOUNTS_PER_USER) return failure<void>();
    const account = `${input.platform === ARK_HOST_GAME_PLATFORM.official ? 'G' : 'B'}${input.account}`;
    if (this.#gameList.some((entry) => entry.status.account === account)) return failure<void>();
    this.#gameList.push({
      captcha_info: {
        account: '', captcha_type: '', challenge: '', created: 0,
        geetestId: '', gt: '', riskType: '',
      },
      game_config: {
        accelerate_slot: 'slot_14', account, allow_login_assist: false,
        battle_tasks: [], current_map: '', enable_building_arrange: false,
        is_auto_battle: false, keeping_ap: 0,
        operator_development_tasks: [], recruit_ignore_robot: false,
        recruit_reserve: 0,
      },
      status: {
        account, ap: 0, avatar: { id: '', type: '' },
        code: ARK_HOST_GAME_STATUS_CODE.notStarted,
        created_at: 1_700_000_000 + this.#gameList.length,
        is_verify: false, level: 0, nick_name: '', password: '******',
        platform: input.platform,
        uuid: this.#gameList[0]?.status.uuid ?? 'mock-user',
      },
    });
    return success(undefined);
  }

  async deleteGame(account: string, signal = requestScope()) {
    await this.#wait(signal);
    assertActive(signal);
    const index = this.#gameList.findIndex(
      (entry) => entry.status.account === account,
    );
    if (index === -1) return failure<void>();
    this.#gameList.splice(index, 1);
    this.#details.delete(account);
    return success(undefined);
  }

  async fetchGameDetail(account: string, signal = requestScope()) {
    await this.#wait(signal);
    assertActive(signal);
    return success(structuredClone(this.#details.get(account) ?? null));
  }
  async fetchGameList(signal = requestScope()) {
    await this.#wait(signal);
    assertActive(signal);
    return success(structuredClone(this.#gameList));
  }
  async fetchGameLogs(account: string, afterId: number, signal = requestScope()) {
    await this.#wait(signal);
    assertActive(signal);
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
  async loginGame(account: string, signal = requestScope()) {
    await this.#wait(signal);
    assertActive(signal);
    return this.#setGameStatusCode(
      account,
      ARK_HOST_GAME_STATUS_CODE.loggingIn,
    );
  }
  async pauseGame(account: string, signal = requestScope()) {
    await this.#wait(signal);
    assertActive(signal);
    return this.#setGameStatusCode(
      account,
      ARK_HOST_GAME_STATUS_CODE.notStarted,
    );
  }
  async updateGameConfig(account: string, patch: ArkHostGameConfigPatch, signal = requestScope()) {
    await this.#wait(signal);
    assertActive(signal);
    const entry = this.#gameList.find(
      (game) => game.status.account === account,
    );
    if (!entry) return failure<void>();

    Object.assign(entry.game_config, structuredClone(patch));
    const detail = this.#details.get(account);
    if (detail) Object.assign(detail.config, structuredClone(patch));
    return success(undefined);
  }
  subscribe(
    _accessToken: string,
    handlers: ArkHostSseHandlers,
    signal = requestScope(),
  ): ArkHostSseSubscription {
    assertActive(signal);
    const subscription = { handlers };
    this.#subscriptions.add(subscription);
    handlers.onConnected();
    const unsubscribe = () => {
      signal.removeEventListener('abort', unsubscribe);
      this.#subscriptions.delete(subscription);
    };
    signal.addEventListener('abort', unsubscribe, { once: true });
    return { unsubscribe };
  }
}
