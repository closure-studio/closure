import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import type { ComponentProps } from 'react';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { mockArkHostGameListResponse } from '@/mocks/arkhost';
import { tamaguiConfig } from '../../../../tamagui.config';
import { GameHostingConfigView } from './game-hosting-config-view';

jest.mock('@/hooks/use-back-dismissal', () => ({
  useBackDismissal: jest.fn(),
}));

const gameAccountEntry = mockArkHostGameListResponse.code === 1
  ? mockArkHostGameListResponse.data[0]
  : undefined;

if (!gameAccountEntry) throw new Error('Expected a game account fixture.');
const gameAccountFixture = gameAccountEntry;

type SubmitPatch = Parameters<ComponentProps<typeof GameHostingConfigView>['onSubmit']>[0];

async function renderConfigView(overrides?: {
  onSubmit?: (patch: SubmitPatch) => Promise<void>;
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { gcTime: 0, retry: false },
    },
  });
  const onSubmit = overrides?.onSubmit ?? jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
  const screen = await render(
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <I18nextProvider i18n={i18n}>
          <GameHostingConfigView
            account={gameAccountFixture.status.account}
            config={gameAccountFixture.game_config}
            isSubmitting={false}
            onSubmit={onSubmit}
            showSuccess={false}
            submitError={null}
          />
        </I18nextProvider>
      </TamaguiProvider>
    </QueryClientProvider>,
  );
  return { onSubmit, screen };
}

describe('GameHostingConfigView', () => {
  it('renders overview summary cards with current game config values', async () => {
    const { screen } = await renderConfigView();

    expect(screen.getByTestId('hosting-config-card-keeping-ap')).toBeTruthy();
    expect(screen.getByTestId('hosting-config-card-recruit-reserve')).toBeTruthy();
    expect(screen.getByTestId('hosting-config-card-enable-building-arrange')).toBeTruthy();
    expect(screen.getByTestId('hosting-config-card-auto-battle')).toBeTruthy();
    expect(screen.getByTestId('hosting-config-card-ignore-robot')).toBeTruthy();
    expect(screen.getByTestId('hosting-config-card-allow-login-assist')).toBeTruthy();
    expect(screen.getByTestId('hosting-config-card-drone-acceleration')).toBeTruthy();
    expect(screen.getByTestId('hosting-config-card-battle-maps')).toBeTruthy();
  });

  it('opens Sanity editor and submits single keeping_ap patch', async () => {
    const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
    const { screen } = await renderConfigView({ onSubmit });

    await fireEvent.press(screen.getByTestId('hosting-config-card-keeping-ap'));
    expect(screen.getByTestId('hosting-config-keeping-ap')).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('hosting-config-keeping-ap'), '120');
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ keeping_ap: 120 });
  });

  it('uses stepper shortcuts in Sanity editor', async () => {
    const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
    const { screen } = await renderConfigView({ onSubmit });

    await fireEvent.press(screen.getByTestId('hosting-config-card-keeping-ap'));
    await fireEvent.press(screen.getByTestId('numeric-step-10'));
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));

    expect(onSubmit).toHaveBeenCalledWith({ keeping_ap: 10 });
  });

  it('opens Recruit Reserve editor and submits single recruit_reserve patch', async () => {
    const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
    const { screen } = await renderConfigView({ onSubmit });

    await fireEvent.press(screen.getByTestId('hosting-config-card-recruit-reserve'));
    await fireEvent.changeText(screen.getByTestId('hosting-config-recruit-reserve'), '5');
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ recruit_reserve: 5 });
  });

  it('opens Drone Acceleration editor and submits selected room slot', async () => {
    const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
    const { screen } = await renderConfigView({ onSubmit });

    await fireEvent.press(screen.getByTestId('hosting-config-card-drone-acceleration'));
    await fireEvent.press(screen.getByTestId('hosting-config-slot-bottomRight'));
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ accelerate_slot_cn: '底层右' });
  });

  it('opens Battle Queue editor, removes a stage, and submits updated battle_maps', async () => {
    const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
    const { screen } = await renderConfigView({ onSubmit });

    await fireEvent.press(screen.getByTestId('hosting-config-card-battle-maps'));
    expect(screen.getByTestId('queue-item-0')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('queue-remove-0'));
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      battle_maps: ['main_01-07', 'act24side_08'],
    });
  });

  it('does not submit invalid negative numeric values and displays validation error', async () => {
    const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
    const { screen } = await renderConfigView({ onSubmit });

    await fireEvent.press(screen.getByTestId('hosting-config-card-keeping-ap'));
    await fireEvent.changeText(screen.getByTestId('hosting-config-keeping-ap'), '-1');
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(i18n.t('dashboard:hostingConfig.submitValidation'))).toBeTruthy();
  });
});
