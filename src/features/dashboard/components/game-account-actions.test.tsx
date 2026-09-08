import { fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { tamaguiConfig } from '../../../../tamagui.config';
import { GameAccountActions, type GameAccountActionsProps } from './game-account-actions';

async function renderActions(overrides: Partial<GameAccountActionsProps> = {}) {
  const props: GameAccountActionsProps = {
    account: 'G18928069156',
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
    expect(screen.getByText('G18928069156')).toBeTruthy();
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
});
