import { mockActiveSession } from '@/mocks/auth';
import { appStore } from '@/store';
import { inRequestScope, requestScope } from './request-scope';

beforeEach(() => {
  appStore.getState().logout();
  appStore.getState().selectApiNode('domestic');
});

it('invalidates pending work even when switching away and back to the same node', async () => {
  let complete: (value: string) => void = () => { throw new Error('Not started'); };
  const pending = inRequestScope(() => new Promise<string>((resolve) => { complete = resolve; }));

  appStore.getState().selectApiNode('overseas');
  appStore.getState().selectApiNode('domestic');
  complete('old session');

  await expect(pending).rejects.toThrow('cancelled');
});

it('aborts credentials on logout and preserves the endpoint preference', () => {
  appStore.getState().setSession(mockActiveSession);
  appStore.getState().selectApiNode('overseas');
  const scope = requestScope();

  appStore.getState().logout();

  expect(scope.aborted).toBe(true);
  expect(appStore.getState().selectedApiNodeId).toBe('overseas');
});
