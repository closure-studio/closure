import type {
  ArkHostApCostEntry,
  ArkHostCaptchaSubmission,
  ArkHostCharacters,
  ArkHostGachaEvent,
  ArkHostGameConfigPatch,
  ArkHostGameDetail,
  ArkHostGameListEntry,
  ArkHostGameLogEntry,
  ArkHostGameLogs,
  ArkHostSystemConfig,
  ArkHostSystemConfigPatch,
} from '@/schemas/arkhost';

export type ArkHostFailure =
  | { code: 'operation-rejected'; diagnosticMessage?: string; kind: 'business' }
  | { code: 'network-unavailable' | 'server-error' | 'timeout'; diagnosticMessage?: string; kind: 'transport' }
  | { code: 'invalid-response'; diagnosticMessage?: string; kind: 'invalid-response' };

export type ArkHostResult<T> =
  | { data: T; ok: true }
  | { error: ArkHostFailure; ok: false };

export type ArkHostSseEvent =
  | { data: ArkHostGameListEntry[]; type: 'game' }
  | { data: ArkHostGameLogEntry; type: 'log' }
  | { data: ArkHostGachaEvent[]; type: 'ssr' };

export type ArkHostSseListener = (event: ArkHostSseEvent) => void;
export type ArkHostSseSubscription = { unsubscribe: () => void };

export interface ArkHostApi {
  deleteGame(account: string): Promise<ArkHostResult<boolean>>;
  fetchApCostRanking(): Promise<ArkHostResult<ArkHostApCostEntry[]>>;
  fetchCharacters(account: string): Promise<ArkHostResult<ArkHostCharacters>>;
  fetchGameDetail(account: string): Promise<ArkHostResult<ArkHostGameDetail | null>>;
  fetchGameList(): Promise<ArkHostResult<ArkHostGameListEntry[]>>;
  fetchGameLogs(account: string, afterId: number): Promise<ArkHostResult<ArkHostGameLogs>>;
  fetchGameLogsAsAdmin(account: string, userId: string, afterId: number): Promise<ArkHostResult<ArkHostGameLogs>>;
  fetchSystemConfig(): Promise<ArkHostResult<ArkHostSystemConfig>>;
  loginGame(account: string, captchaToken: string): Promise<ArkHostResult<void>>;
  submitCaptcha(account: string, submission: ArkHostCaptchaSubmission): Promise<ArkHostResult<void>>;
  subscribe(accessToken: string, listener: ArkHostSseListener): ArkHostSseSubscription;
  updateGameConfig(account: string, patch: ArkHostGameConfigPatch): Promise<ArkHostResult<void>>;
  updateSystemConfig(patch: ArkHostSystemConfigPatch): Promise<ArkHostResult<void>>;
}
