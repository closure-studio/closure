import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { mockArkHostGameListResponse } from '@/mocks/arkhost';
import type { ArkHostGameConfigPatch } from '@/schemas/arkhost';
import type { GameAccount } from '@/schemas/game-account';
import { tamaguiConfig } from '../../../../tamagui.config';
import { GameHostingConfigScreen } from './game-hosting-config-screen';

jest.mock('@/hooks/use-back-dismissal', () => ({
  useBackDismissal: jest.fn(),
}));

const gameAccountEntries = mockArkHostGameListResponse.code === 1
  ? mockArkHostGameListResponse.data
  : [];
const firstGameAccountEntry = gameAccountEntries[0];
const secondGameAccountEntry = gameAccountEntries[1];

if (!firstGameAccountEntry || !secondGameAccountEntry) throw new Error('Expected two game account fixtures.');

const firstGameAccount: GameAccount = {
  account: firstGameAccountEntry.status.account,
  ap: firstGameAccountEntry.status.ap,
  avatar: firstGameAccountEntry.status.avatar,
  captchaInfo: firstGameAccountEntry.captcha_info,
  color: 'primary',
  config: firstGameAccountEntry.game_config,
  createdAt: firstGameAccountEntry.status.created_at,
  isVerified: firstGameAccountEntry.status.is_verify,
  level: firstGameAccountEntry.status.level,
  nickname: firstGameAccountEntry.status.nick_name,
  platform: firstGameAccountEntry.status.platform,
  statusCode: firstGameAccountEntry.status.code,
  statusText: firstGameAccountEntry.status.text,
  userId: firstGameAccountEntry.status.uuid,
};
const secondGameAccount: GameAccount = {
  account: secondGameAccountEntry.status.account,
  ap: secondGameAccountEntry.status.ap,
  avatar: secondGameAccountEntry.status.avatar,
  captchaInfo: secondGameAccountEntry.captcha_info,
  color: 'muted',
  config: secondGameAccountEntry.game_config,
  createdAt: secondGameAccountEntry.status.created_at,
  isVerified: secondGameAccountEntry.status.is_verify,
  level: secondGameAccountEntry.status.level,
  nickname: secondGameAccountEntry.status.nick_name,
  platform: secondGameAccountEntry.status.platform,
  statusCode: secondGameAccountEntry.status.code,
  statusText: secondGameAccountEntry.status.text,
  userId: secondGameAccountEntry.status.uuid,
};

type MutationInput = {
  account: string;
  patch: ArkHostGameConfigPatch;
};

const mockResetMutation = jest.fn();
const mockMutateAsync = jest.fn((_input: MutationInput) => Promise.resolve(undefined));

jest.mock('../queries', () => ({
  useUpdateGameConfig: () => ({
    error: null,
    mutateAsync: mockMutateAsync,
    reset: mockResetMutation,
    status: 'idle',
  }),
}));

function renderScreen(gameAccount: GameAccount = firstGameAccount) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { gcTime: 0, retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <I18nextProvider i18n={i18n}>
          <GameHostingConfigScreen gameAccount={gameAccount} />
        </I18nextProvider>
      </TamaguiProvider>
    </QueryClientProvider>,
  );
}

describe('GameHostingConfigScreen', () => {
  beforeEach(() => {
    mockResetMutation.mockClear();
    mockMutateAsync.mockClear();
  });

  it('connects the selected account to the existing config mutation', async () => {
    const screen = await renderScreen();

    await fireEvent.press(screen.getByTestId('hosting-config-card-keeping-ap'));
    await fireEvent.changeText(screen.getByTestId('hosting-config-keeping-ap'), '8');
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));

    await waitFor(() => {
      const input = mockMutateAsync.mock.calls[0]?.[0];
      expect(input?.account).toBe(firstGameAccount.account);
      expect(input?.patch.keeping_ap).toBe(8);
    });
  });

  it('resets the mutation when the selected account changes', async () => {
    const screen = await renderScreen();
    expect(mockResetMutation).toHaveBeenCalled();

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { gcTime: 0, retry: false },
      },
    });
    await screen.rerender(
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
          <I18nextProvider i18n={i18n}>
            <GameHostingConfigScreen gameAccount={secondGameAccount} />
          </I18nextProvider>
        </TamaguiProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(mockResetMutation).toHaveBeenCalledTimes(2);
    });
  });
});
