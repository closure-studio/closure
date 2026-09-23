import type {
  ArkHostCreateGameInput,
  ArkHostGameConfigPatch,
  ArkHostGameDetail,
  ArkHostGameListEntry,
  ArkHostGameLogs,
  ArkHostSseEvent,
  GameCaptchaSubmission,
} from '@/schemas/arkhost';

export type { ArkHostSseEvent } from '@/schemas/arkhost';

export type ArkHostFailure =
  | { code: 'operation-rejected'; diagnosticMessage?: string; kind: 'business' }
  | { code: 'network-unavailable' | 'server-error' | 'timeout'; diagnosticMessage?: string; kind: 'transport' }
  | { code: 'invalid-response'; diagnosticMessage?: string; kind: 'invalid-response' };

export type ArkHostResult<T> =
  | { data: T; ok: true }
  | { error: ArkHostFailure; ok: false };

export type ArkHostSseListener = (event: ArkHostSseEvent) => void;
export type ArkHostSseSubscription = { unsubscribe: () => void };

export interface ArkHostApi {
  createGame(input: ArkHostCreateGameInput, signal?: AbortSignal): Promise<ArkHostResult<void>>;
  submitGameCaptcha(account: string, input: GameCaptchaSubmission, signal?: AbortSignal): Promise<ArkHostResult<void>>;
  deleteGame(account: string, signal?: AbortSignal): Promise<ArkHostResult<void>>;
  fetchGameDetail(account: string, signal?: AbortSignal): Promise<ArkHostResult<ArkHostGameDetail | null>>;
  fetchGameList(signal?: AbortSignal): Promise<ArkHostResult<ArkHostGameListEntry[]>>;
  fetchGameLogs(account: string, afterId: number, signal?: AbortSignal): Promise<ArkHostResult<ArkHostGameLogs>>;
  loginGame(account: string, signal?: AbortSignal): Promise<ArkHostResult<void>>;
  pauseGame(account: string, signal?: AbortSignal): Promise<ArkHostResult<void>>;
  subscribe(accessToken: string, listener: ArkHostSseListener, signal?: AbortSignal): ArkHostSseSubscription;
  updateGameConfig(
    account: string,
    patch: ArkHostGameConfigPatch,
    signal?: AbortSignal,
  ): Promise<ArkHostResult<void>>;
}
