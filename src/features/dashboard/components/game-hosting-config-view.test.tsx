import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import type { ComponentProps } from 'react';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { mockArkHostGameDetails, mockArkHostGameListResponse } from '@/mocks/arkhost';
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
  rooms?: ComponentProps<typeof GameHostingConfigView>['rooms'];
  config?: ComponentProps<typeof GameHostingConfigView>['config'];
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
            rooms={overrides?.rooms ?? mockArkHostGameDetails[0]?.building?.rooms}
            config={overrides?.config ?? gameAccountFixture.game_config}
            isSubmitting={false}
            onSubmit={onSubmit}
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

    expect(screen.queryByText(gameAccountFixture.status.account)).toBeNull();
    expect(screen.queryByText('GAME-CONFIG')).toBeNull();
    expect(screen.getByTestId('hosting-config-card-keeping-ap')).toBeTruthy();
    expect(screen.getByTestId('hosting-config-card-recruit-reserve')).toBeTruthy();
    expect(screen.getByTestId('hosting-config-card-enable-building-arrange')).toBeTruthy();
    expect(screen.getByTestId('hosting-config-card-auto-battle')).toBeTruthy();
    expect(screen.getByTestId('hosting-config-card-ignore-robot')).toBeTruthy();
    expect(screen.getByTestId('hosting-config-card-allow-login-assist')).toBeTruthy();
    expect(screen.getByTestId('hosting-config-card-drone-acceleration')).toBeTruthy();
    expect(screen.getByTestId('hosting-config-card-battle-maps')).toBeTruthy();
  });

  it('shows concise guidance on cards and detailed behavior in the editor', async () => {
    const { screen } = await renderConfigView();
    const summaryKeys = [
      'hostingConfig.summaries.keepingAp',
      'hostingConfig.summaries.recruitReserve',
      'hostingConfig.summaries.enableBuildingArrange',
      'hostingConfig.summaries.isAutoBattle',
      'hostingConfig.summaries.recruitIgnoreRobot',
      'hostingConfig.summaries.allowLoginAssist',
      'hostingConfig.summaries.droneAcceleration',
      'hostingConfig.summaries.battleMaps',
    ] as const;
    const battleDescription = i18n.t('hostingConfig.descriptions.battleMaps', {
      ns: 'dashboard',
    });
    const droneSummary = i18n.t('hostingConfig.summaries.droneAcceleration', {
      ns: 'dashboard',
      roomType: i18n.t('hostingConfig.roomTypes.manufacture', { ns: 'dashboard' }),
    });

    for (const key of summaryKeys) {
      const summary = key === 'hostingConfig.summaries.droneAcceleration'
        ? droneSummary
        : i18n.t(key, { ns: 'dashboard' });
      expect(screen.getByText(summary)).toBeTruthy();
    }
    expect(screen.queryByText(battleDescription)).toBeNull();

    await fireEvent.press(screen.getByTestId('hosting-config-card-battle-maps'));

    expect(screen.getByText(battleDescription)).toBeTruthy();
  });

  it('shows only the selected room type in the drone acceleration editor', async () => {
    const roomType = i18n.t('hostingConfig.roomTypes.manufacture', { ns: 'dashboard' });
    const description = i18n.t('hostingConfig.descriptions.droneAcceleration', {
      ns: 'dashboard',
    });
    const { screen } = await renderConfigView();

    expect(screen.getByText(roomType)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('hosting-config-card-drone-acceleration'));

    expect(screen.getByText(description)).toBeTruthy();
    expect(screen.getAllByText(roomType).length).toBeGreaterThan(0);
    expect(screen.queryByText('底层右')).toBeNull();
    expect(screen.queryByText(/\/\s*09/)).toBeNull();
  });

  it('opens Sanity editor and submits single keeping_ap patch', async () => {
    const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
    const { screen } = await renderConfigView({ onSubmit });

    await fireEvent.press(screen.getByTestId('hosting-config-card-keeping-ap'));
    expect(screen.getByTestId('hosting-config-keeping-ap')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('numeric-step-increase'));
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ keeping_ap: 1 });
  });

  it('disables reserve changes below zero and no-op submissions', async () => {
    const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
    const { screen } = await renderConfigView({ onSubmit });

    await fireEvent.press(screen.getByTestId('hosting-config-card-keeping-ap'));
    expect(screen.getByTestId('numeric-step-decrease')).toBeDisabled();
    expect(screen.getByTestId('hosting-config-submit')).toBeDisabled();
    expect(screen.queryByTestId('numeric-step-10')).toBeNull();
    expect(screen.queryByTestId('numeric-step-reset')).toBeNull();
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('opens Recruit Reserve editor and submits single recruit_reserve patch', async () => {
    const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
    const config = {
      ...gameAccountFixture.game_config,
      recruit_reserve: 4,
    };
    const { screen } = await renderConfigView({ config, onSubmit });

    await fireEvent.press(screen.getByTestId('hosting-config-card-recruit-reserve'));
    await fireEvent.press(screen.getByTestId('numeric-step-increase'));
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ recruit_reserve: 5 });
  });

  it('submits enable_building_arrange directly from its switch without opening an editor', async () => {
    const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
    const { screen } = await renderConfigView({ onSubmit });

    await fireEvent(screen.getByTestId('hosting-config-enable-building-arrange'), 'onCheckedChange', false);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ enable_building_arrange: false });
    expect(screen.queryByTestId('hosting-config-submit')).toBeNull();
  });

  it('maps the supplied production rooms to exactly nine slots', async () => {
    const { screen } = await renderConfigView();
    await fireEvent.press(screen.getByTestId('hosting-config-card-drone-acceleration'));
    const expected = {
      topLeft: 'power', topCenter: 'manufacture', topRight: 'power',
      middleLeft: 'manufacture', middleCenter: 'manufacture', middleRight: 'manufacture',
      bottomLeft: 'trading', bottomCenter: 'manufacture', bottomRight: 'trading',
    } as const;
    expect(screen.getAllByTestId(/^hosting-config-slot-/)).toHaveLength(9);
    for (const [position, type] of Object.entries(expected)) {
      expect(screen.getByTestId(`hosting-config-slot-${position}`)).toHaveAccessibleName(
        new RegExp(i18n.t(`hostingConfig.roomTypes.${type}`, { ns: 'dashboard' })),
      );
    }
  });

  it('uses slot membership rather than fixed equipment or production formula, ignoring training', async () => {
    const { screen } = await renderConfigView({ rooms: {
      TRADING: { slot_24: { strategy: 'O_GOLD' } },
      MANUFACTURE: { slot_7: { formulaId: '3' }, slot_5: { formulaId: '4' } },
      TRAINING: { slot_14: { completeWorkTime: '', trainee: { charId: 'trainee', skillId: '' } } },
    } });
    await fireEvent.press(screen.getByTestId('hosting-config-card-drone-acceleration'));
    for (const [position, type] of [
      ['topLeft', 'trading'], ['bottomRight', 'manufacture'], ['bottomLeft', 'manufacture'], ['middleLeft', 'power'],
    ] as const) {
      expect(screen.getByTestId(`hosting-config-slot-${position}`)).toHaveAccessibleName(
        new RegExp(i18n.t(`hostingConfig.roomTypes.${type}`, { ns: 'dashboard' })),
      );
    }
  });

  it('disables power plant slots and only submits manufacture or trading slots', async () => {
    const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
    const { screen } = await renderConfigView({ onSubmit });

    await fireEvent.press(screen.getByTestId('hosting-config-card-drone-acceleration'));

    expect(screen.getByTestId('hosting-config-slot-topLeft')).toBeDisabled();
    expect(screen.getByTestId('hosting-config-slot-topRight')).toBeDisabled();
    expect(screen.getByTestId('hosting-config-slot-middleLeft')).not.toBeDisabled();

    await fireEvent.press(screen.getByTestId('hosting-config-slot-topLeft'));
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));
    expect(onSubmit).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('hosting-config-slot-bottomRight'));
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));
    expect(onSubmit).toHaveBeenCalledWith({ accelerate_slot: 'slot_7' });
  });

  it('opens Drone Acceleration editor and submits selected room slot', async () => {
    const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
    const { screen } = await renderConfigView({ onSubmit });

    await fireEvent.press(screen.getByTestId('hosting-config-card-drone-acceleration'));
    await fireEvent.press(screen.getByTestId('hosting-config-slot-bottomRight'));
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ accelerate_slot: 'slot_7' });
  });

  it('opens Battle Queue editor, removes the final stage, and submits an empty queue', async () => {
    const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
    const { screen } = await renderConfigView({ onSubmit });

    await fireEvent.press(screen.getByTestId('hosting-config-card-battle-maps'));
    expect(screen.getByTestId('queue-item-0')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('queue-remove-0'));
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      battle_tasks: [],
    });
  });

  it('preserves SHARE and ADOPT positions while replacing LOOP tasks', async () => {
    const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
    const config = {
      ...gameAccountFixture.game_config,
      battle_tasks: [
        { mode: 'SHARE' as const, stage_id: 'main_01-01', uuid: 'share-1' },
        { mode: 'LOOP' as const, stage_id: 'main_01-07' },
        { mode: 'ADOPT' as const, stage_id: 'main_02-01', uuid: 'adopt-1' },
        { mode: 'LOOP' as const, stage_id: 'act24side_08' },
      ],
    };
    const { screen } = await renderConfigView({ config, onSubmit });

    await fireEvent.press(screen.getByTestId('hosting-config-card-battle-maps'));
    await fireEvent.press(screen.getByTestId('queue-remove-0'));
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      battle_tasks: [
        { mode: 'SHARE', stage_id: 'main_01-01', uuid: 'share-1' },
        { mode: 'LOOP', stage_id: 'act24side_08' },
        { mode: 'ADOPT', stage_id: 'main_02-01', uuid: 'adopt-1' },
      ],
    });
  });

  it('decrements a positive reserve by one', async () => {
    const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
    const config = {
      ...gameAccountFixture.game_config,
      keeping_ap: 2,
    };
    const { screen } = await renderConfigView({ config, onSubmit });

    await fireEvent.press(screen.getByTestId('hosting-config-card-keeping-ap'));
    await fireEvent.press(screen.getByTestId('numeric-step-decrease'));
    await fireEvent.press(screen.getByTestId('hosting-config-submit'));

    expect(onSubmit).toHaveBeenCalledWith({ keeping_ap: 1 });
  });

  it('repeats reserve changes while held and stops on release', async () => {
    jest.useFakeTimers();
    try {
      const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
      const { screen } = await renderConfigView({ onSubmit });

      await fireEvent.press(screen.getByTestId('hosting-config-card-keeping-ap'));
      const increaseButton = screen.getByTestId('numeric-step-increase');

      await fireEvent(increaseButton, 'pressIn');
      await fireEvent(increaseButton, 'longPress');
      await act(() => {
        jest.advanceTimersByTime(200);
      });
      await fireEvent(increaseButton, 'pressOut');
      await fireEvent(increaseButton, 'press');
      await act(() => {
        jest.advanceTimersByTime(200);
      });
      await fireEvent.press(screen.getByTestId('hosting-config-submit'));

      expect(onSubmit).toHaveBeenCalledWith({ keeping_ap: 3 });
    } finally {
      jest.useRealTimers();
    }
  });

  it('cancels reserve changes without submitting', async () => {
    const onSubmit = jest.fn<Promise<void>, [SubmitPatch]>().mockResolvedValue(undefined);
    const { screen } = await renderConfigView({ onSubmit });

    await fireEvent.press(screen.getByTestId('hosting-config-card-keeping-ap'));
    await fireEvent.press(screen.getByTestId('numeric-step-increase'));
    await fireEvent.press(screen.getByTestId('hosting-config-dialog-cancel'));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
