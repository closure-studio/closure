import { appStore } from '@/store';
import {
  finishVerification,
  getVerificationRequest,
  runVerification,
  subscribeVerification,
} from './verification-runtime';
import { acceptVerificationMessage } from './verification-message';
import type { VerificationRequest } from '@/schemas/verification';

function cancelActiveVerification(): void {
  const request = getVerificationRequest();
  if (request) finishVerification(request, null);
}

beforeEach(() => { cancelActiveVerification(); appStore.getState().selectApiNode('domestic'); });
afterEach(cancelActiveVerification);

it('cancels verification on node change and ignores old bridge messages', async () => {
  const first: VerificationRequest = { kind: 'google' };
  const old = runVerification(first);
  const rejected = expect(old).rejects.toThrow('cancelled');
  appStore.getState().selectApiNode('overseas');
  await rejected;
  const second: VerificationRequest = { kind: 'google' };
  const current = runVerification(second);
  acceptVerificationMessage({ ok: true, result: 'old-token' }, first);
  expect(getVerificationRequest()).toBe(second);
  acceptVerificationMessage({ ok: true, result: 'new-token' }, second);
  await expect(current).resolves.toBe('new-token');
});

it('uses the owning operation signal to cancel registration verification', async () => {
  const controller = new AbortController();
  const request: VerificationRequest = {
    kind: 'registration',
    email: 'doctor@example.com',
    password: 'password123',
  };
  const pending = runVerification(request, controller.signal);
  expect(getVerificationRequest()).toBe(request);

  controller.abort();

  await expect(pending).rejects.toThrow('cancelled');
  expect(getVerificationRequest()).toBeNull();
});

it('rejects invalid bridge payloads and releases the active window', async () => {
  const request: VerificationRequest = { kind: 'google' };
  const pending = runVerification(request);
  acceptVerificationMessage('{bad-json', request);
  await expect(pending).rejects.toThrow('cancelled');
  expect(getVerificationRequest()).toBeNull();
});

it('ignores completion from a stale transaction', async () => {
  const firstRequest: VerificationRequest = { kind: 'google' };
  const first = runVerification(firstRequest);
  finishVerification(firstRequest, 'first-token');
  await expect(first).resolves.toBe('first-token');

  const secondRequest: VerificationRequest = { kind: 'google' };
  const second = runVerification(secondRequest);
  finishVerification(firstRequest, null);

  expect(getVerificationRequest()).toBe(secondRequest);
  finishVerification(secondRequest, 'second-token');
  await expect(second).resolves.toBe('second-token');
});

it('notifies feature subscribers when the active transaction changes', async () => {
  const snapshots: (VerificationRequest | null)[] = [];
  const unsubscribe = subscribeVerification(() => {
    snapshots.push(getVerificationRequest());
  });
  const request: VerificationRequest = { kind: 'google' };

  const pending = runVerification(request);
  finishVerification(request, 'token');

  await expect(pending).resolves.toBe('token');
  expect(snapshots).toEqual([request, null]);
  unsubscribe();
});
