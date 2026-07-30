import { fireEvent, render } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';

import { TerminalCheckbox } from '@/components';
import { tamaguiConfig } from '../tamagui.config';

jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated'),
  useReducedMotion: () => true,
}));

async function renderTerminalCheckbox({
  checked = true,
  disabled = false,
  onCheckedChange = jest.fn(),
}: Partial<React.ComponentProps<typeof TerminalCheckbox>> = {}) {
  const screen = await render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <TerminalCheckbox
        id="terminal-checkbox"
        label="Keep connected"
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </TamaguiProvider>,
  );

  return { onCheckedChange, screen };
}

describe('TerminalCheckbox', () => {
  it('reports boolean checked state changes', async () => {
    const { onCheckedChange, screen } = await renderTerminalCheckbox();

    await fireEvent.press(screen.getByRole('checkbox'));

    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it('does not report state changes when disabled', async () => {
    const { onCheckedChange, screen } = await renderTerminalCheckbox({ disabled: true });

    await fireEvent.press(screen.getByRole('checkbox'));

    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
