import { fireEvent, render } from '@testing-library/react-native';
import { setMediaState } from '@tamagui/web';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { tamaguiConfig } from '../../../../tamagui.config';
import { GameAccountActions, type GameAccountActionsProps } from './game-account-actions';

async function renderActions(overrides: Partial<GameAccountActionsProps> = {}) {
  const props: GameAccountActionsProps = {
    account: 'G00000000001',
    nickname: 'Doctor',
    onDelete: jest.fn(),
    onToggle: jest.fn(),
    statusCode: 2,
    ...overrides,
  };
  const screen = await render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <GameAccountActions {...props} />
      </I18nextProvider>
    </TamaguiProvider>,
  );
  return { props, screen };
}

describe('GameAccountActions', () => {
  beforeEach(() => {
    setMediaState({ large: false });
  });

  it('shows pause for a running game and start for a stopped game', async () => {
    const running = await renderActions();
    expect(running.screen.getByText(i18n.t('dashboard:overview.actions.pause'))).toBeTruthy();
    await fireEvent.press(running.screen.getByTestId('overview-toggle-game'));
    expect(running.props.onToggle).toHaveBeenCalledTimes(1);
    await running.screen.unmount();

    const stopped = await renderActions({ statusCode: 0 });
    expect(stopped.screen.getByText(i18n.t('dashboard:overview.actions.start'))).toBeTruthy();
    await stopped.screen.unmount();
  });

  it('shows the matching pending label and disables account actions', async () => {
    const { screen } = await renderActions({ actionPending: true, statusCode: 0 });

    expect(screen.getByText(i18n.t('dashboard:overview.actions.starting'))).toBeTruthy();
    expect(screen.getByTestId('overview-toggle-game')).toBeDisabled();
    expect(screen.getByTestId('overview-delete-game')).toBeDisabled();
    await screen.unmount();
  });

  it('requires confirmation before deleting the account', async () => {
    const onDelete = jest.fn();
    const { screen } = await renderActions({ onDelete });

    await fireEvent.press(screen.getByTestId('overview-delete-game'));
    expect(screen.getByText('Doctor')).toBeTruthy();
    expect(screen.getByText('G00000000001')).toBeTruthy();
    expect(onDelete).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('overview-confirm-delete'));
    expect(onDelete).toHaveBeenCalledTimes(1);
    await screen.unmount();
  });

  it('cancels deletion without invoking the callback', async () => {
    const onDelete = jest.fn();
    const { screen } = await renderActions({ onDelete });

    await fireEvent.press(screen.getByTestId('overview-delete-game'));
    await fireEvent.press(screen.getByTestId('overview-cancel-delete'));
    expect(onDelete).not.toHaveBeenCalled();
    await screen.unmount();
  });

  it.each([
    { large: false, visibleContainer: 'overview-delete-sheet', hiddenContainer: 'overview-delete-dialog' },
    { large: true, visibleContainer: 'overview-delete-dialog', hiddenContainer: 'overview-delete-sheet' },
  ])('renders delete confirmation in the responsive container', async ({ hiddenContainer, large, visibleContainer }) => {
    setMediaState({ large });
    const { screen } = await renderActions();

    await fireEvent.press(screen.getByTestId('overview-delete-game'));

    expect(screen.getByTestId(visibleContainer)).toBeTruthy();
    expect(screen.queryByTestId(hiddenContainer)).toBeNull();
    await screen.unmount();
  });
});
