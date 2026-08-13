import type { ApiNode } from '@/schemas/api-node';

export type ApiNodeFailure =
  | {
    code: 'network-unavailable' | 'server-error' | 'timeout';
    diagnosticMessage?: string;
    kind: 'transport';
  }
  | {
    code: 'invalid-response';
    diagnosticMessage?: string;
    kind: 'invalid-response';
  };

export type ApiNodeResult<T> =
  | { data: T; ok: true }
  | { error: ApiNodeFailure; ok: false };

export interface ApiNodeAdapter {
  queryNodes(): Promise<ApiNodeResult<ApiNode[]>>;
}
