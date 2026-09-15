import { fetch } from 'expo/fetch';
import * as v from 'valibot';
import { appStore } from '@/store';
import { requestScope, assertActive } from './request-scope';
const REQUEST_TIMEOUT_MS = 15000;
const UNAUTHORIZED = 401;

export const responseEnvelopeSchema = v.object({
  code: v.number(), data: v.unknown(), message: v.string(),
});

export class HttpFailure extends Error {
  constructor(readonly code: 'network-unavailable' | 'server-error' | 'timeout' | 'invalid-response', readonly status?: number) {
    super(code);
  }
}

export async function requestJson(url: string, options: {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: object;
  accessToken?: string;
  captchaToken?: string;
  signal?: AbortSignal;
} = {}) {
  const scope = requestScope();
  const controller = new AbortController();
  const cancel = () => controller.abort();
  let timedOut = false;
  scope.addEventListener('abort', cancel, { once: true });
  options.signal?.addEventListener('abort', cancel, { once: true });
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const assertRequestActive = () => {
    assertActive(scope);
    if (options.signal) assertActive(options.signal);
    if (timedOut) throw new HttpFailure('timeout');
  };
  try {
    assertRequestActive();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;
    if (options.captchaToken) headers.token = options.captchaToken;
    const response = await fetch(url, {
      method: options.method ?? 'GET', headers, signal: controller.signal,
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
    assertRequestActive();
    if (response.status === UNAUTHORIZED && options.accessToken) {
      appStore.getState().logout();
      throw new HttpFailure('server-error', UNAUTHORIZED);
    }
    if (!response.ok) throw new HttpFailure('server-error', response.status);
    let body: unknown;
    try { body = await response.json(); }
    catch { throw new HttpFailure('invalid-response'); }
    assertRequestActive();
    const parsed = v.safeParse(responseEnvelopeSchema, body);
    if (!parsed.success) throw new HttpFailure('invalid-response');
    return parsed.output;
  } catch (error) {
    assertRequestActive();
    if (error instanceof HttpFailure) throw error;
    throw new HttpFailure(timedOut ? 'timeout' : 'network-unavailable');
  } finally {
    clearTimeout(timeout);
    scope.removeEventListener('abort', cancel);
    options.signal?.removeEventListener('abort', cancel);
  }
}
