import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import { tamaguiConfig } from '../../../../tamagui.config';
import { Frame } from './frame';

function FrameFixture({ selected }: { selected?: boolean }) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <Frame testID="frame" {...(selected === undefined ? {} : { selected })}>
        <Text>Content</Text>
      </Frame>
    </TamaguiProvider>
  );
}

describe('Frame', () => {
  it('renders four corner brackets only in the selected state', async () => {
    const screen = await render(<FrameFixture selected />);

    expect(screen.getByTestId('frame-corner-top-left')).toBeTruthy();
    expect(screen.getByTestId('frame-corner-top-right')).toBeTruthy();
    expect(screen.getByTestId('frame-corner-bottom-left')).toBeTruthy();
    expect(screen.getByTestId('frame-corner-bottom-right')).toBeTruthy();

    await screen.rerender(<FrameFixture selected={false} />);

    expect(screen.queryByTestId('frame-corner-top-left')).toBeNull();
    expect(screen.queryByTestId('frame-corner-top-right')).toBeNull();
    expect(screen.queryByTestId('frame-corner-bottom-left')).toBeNull();
    expect(screen.queryByTestId('frame-corner-bottom-right')).toBeNull();
  });

  it('keeps the legacy corner bracket option available for static frames', async () => {
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <Frame testID="legacy-frame" cornerBrackets>
          <Text>Content</Text>
        </Frame>
      </TamaguiProvider>,
    );

    expect(screen.getByTestId('legacy-frame-corner-top-left')).toBeTruthy();
  });
});
