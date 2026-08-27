import { fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';
import * as v from 'valibot';

import { i18n } from '@/i18n';
import { operatorSchema } from '@/schemas/game-account';
import type { Operator } from '@/schemas/game-account';
import { tamaguiConfig } from '../../../../../tamagui.config';
import { OperatorRosterView, type OperatorViewModel } from './operator-roster-view';

jest.mock('./operator-card', () => {
  const { Text: MockText, View: MockView } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    OPERATOR_CARD_MIN_WIDTH: 140,
    OperatorCard: ({ name, operator }: { name: string; operator: Operator }) => (
      <MockView testID={`operator-card-${operator.charId}`}>
        <MockText testID={`operator-card-name-${operator.charId}`}>{name}</MockText>
      </MockView>
    ),
  };
});

const operators: Operator[] = v.parse(v.array(operatorSchema), [
  { charId: 'char_001', evolvePhase: 2, level: 60, potentialRank: 5 },
  { charId: 'char_002', evolvePhase: 0, level: 1, potentialRank: 0 },
  { charId: 'char_003', evolvePhase: 1, level: 30, potentialRank: 3 },
]);

const namesByCharId: Record<string, string> = {
  char_001: '阿米娅',
  char_002: '德克萨斯',
  char_003: '能天使',
};

const operatorViewModels: OperatorViewModel[] = operators.map((operator) => ({
  name: namesByCharId[operator.charId] ?? operator.charId,
  operator,
}));

function gridLayoutEvent(width: number) {
  return {
    nativeEvent: { layout: { width, height: 0, x: 0, y: 0 } },
  };
}

async function renderRoster() {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <OperatorRosterView operators={operatorViewModels} />
      </I18nextProvider>
    </TamaguiProvider>,
  );
}

describe('OperatorRosterView', () => {
  it('waits for measurement, then renders stable operator rows', async () => {
    const screen = await renderRoster();

    expect(screen.getByTestId('operator-roster-list').props.showsVerticalScrollIndicator).toBe(false);
    expect(screen.queryByTestId('operator-card-char_001')).toBeNull();

    await fireEvent(screen.getByTestId('operator-roster-list'), 'layout', gridLayoutEvent(320));

    expect(screen.getByTestId('operator-card-char_001')).toBeTruthy();
    expect(screen.getByTestId('operator-card-char_002')).toBeTruthy();
    expect(screen.getByTestId('operator-card-char_003')).toBeTruthy();
    expect(screen.getByText('阿米娅')).toBeTruthy();
    expect(screen.getByText('德克萨斯')).toBeTruthy();
    expect(screen.getByText('能天使')).toBeTruthy();
  });
});
