import { act, renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { SettingsMockProvider, useSettingsMockState } from './settings-mock-context';

function SettingsMockTestProvider({ children }: PropsWithChildren) {
  return <SettingsMockProvider>{children}</SettingsMockProvider>;
}

describe('SettingsMockProvider', () => {
  it('keeps the selected API Node while its routed child changes', async () => {
    const { rerender, result } = await renderHook(
      ({ pageId }: { pageId: string }) => ({ pageId, settings: useSettingsMockState() }),
      {
        initialProps: { pageId: 'network' },
        wrapper: SettingsMockTestProvider,
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
