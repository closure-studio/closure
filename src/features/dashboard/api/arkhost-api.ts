import type {
  ArkHostCharacters,
  ArkHostGachaEvent,
  ArkHostGameDetail,
  ArkHostGameListEntry,
  ArkHostGameLogEntry,
  ArkHostGameLogs,
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
  fetchCharacters(account: string): Promise<ArkHostResult<ArkHostCharacters>>;
  fetchGameDetail(account: string): Promise<ArkHostResult<ArkHostGameDetail | null>>;
  fetchGameList(): Promise<ArkHostResult<ArkHostGameListEntry[]>>;
  fetchGameLogs(account: string, afterId: number): Promise<ArkHostResult<ArkHostGameLogs>>;
  subscribe(accessToken: string, listener: ArkHostSseListener): ArkHostSseSubscription;
}
