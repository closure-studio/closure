import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { TamaguiProvider } from 'tamagui';

import { mockArkHostGameDetails, mockArkHostGameListResponse } from '@/mocks/arkhost';
import type { ArkHostGameConfigPatch, ArkHostGameDetail } from '@/schemas/arkhost';
import type { GameAccount } from '@/schemas/game-account';
import type { OperatorDevelopmentTarget } from '@/utils/operator-development/operator-development';
import { tamaguiConfig } from '../../../../tamagui.config';
import { arkHostApi, type ArkHostResult } from '../api';
import type { OperatorViewModel } from '../operator-roster/components/operator-roster-view';
import { arkHostQueryKeys } from '../queries';
import { DashboardOperatorsContent } from './dashboard-account-content';

jest.mock('../components/dashboard-shell', () => ({
  DashboardPageFrame: ({ children }: PropsWithChildren) => children,
}));

jest.mock('../resources', () => {
  const { bundledCharacterTable } = jest.requireActual<typeof import('../game-data')>('../game-data');
  return { useCharacterTable: () => bundledCharacterTable };
});

jest.mock('../operator-roster/components/operator-roster-view', () => ({
  OperatorRosterView: (() => {
    const {
      Pressable: MockPressable,
      View: MockView,
    } = jest.requireActual<typeof import('react-native')>('react-native');
    return function MockOperatorRosterView({
      onSelectOperator,
      operators,
    }: {
      onSelectOperator: (operator: OperatorViewModel) => void;
      operators: readonly OperatorViewModel[];
    }) {
      return (
        <MockView>
          {operators.slice(0, 2).map((operator) => (
            <MockPressable
              key={operator.operator.charId}
              testID={`select-${operator.operator.charId}`}
              onPress={() => onSelectOperator(operator)}
            />
          ))}
        </MockView>
      );
    };
  })(),
}));

jest.mock('../operator-roster/components/operator-development-dialog', () => ({
  OperatorDevelopmentDialog: (() => {
    const {
      Pressable: MockPressable,
      Text: MockText,
      View: MockView,
    } = jest.requireActual<typeof import('react-native')>('react-native');
    return function MockOperatorDevelopmentDialog({
      isSubmitting,
      onOpenChange,
      onSubmit,
      selection,
    }: {
      isSubmitting: boolean;
      onOpenChange: (open: boolean) => void;
      onSubmit: (target: OperatorDevelopmentTarget | null) => Promise<void>;
      selection: { operator: OperatorViewModel['operator'] } | null;
    }) {
      return selection ? (
        <MockView testID="development-dialog">
          <MockText testID="selected-operator">{selection.operator.charId}</MockText>
          <MockText testID="submission-state">{isSubmitting ? 'pending' : 'idle'}</MockText>
          <MockPressable testID="close-development" onPress={() => onOpenChange(false)} />
          <MockPressable
            testID="submit-development"
            onPress={() => {
              void onSubmit({
                evolve_phase: 2,
                level: 90,
                masteries: [],
                skill_level: 7,
              });
            }}
          />
        </MockView>
      ) : null;
    };
  })(),
}));

const detail = mockArkHostGameDetails[0];
const accountEntry = mockArkHostGameListResponse.code === 1
  ? mockArkHostGameListResponse.data[0]
  : undefined;
if (!detail || !accountEntry) throw new Error('Expected dashboard fixtures.');

const gameAccount: GameAccount = {
  account: accountEntry.status.account,
  ap: accountEntry.status.ap,
  avatar: accountEntry.status.avatar,
  captchaInfo: accountEntry.captcha_info,
  color: 'primary',
  createdAt: accountEntry.status.created_at,
  isVerified: accountEntry.status.is_verify,
  level: accountEntry.status.level,
  nickname: accountEntry.status.nick_name,
  platform: accountEntry.status.platform,
  statusCode: accountEntry.status.code,
  userId: accountEntry.status.uuid,
};

function applyPatch(
  current: ArkHostGameDetail,
  patch: ArkHostGameConfigPatch,
): ArkHostGameDetail {
  const operatorDevelopmentTasks = patch.operator_development_tasks;
  if (operatorDevelopmentTasks === undefined) {
    throw new Error('Expected an operator development task patch.');
  }
  return {
    ...current,
    config: {
      ...current.config,
      operator_development_tasks: operatorDevelopmentTasks,
    },
  };
}

it('keeps one operator edit active until its config update and refresh complete', async () => {
  let serverDetail = detail;
  let resolveFirstUpdate: ((result: ArkHostResult<void>) => void) | undefined;
  const firstUpdate = new Promise<ArkHostResult<void>>((resolve) => {
    resolveFirstUpdate = resolve;
  });
  const updateGameConfig = jest
    .spyOn(arkHostApi, 'updateGameConfig')
    .mockImplementationOnce(() => firstUpdate)
    .mockImplementation((_account, patch) => {
      serverDetail = applyPatch(serverDetail, patch);
      return Promise.resolve({ data: undefined, ok: true });
    });
  jest.spyOn(arkHostApi, 'fetchGameDetail').mockImplementation(() => Promise.resolve({
    data: serverDetail,
    ok: true,
  }));
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { gcTime: 0, retry: false },
      queries: { gcTime: 0, retry: false, staleTime: Infinity },
    },
  });
  queryClient.setQueryData(arkHostQueryKeys.detail(gameAccount.account), detail);

  const screen = await render(
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <DashboardOperatorsContent gameAccount={gameAccount} />
      </TamaguiProvider>
    </QueryClientProvider>,
  );
  const operators = Object.values(detail.troop?.chars ?? {});
  const firstOperator = operators[0];
  const secondOperator = operators[1];
  if (!firstOperator || !secondOperator) throw new Error('Expected two operators.');

  await fireEvent.press(screen.getByTestId(`select-${firstOperator.charId}`));
  await fireEvent.press(screen.getByTestId('submit-development'));
  await waitFor(() => {
    expect(screen.getByTestId('submission-state').props.children).toBe('pending');
  });

  await fireEvent.press(screen.getByTestId('close-development'));
  await fireEvent.press(screen.getByTestId(`select-${secondOperator.charId}`));
  expect(screen.getByTestId('selected-operator').props.children).toBe(firstOperator.charId);
  expect(updateGameConfig).toHaveBeenCalledTimes(1);

  const firstPatch = updateGameConfig.mock.calls[0]?.[1];
  if (!firstPatch || !resolveFirstUpdate) throw new Error('Expected the first update.');
  serverDetail = applyPatch(serverDetail, firstPatch);
  resolveFirstUpdate({ data: undefined, ok: true });

  await waitFor(() => {
    expect(screen.queryByTestId('development-dialog')).toBeNull();
  });

  await fireEvent.press(screen.getByTestId(`select-${secondOperator.charId}`));
  await fireEvent.press(screen.getByTestId('submit-development'));
  await waitFor(() => {
    expect(updateGameConfig).toHaveBeenCalledTimes(2);
  });

  expect(updateGameConfig.mock.calls[1]?.[1].operator_development_tasks?.map(
    (task) => task.char_id,
  )).toEqual([firstOperator.charId, secondOperator.charId]);
  await waitFor(() => {
    expect(screen.queryByTestId('development-dialog')).toBeNull();
  });

  await screen.unmount();
  queryClient.clear();
});
