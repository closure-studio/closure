import { fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { tamaguiConfig } from '../../../tamagui.config';
import {
  GameAccountSwitcher,
  resolveScrollOffsetToRevealItem,
} from './components/dashboard-navigation';
import { initialGameAccounts } from './mocks/game-accounts';

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');

  return {
    ...reanimated,
    ...reanimatedMock,
    useReducedMotion: () => true,
  };
});

async function renderGameAccountSwitcher() {
  const onLinkGameAccount = jest.fn();
  const onSelectGameAccount = jest.fn();
  const screen = await render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <GameAccountSwitcher
          gameAccounts={initialGameAccounts.slice(0, 2)}
          activeGameAccountId="acc-01"
          onSelectGameAccount={onSelectGameAccount}
          onLinkGameAccount={onLinkGameAccount}
        />
      </I18nextProvider>
    </TamaguiProvider>,
  );

  return { onLinkGameAccount, onSelectGameAccount, screen };
}

describe('GameAccountSwitcher', () => {
  it('uses shared selected, inactive, and neutral button scales', async () => {
    const { screen } = await renderGameAccountSwitcher();

    expect(screen.getByTestId('game-account-option-acc-01')).toHaveStyle({
      transform: [{ scale: 1 }, { scale: 1 }],
    });
    expect(screen.getByTestId('game-account-option-acc-02')).toHaveStyle({
      transform: [{ scale: 1 }, { scale: 0.985 }],
    });
    expect(screen.getByTestId('link-game-account-option')).toHaveStyle({
      transform: [{ scale: 1 }, { scale: 1 }],
    });
  });

  it('reports account selection and link actions', async () => {
    const { onLinkGameAccount, onSelectGameAccount, screen } = await renderGameAccountSwitcher();

    await fireEvent.press(screen.getByTestId('game-account-option-acc-02'));
    await fireEvent.press(screen.getByTestId('link-game-account-option'));

    expect(onSelectGameAccount).toHaveBeenCalledWith('acc-02');
    expect(onLinkGameAccount).toHaveBeenCalledTimes(1);
  });
});

describe('resolveScrollOffsetToRevealItem', () => {
  it('does not scroll when the active item is already visible', () => {
    expect(resolveScrollOffsetToRevealItem({
      itemLayout: { width: 100, x: 120 },
      scrollOffset: 100,
      viewportWidth: 320,
    })).toBeNull();
  });

  it('reveals items hidden before or after the viewport', () => {
    expect(resolveScrollOffsetToRevealItem({
      itemLayout: { width: 100, x: 40 },
      scrollOffset: 80,
      viewportWidth: 240,
    })).toBe(40);
    expect(resolveScrollOffsetToRevealItem({
      itemLayout: { width: 100, x: 300 },
      scrollOffset: 80,
      viewportWidth: 240,
    })).toBe(160);
  });

  it('waits for a measured viewport', () => {
    expect(resolveScrollOffsetToRevealItem({
      itemLayout: { width: 100, x: 300 },
      scrollOffset: 0,
      viewportWidth: 0,
    })).toBeNull();
  });
});
