import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react-native';
import { Text as MockText } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import { mockArkHostGameDetails } from '@/mocks/arkhost';
import type { GameAccount } from '@/schemas/game-account';
import { tamaguiConfig } from '../../../../tamagui.config';
import { arkHostApi } from '../api';
import type { OperatorViewModel } from '../operator-roster/components/operator-roster-view';
import { arkHostQueryKeys } from '../queries';
import { DashboardOperatorsContent } from './dashboard-account-content';

jest.mock('../components/dashboard-shell', () => ({
  DashboardPageFrame: ({ children }: React.PropsWithChildren) => children,
}));
jest.mock('../resources', () => ({ useCharacterTable: () => ({}) }));
jest.mock('../operator-roster/components/operator-roster-view', () => ({
  OperatorRosterView: ({ operators }: { operators: OperatorViewModel[] }) => (
    <MockText testID="roster">{operators.map(({ operator }) => `${operator.charId}:${operator.level}`).join(',')}</MockText>
  ),
}));
jest.mock('../operator-roster/components/operator-development-dialog', () => ({
  OperatorDevelopmentDialog: () => null,
}));

it('reads the shared detail cache, refreshes troop data and isolates account switches', async () => {
  const detail = mockArkHostGameDetails[0];
  if (!detail) throw new Error('Expected detail');
  const initialOperator = Object.values(detail.troop?.chars ?? {})[0];
  if (!initialOperator) throw new Error('Expected operator');
  const account: GameAccount = {
    account: detail.config.account, ap: detail.status.ap, avatar: detail.status.avatar,
    captchaInfo: { captcha_type: '', challenge: '', created: 0, geetestId: '', gt: '', riskType: '' },
    color: 'primary', createdAt: 0, isVerified: true,
    level: detail.status.level, nickname: detail.status.nickName, platform: 1,
    statusCode: 2, userId: 'test',
  };
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  queryClient.setQueryData(arkHostQueryKeys.detail(account.account), detail);
  queryClient.setQueryData(arkHostQueryKeys.detail('empty'), { ...detail, troop: null });
  const fetchDetail = jest.spyOn(arkHostApi, 'fetchGameDetail').mockResolvedValue({
    ok: true, data: { ...detail, troop: { chars: {
      '1': { charId: 'char_002_amiya', evolvePhase: 2, level: 81, potentialRank: 5, skills: [] },
    } } },
  });
  const content = (selected: GameAccount) => (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <QueryClientProvider client={queryClient}><DashboardOperatorsContent gameAccount={selected} /></QueryClientProvider>
    </TamaguiProvider>
  );
  const screen = await render(content(account));
  expect(screen.getByTestId('roster').props.children).toContain(`${initialOperator.charId}:80`);
  expect(fetchDetail).not.toHaveBeenCalled();
  await act(async () => { await queryClient.invalidateQueries({ queryKey: arkHostQueryKeys.detail(account.account) }); });
  await waitFor(() => expect(screen.getByTestId('roster').props.children).toBe('char_002_amiya:81'));
  await screen.rerender(content({ ...account, account: 'empty' }));
  expect(screen.getByTestId('roster').props.children).toBe('');
  expect(queryClient.getQueryCache().getAll().map(({ queryKey }) => queryKey)).toEqual([
    arkHostQueryKeys.detail(account.account), arkHostQueryKeys.detail('empty'),
  ]);
  await screen.unmount();
  fetchDetail.mockRestore();
  queryClient.clear();
});
