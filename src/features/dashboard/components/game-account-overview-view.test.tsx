import { render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import * as v from 'valibot';

import { i18n } from '@/i18n';
import { mockArkHostGameListResponse } from '@/mocks/arkhost';
import { gameAccountSchema } from '@/schemas/game-account';
import { tamaguiConfig } from '../../../../tamagui.config';
import { GameAccountOverviewView } from './game-account-overview-view';

jest.mock('expo-image', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    Image: (props: { [key: string]: unknown }) => <View {...props} />,
  };
});

const gameAccountEntry = mockArkHostGameListResponse.code === 1
  ? mockArkHostGameListResponse.data[0]
  : undefined;

if (!gameAccountEntry) throw new Error('Expected a Game Account fixture.');

const gameAccount = v.parse(gameAccountSchema, {
  account: gameAccountEntry.status.account,
  ap: gameAccountEntry.status.ap,
  avatar: gameAccountEntry.status.avatar,
  captchaInfo: gameAccountEntry.captcha_info,
  color: 'primary',
  config: gameAccountEntry.game_config,
  createdAt: gameAccountEntry.status.created_at,
  isVerified: gameAccountEntry.status.is_verify,
  level: gameAccountEntry.status.level,
  nickname: gameAccountEntry.status.nick_name,
  platform: gameAccountEntry.status.platform,
  statusCode: gameAccountEntry.status.code,
  statusText: gameAccountEntry.status.text,
  userId: gameAccountEntry.status.uuid,
});

describe('GameAccountOverviewView', () => {
  it('keeps the profile column within the small-screen content width', async () => {
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <I18nextProvider i18n={i18n}>
          <GameAccountOverviewView
            detail={null}
            gameAccount={gameAccount}
            logs={[]}
            stageSubtitle={undefined}
            stageTitle="—"
          />
        </I18nextProvider>
      </TamaguiProvider>,
    );

    expect(StyleSheet.flatten(screen.getByTestId('overview-profile-column').props.style)).toEqual(
      expect.objectContaining({ width: '100%' }),
    );
  });
});
