import { fetch } from 'expo/fetch';
import { createParser } from 'eventsource-parser';
import * as v from 'valibot';
import { API_NODE_HOSTS } from '@/constants/api';
import { appStore } from '@/store';
import { requestJson, HttpFailure } from '@/services/http';
import { requestScope, assertActive } from '@/services/request-scope';
import { runVerification } from '@/features/verification';
import { arkHostGameListEntrySchema, arkHostGameDetailSchema, arkHostGameLogsSchema, arkHostSseEventSchema } from '@/schemas/arkhost';
import type { ArkHostGameConfigPatch, GameCaptchaSubmission } from '@/schemas/arkhost';
import type { ArkHostApi, ArkHostResult, ArkHostSseListener } from './arkhost-api';

function baseUrl() {
  return (API_NODE_HOSTS.find((host) => host.id === appStore.getState().selectedApiNodeId) ?? API_NODE_HOSTS[0]).baseURL;
}

type SseFetch = (url: string, init: { signal: AbortSignal }) => Promise<{
  ok: boolean; status: number;
  body: { getReader: () => Pick<ReadableStreamDefaultReader<Uint8Array>, 'read' | 'releaseLock'> } | null;
}>;

export class RemoteArkHostApi implements ArkHostApi {
  constructor(private readonly streamRequest: SseFetch = fetch) {}
  async #call<T>(path: string, schema: v.GenericSchema<unknown, T>, signal = requestScope(), options: {
    method?: 'GET' | 'POST' | 'DELETE'; body?: object; captchaToken?: string;
  } = {}): Promise<ArkHostResult<T>> {
    assertActive(signal);
    const accessToken = appStore.getState().auth.session?.accessToken;
    if (!accessToken) return { ok: false, error: { kind: 'business', code: 'operation-rejected' } };
    try {
      const result = await requestJson(`${baseUrl()}${path}`, { ...options, accessToken, signal });
      assertActive(signal);
      if (result.code !== 1) {
        if (!options.method && /^\/game\/[^/]+$/.test(path) && result.message === '游戏未初始化,无法获取信息') {
          return { ok: true, data: v.parse(schema, null) };
        }
        return { ok: false, error: { kind: 'business', code: 'operation-rejected', diagnosticMessage: result.message } };
      }
      return { ok: true, data: v.parse(schema, result.data) };
    } catch (error) {
      assertActive(signal);
      if (error instanceof HttpFailure && error.code !== 'invalid-response') return { ok: false, error: { kind: 'transport', code: error.code } };
      return { ok: false, error: { kind: 'invalid-response', code: 'invalid-response' } };
    }
  }
  fetchGameList(signal?: AbortSignal) { return this.#call('/game', v.array(arkHostGameListEntrySchema), signal); }
  fetchGameDetail(account: string, signal?: AbortSignal) { return this.#call(`/game/${encodeURIComponent(account)}`, v.nullable(arkHostGameDetailSchema), signal); }
  fetchGameLogs(account: string, afterId: number, signal?: AbortSignal) { return this.#call(`/game/log/${encodeURIComponent(account)}/${afterId}`, arkHostGameLogsSchema, signal); }
  async #write(path: string, method: 'POST' | 'DELETE', signal?: AbortSignal, body?: object, captchaToken?: string): Promise<ArkHostResult<void>> {
    const result = await this.#call(path, v.null_(), signal, {
      method, ...(body ? { body } : {}), ...(captchaToken ? { captchaToken } : {}),
    });
    return result.ok ? { ok: true, data: undefined } : result;
  }
  async loginGame(account: string, scope = requestScope()) {
    assertActive(scope);
    const token = v.parse(v.pipe(v.string(), v.minLength(1)), await runVerification({ kind: 'google' }, scope));
    assertActive(scope);
    return this.#write(`/game/login/${encodeURIComponent(account)}`, 'POST', scope, undefined, token);
  }
  pauseGame(account: string, signal?: AbortSignal) { return this.#write(`/game/pause/${encodeURIComponent(account)}`, 'POST', signal); }
  deleteGame(account: string, signal?: AbortSignal) { return this.#write(`/game/${encodeURIComponent(account)}`, 'DELETE', signal); }
  updateGameConfig(account: string, config: ArkHostGameConfigPatch, signal?: AbortSignal) { return this.#write(`/game/config/${encodeURIComponent(account)}`, 'POST', signal, { config }); }
  submitGameCaptcha(account: string, input: GameCaptchaSubmission, signal?: AbortSignal) {
    return this.#write(`/game/config/${encodeURIComponent(account)}`, 'POST', signal, { captcha_info: input });
  }
  subscribe(accessToken: string, listener: ArkHostSseListener, scope = requestScope()) {
    const controller = new AbortController();
    const url = `${baseUrl()}/sse/games?token=${encodeURIComponent(accessToken)}`;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stop = () => { controller.abort(); clearTimeout(timer); scope.removeEventListener('abort', stop); };
    scope.addEventListener('abort', stop, { once: true });
    const connect = async () => {
      try {
        if (scope.aborted || controller.signal.aborted) return;
        const response = await this.streamRequest(url, { signal: controller.signal });
        if (response.status === 401) { if (!scope.aborted && !controller.signal.aborted) appStore.getState().logout(); stop(); return; }
        if (!response.ok || !response.body) throw new Error('SSE unavailable');
        const parser = createParser({ onEvent: (event) => {
          if (scope.aborted || controller.signal.aborted) return;
          if (event.event === 'close') { stop(); return; }
          try {
            const data: unknown = JSON.parse(event.data);
            const result = v.safeParse(arkHostSseEventSchema, { type: event.event, data });
            if (result.success) listener(result.output);
          } catch { /* A malformed frame must not terminate subsequent valid frames. */ }
        } });
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        try {
          while (!controller.signal.aborted) {
            const chunk = await reader.read();
            if (chunk.done) break;
            parser.feed(decoder.decode(chunk.value, { stream: true }));
          }
        } finally { reader.releaseLock(); }
      } catch { /* Reconnect only while this subscription still owns its session. */ }
      if (!controller.signal.aborted && !scope.aborted) timer = setTimeout(() => { void connect(); }, 5000);
    };
    void connect();
    return { unsubscribe: stop };
  }
}
