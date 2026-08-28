import { render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
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
  it('uses the shared translucent surface by default', async () => {
    const screen = await render(<FrameFixture />);

    expect(StyleSheet.flatten(screen.getByTestId('frame').props.style)).toEqual(
      expect.objectContaining({ backgroundColor: 'rgba(29, 32, 34, 0.40)' }),
    );
  });

  it('lets an explicit tone override the shared translucent surface', async () => {
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <Frame testID="warning-frame" tone="warning">
          <Text>Content</Text>
        </Frame>
      </TamaguiProvider>,
    );

    expect(StyleSheet.flatten(screen.getByTestId('warning-frame').props.style)).toEqual(
      expect.objectContaining({ backgroundColor: 'rgba(255, 157, 54, 0.05)' }),
    );
  });

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
