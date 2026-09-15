import { appStore } from '@/store';

let controller = new AbortController();

// Session and node transitions invalidate requests, not adapter instances.
appStore.subscribe((state, previous) => {
  if (state.auth.session === previous.auth.session
    && state.selectedApiNodeId === previous.selectedApiNodeId) return;
  const old = controller;
  controller = new AbortController();
  old.abort();
});

export function requestScope(): AbortSignal {
  return controller.signal;
}

export function assertActive(signal: AbortSignal): void {
  if (signal.aborted) throw new Error('Request cancelled');
}

export async function inRequestScope<T>(operation: () => Promise<T>, signal = requestScope()): Promise<T> {
  assertActive(signal);
  const result = await operation();
  assertActive(signal);
  return result;
}
