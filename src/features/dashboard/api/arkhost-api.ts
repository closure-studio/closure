import type {
  ArkHostCharacters,
  ArkHostGameConfigPatch,
  ArkHostGameDetail,
  ArkHostGameListEntry,
  ArkHostGameLogs,
  ArkHostSseEvent,
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
  deleteGame(account: string): Promise<ArkHostResult<boolean>>;
  fetchCharacters(account: string): Promise<ArkHostResult<ArkHostCharacters>>;
  fetchGameDetail(account: string): Promise<ArkHostResult<ArkHostGameDetail | null>>;
  fetchGameList(): Promise<ArkHostResult<ArkHostGameListEntry[]>>;
  fetchGameLogs(account: string, afterId: number): Promise<ArkHostResult<ArkHostGameLogs>>;
  subscribe(accessToken: string, listener: ArkHostSseListener): ArkHostSseSubscription;
  updateGameConfig(
    account: string,
    patch: ArkHostGameConfigPatch,
  ): Promise<ArkHostResult<void>>;
}
