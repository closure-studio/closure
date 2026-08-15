import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { useLayoutSize } from './layout-size-provider';

let mockMediaMd = false;

jest.mock('tamagui', () => ({
  useMedia: () => ({ md: mockMediaMd }),
}));

function LayoutSizeProbe() {
  const layoutSize = useLayoutSize();
  return <Text>{layoutSize}</Text>;
}

describe('useLayoutSize', () => {
  it.each([
    { mediaMd: false, layoutSize: 'small' },
    { mediaMd: true, layoutSize: 'large' },
  ] as const)('projects Tamagui md=$mediaMd to $layoutSize', async ({ layoutSize, mediaMd }) => {
    mockMediaMd = mediaMd;

    await render(<LayoutSizeProbe />);

    expect(screen.getByText(layoutSize)).toBeTruthy();
  });
});
