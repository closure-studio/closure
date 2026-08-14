import { fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { tamaguiConfig } from '../../../../../tamagui.config';
import { mockApiNodes } from '@/mocks/api-node';
import { NetworkSettingsScreen } from './network-settings-screen';
import type { ApiNodeId } from '@/schemas/api-node';

jest.mock('@/providers/layout-size-provider', () => ({
  useLayoutSize: () => 'small',
}));

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');

  return {
    ...reanimated,
    ...reanimatedMock,
    useReducedMotion: () => true,
  };
});

async function renderNetworkSettings() {
  const onRefresh = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
  function NetworkTestHarness() {
    const [selectedApiNodeId, setSelectedApiNodeId] = useState<ApiNodeId>('domestic');
    return (
      <NetworkSettingsScreen
        nodes={mockApiNodes}
        onRefresh={onRefresh}
        onSelectApiNode={setSelectedApiNodeId}
        queryError={null}
        queryStatus="success"
        selectedApiNodeId={selectedApiNodeId}
      />
    );
  }
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <NetworkTestHarness />
      </I18nextProvider>
    </TamaguiProvider>,
  );
}

describe('NetworkSettingsScreen API Node selection', () => {
  it('keeps RadioGroup selection behavior while using the shared scale states', async () => {
    const screen = await renderNetworkSettings();
    const domesticOption = screen.getByTestId('api-node-option-domestic');
    const overseasOption = screen.getByTestId('api-node-option-overseas');

    expect(domesticOption).toHaveStyle({ transform: [{ scale: 1 }, { scale: 1 }] });
    expect(overseasOption).toHaveStyle({ transform: [{ scale: 1 }, { scale: 0.985 }] });

    await fireEvent.press(overseasOption);

    expect(screen.getByTestId('api-node-option-domestic')).toHaveStyle({
      transform: [{ scale: 1 }, { scale: 0.985 }],
    });
    expect(screen.getByTestId('api-node-option-overseas')).toHaveStyle({
      transform: [{ scale: 1 }, { scale: 1 }],
    });
    expect(screen.getByTestId('api-node-option-overseas').props['aria-checked']).toBe(true);
    expect(screen.getByRole('radio', {
      name: i18n.t('settings:network.nodes.overseas'),
    })).toBeTruthy();
  });
});
