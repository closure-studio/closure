import { fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { tamaguiConfig } from '../../../../tamagui.config';
import {
  GameAccountSwitcher,
  resolveScrollOffsetToRevealItem,
} from './dashboard-navigation';
import { mockArkHostGameListResponse } from '../api';

const initialGameAccounts = mockArkHostGameListResponse.code === 1
  ? mockArkHostGameListResponse.data.map((entry, index) => ({
    account: entry.status.account,
    ap: entry.status.ap,
    avatar: entry.status.avatar,
    captchaInfo: entry.captcha_info,
    color: index === 1 ? 'warning' as const : 'primary' as const,
    config: entry.game_config,
    createdAt: entry.status.created_at,
    isVerified: entry.status.is_verify,
    level: entry.status.level,
    nickname: entry.status.nick_name,
    platform: entry.status.platform,
    statusCode: entry.status.code,
    statusText: entry.status.text,
    userId: entry.status.uuid,
  }))
  : [];

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
  const onSelectGameAccount = jest.fn();
  const screen = await render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <GameAccountSwitcher
          gameAccounts={initialGameAccounts.slice(0, 2)}
          activeGameAccountId="G18928069156"
          onSelectGameAccount={onSelectGameAccount}
        />
      </I18nextProvider>
    </TamaguiProvider>,
  );

  return { onSelectGameAccount, screen };
}

describe('GameAccountSwitcher', () => {
  it('uses shared selected, inactive, and neutral button scales', async () => {
    const { screen } = await renderGameAccountSwitcher();

    expect(screen.getByTestId('game-account-option-G18928069156')).toHaveStyle({
      transform: [{ scale: 1 }, { scale: 1 }],
    });
    expect(screen.getByTestId('game-account-option-G16601716973')).toHaveStyle({
      transform: [{ scale: 1 }, { scale: 0.985 }],
    });
  });

  it('reports account selection without exposing local account creation', async () => {
    const { onSelectGameAccount, screen } = await renderGameAccountSwitcher();

    await fireEvent.press(screen.getByTestId('game-account-option-G16601716973'));

    expect(onSelectGameAccount).toHaveBeenCalledWith('G16601716973');
    expect(screen.queryByTestId('link-game-account-option')).toBeNull();
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
