import { act, renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { ApiNodeMockProvider, useApiNodeMockState } from './api-node-mock-context';

function ApiNodeMockTestProvider({ children }: PropsWithChildren) {
  return <ApiNodeMockProvider>{children}</ApiNodeMockProvider>;
}

describe('ApiNodeMockProvider', () => {
  it('keeps the selected API Node while its routed child changes', async () => {
    const { rerender, result } = await renderHook(
      ({ pageId }: { pageId: string }) => ({ pageId, settings: useApiNodeMockState() }),
      {
        initialProps: { pageId: 'network' },
        wrapper: ApiNodeMockTestProvider,
      },
    );

    await act(() => {
      result.current.settings.selectApiNode('overseas');
    });
    await rerender({ pageId: 'account' });
    await rerender({ pageId: 'network' });

    expect(result.current.pageId).toBe('network');
    expect(result.current.settings.selectedApiNodeId).toBe('overseas');
  });
});
