import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { LayoutSizeProvider, useLayoutSize } from './layout-size-provider';

let mockMediaMd = false;

jest.mock('tamagui', () => ({
  useMedia: () => ({ md: mockMediaMd }),
}));

function LayoutSizeProbe() {
  const layoutSize = useLayoutSize();
  return <Text>{layoutSize}</Text>;
}

describe('LayoutSizeProvider', () => {
  it.each([
    { mediaMd: false, layoutSize: 'small' },
    { mediaMd: true, layoutSize: 'large' },
  ] as const)('derives $layoutSize from Tamagui md=$mediaMd', async ({ layoutSize, mediaMd }) => {
    mockMediaMd = mediaMd;

    await render(
      <LayoutSizeProvider>
        <LayoutSizeProbe />
      </LayoutSizeProvider>,
    );

    expect(screen.getByText(layoutSize)).toBeTruthy();
  });
});
