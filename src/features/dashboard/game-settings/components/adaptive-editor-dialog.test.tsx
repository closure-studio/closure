import { fireEvent, render } from '@testing-library/react-native';
import { setMediaState } from '@tamagui/web';
import { Button, TamaguiProvider, YStack } from 'tamagui';

import { tamaguiConfig } from '../../../../../tamagui.config';
import { AdaptiveEditorDialog } from './adaptive-editor-dialog';

jest.mock('@/hooks/use-back-dismissal', () => ({
  useBackDismissal: jest.fn(),
}));

async function renderEditor(large: boolean) {
  setMediaState({ large });
  const screen = await render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <AdaptiveEditorDialog trigger={<Button testID="open-editor">Open</Button>}>
        {(close) => <YStack testID="editor-content" onPress={close} />}
      </AdaptiveEditorDialog>
    </TamaguiProvider>,
  );

  await fireEvent.press(screen.getByTestId('open-editor'));
  return screen;
}

describe('AdaptiveEditorDialog', () => {
  it.each([
    { large: false, visibleContainer: 'hosting-config-sheet', hiddenContainer: 'hosting-config-dialog' },
    { large: true, visibleContainer: 'hosting-config-dialog', hiddenContainer: 'hosting-config-sheet' },
  ])('renders the editor in the responsive container', async ({ hiddenContainer, large, visibleContainer }) => {
    const screen = await renderEditor(large);

    expect(screen.getByTestId('editor-content')).toBeTruthy();
    expect(screen.getByTestId(visibleContainer)).toBeTruthy();
    expect(screen.queryByTestId(hiddenContainer)).toBeNull();
    await screen.unmount();
  });
});
