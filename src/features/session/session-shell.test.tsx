import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Button, TamaguiProvider, YStack } from 'tamagui';

import { tamaguiConfig } from '../../../tamagui.config';
import {
  SessionShell,
  useSessionBackdrop,
} from './components/session-shell';

type MotionFieldProps = {
  height: number;
  secondaryTint: string;
  tint: string;
  width: number;
};

const mockTerminalMotionField = jest.fn((_props: MotionFieldProps) => null);
const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, right: 0, bottom: 34, left: 0 },
};

jest.mock('@/components/ui/motion/terminal-motion-field', () => ({
  TerminalMotionField: (props: MotionFieldProps) => mockTerminalMotionField(props),
}));

function BackdropTintControl({ page }: { page: string }) {
  const { setBackdropTint } = useSessionBackdrop();

  return (
    <YStack testID={`${page}-content`}>
      <Button
        aria-label="Change backdrop tint"
        onPress={() => setBackdropTint('#ff9d36')}
      />
    </YStack>
  );
}

function SessionTestTree({ page }: { page: string }) {
  return (
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <SessionShell>
          <BackdropTintControl page={page} />
        </SessionShell>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}

describe('SessionShell backdrop ownership', () => {
  beforeEach(() => {
    mockTerminalMotionField.mockClear();
  });

  it('keeps one backdrop instance and its tint while routed content changes', async () => {
    const screen = await render(<SessionTestTree page="dashboard" />);

    expect(screen.getAllByTestId('session-backdrop')).toHaveLength(1);
    expect(screen.getByTestId('dashboard-content')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Change backdrop tint' }));
    await waitFor(() => {
      expect(mockTerminalMotionField).toHaveBeenLastCalledWith(expect.objectContaining({
        tint: '#ff9d36',
      }));
    });

    await screen.rerender(<SessionTestTree page="settings" />);

    expect(screen.getAllByTestId('session-backdrop')).toHaveLength(1);
    expect(screen.getByTestId('settings-content')).toBeTruthy();
    expect(mockTerminalMotionField).toHaveBeenLastCalledWith(expect.objectContaining({
      tint: '#ff9d36',
    }));
  });
});
