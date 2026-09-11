import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { mockArkHostGameDetails, mockArkHostGameListResponse } from '@/mocks/arkhost';
import type { ArkHostGameConfigPatch, ArkHostGameDetail } from '@/schemas/arkhost';
import type { GameAccount } from '@/schemas/game-account';
import { tamaguiConfig } from '../../../../tamagui.config';
import { arkHostQueryKeys } from '../queries';
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
const matchingFirstGameDetail = mockArkHostGameDetails.find(
  (detail) => detail.config.account === firstGameAccountEntry.status.account,
);
if (!matchingFirstGameDetail) throw new Error('Expected a matching Game Detail fixture.');
const firstGameDetail: ArkHostGameDetail = matchingFirstGameDetail;

const firstGameAccount: GameAccount = {
  account: firstGameAccountEntry.status.account,
  ap: firstGameAccountEntry.status.ap,
  avatar: firstGameAccountEntry.status.avatar,
  captchaInfo: firstGameAccountEntry.captcha_info,
  color: 'primary',
  createdAt: firstGameAccountEntry.status.created_at,
  isVerified: firstGameAccountEntry.status.is_verify,
  level: firstGameAccountEntry.status.level,
  nickname: firstGameAccountEntry.status.nick_name,
  platform: firstGameAccountEntry.status.platform,
  statusCode: firstGameAccountEntry.status.code,
  userId: firstGameAccountEntry.status.uuid,
};
const secondGameAccount: GameAccount = {
  account: secondGameAccountEntry.status.account,
  ap: secondGameAccountEntry.status.ap,
  avatar: secondGameAccountEntry.status.avatar,
  captchaInfo: secondGameAccountEntry.captcha_info,
  color: 'muted',
  createdAt: secondGameAccountEntry.status.created_at,
  isVerified: secondGameAccountEntry.status.is_verify,
  level: secondGameAccountEntry.status.level,
  nickname: secondGameAccountEntry.status.nick_name,
  platform: secondGameAccountEntry.status.platform,
  statusCode: secondGameAccountEntry.status.code,
  userId: secondGameAccountEntry.status.uuid,
};

const mockMutateAsync = jest.fn((_patch: ArkHostGameConfigPatch) => Promise.resolve(undefined));
const mockUseUpdateGameConfig = jest.fn((_account: string) => ({
  error: null,
  mutateAsync: mockMutateAsync,
  status: 'idle',
}));

jest.mock('../queries', () => ({
  ...jest.requireActual<typeof import('../queries')>('../queries'),
  useUpdateGameConfig: (account: string) => mockUseUpdateGameConfig(account),
}));

function renderScreen(
  gameAccount: GameAccount = firstGameAccount,
  detail: ArkHostGameDetail | null = firstGameDetail,
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { gcTime: 0, retry: false, staleTime: Infinity },
    },
  });
  queryClient.setQueryData(arkHostQueryKeys.detail(gameAccount.account), detail);
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
    mockMutateAsync.mockClear();
    mockUseUpdateGameConfig.mockClear();
  });

  it('connects the selected account to the existing config mutation', async () => {
    const screen = await renderScreen(firstGameAccount, {
      ...firstGameDetail,
      config: { ...firstGameDetail.config, keeping_ap: 7 },
    });

    await fireEvent.press(screen.getByTestId('hosting-config-card-keeping-ap'));
    await fireEvent.press(screen.getByTestId('numeric-step-increase'));
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));

    await waitFor(() => {
      expect(mockUseUpdateGameConfig).toHaveBeenCalledWith(firstGameAccount.account);
      expect(mockMutateAsync).toHaveBeenCalledWith({ keeping_ap: 8 });
    });
  });

  it('treats a missing detail as unavailable instead of falling back to list config', async () => {
    const screen = await renderScreen(firstGameAccount, null);

    expect(screen.queryByTestId('game-hosting-config-view')).toBeNull();
    expect(screen.getByText(
      i18n.t('hostingConfig.errors.unavailable', { ns: 'dashboard' }),
    )).toBeTruthy();
    expect(screen.getByText(i18n.t('actions.retry', { ns: 'common' }))).toBeTruthy();
  });

  it('binds the mutation and reads the new account building when selection changes', async () => {
    const screen = await renderScreen();
    expect(mockUseUpdateGameConfig).toHaveBeenCalledWith(firstGameAccount.account);
    await fireEvent.press(screen.getByTestId('hosting-config-card-drone-acceleration'));
    await waitFor(() => {
      expect(screen.getByTestId('hosting-config-slot-slot_5')).toHaveAccessibleName(
        new RegExp(i18n.t('hostingConfig.roomTypes.trading', { ns: 'dashboard' })),
      );
    });

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
      expect(mockUseUpdateGameConfig).toHaveBeenCalledWith(secondGameAccount.account);
      expect(screen.getByTestId('hosting-config-card-drone-acceleration')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('hosting-config-card-drone-acceleration'));
    expect(screen.getByTestId('hosting-config-slot-slot_5')).toHaveAccessibleName(
      new RegExp(i18n.t('hostingConfig.roomTypes.power', { ns: 'dashboard' })),
    );
  });
});
