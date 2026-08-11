import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { UiSettingsProvider, useUiSettings } from './ui-settings-provider';

let mockMediaMd = false;

jest.mock('tamagui', () => ({
  useMedia: () => ({ md: mockMediaMd }),
}));

function LayoutSizeProbe() {
  const { layoutSize } = useUiSettings();
  return <Text>{layoutSize}</Text>;
}

describe('UiSettingsProvider', () => {
  it.each([
    { mediaMd: false, layoutSize: 'small' },
    { mediaMd: true, layoutSize: 'large' },
  ] as const)('derives $layoutSize from Tamagui md=$mediaMd', async ({ layoutSize, mediaMd }) => {
    mockMediaMd = mediaMd;

    await render(
      <UiSettingsProvider>
        <LayoutSizeProbe />
      </UiSettingsProvider>,
    );

    expect(screen.getByText(layoutSize)).toBeTruthy();
  });
});
