import { fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import * as v from 'valibot';

import { i18n } from '@/i18n';
import { operatorSchema } from '@/schemas/game-account';
import type { Operator } from '@/schemas/game-account';
import type { LayoutSize } from '@/schemas/layout-size';
import { tamaguiConfig } from '../../../../../tamagui.config';
import { getOperatorPortraitUrl } from '../portrait-image';
import { OperatorRosterView, type OperatorViewModel } from './operator-roster-view';

let mockLayoutSize: LayoutSize = 'small';

jest.mock('@/providers/layout-size-provider', () => ({
  useLayoutSize: () => mockLayoutSize,
}));

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    ...reanimated,
    ...reanimatedMock,
    default: { ...reanimatedMock.default, View },
    useReducedMotion: () => true,
  };
});

jest.mock('expo-image', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    Image: (props: { [key: string]: unknown }) => <View {...props} />,
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
  charId: operator.charId,
  name: namesByCharId[operator.charId] ?? operator.charId,
  operator,
}));

function gridLayoutEvent(width: number) {
  return {
    nativeEvent: { layout: { width, height: 0, x: 0, y: 0 } },
  };
}

describe('OperatorRosterView', () => {
  afterEach(() => {
    mockLayoutSize = 'small';
  });

  it('renders the compact portrait-backed cards after the list is measured', async () => {
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <I18nextProvider i18n={i18n}>
          <OperatorRosterView operators={operatorViewModels} />
        </I18nextProvider>
      </TamaguiProvider>,
    );

    expect(screen.getByTestId('operator-roster-list').props.showsVerticalScrollIndicator).toBe(false);
    expect(screen.queryByTestId('operator-card-char_001')).toBeNull();

    await fireEvent(screen.getByTestId('operator-roster-list'), 'layout', gridLayoutEvent(320));

    expect(screen.getByTestId('operator-card-char_001')).toBeTruthy();
    expect(screen.getByTestId('operator-card-char_002')).toBeTruthy();
    expect(screen.getByTestId('operator-card-char_003')).toBeTruthy();
    expect(screen.getByText('阿米娅')).toBeTruthy();
    expect(screen.getByText('德克萨斯')).toBeTruthy();
    expect(screen.getByText('能天使')).toBeTruthy();
    expect(screen.queryByText('OP//01')).toBeNull();

    const eliteFrame = screen.getByTestId('operator-card-elite-frame-char_001');
    expect(StyleSheet.flatten(eliteFrame.props.style)).toEqual(
      expect.objectContaining({
        bottom: 44,
        height: 30,
        left: 10,
        width: 30,
        zIndex: 2,
      }),
    );
    const eliteIcon = screen.getByTestId('operator-card-elite-char_001');
    expect(eliteIcon.props.source).toBeDefined();
    expect(eliteIcon.props.recyclingKey).toBe('char_001-elite-2');
    expect(eliteIcon.props.accessibilityLabel).toContain('2');
    expect(
      screen.getByTestId('operator-card-elite-filter-mask-char_001', {
        includeHiddenElements: true,
      }).props.maskType,
    ).toBe(1);
    expect(
      screen.getByTestId('operator-card-elite-filter-svg-char_001', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();

    const levelBlock = screen.getByTestId('operator-card-level-block-char_001');
    expect(StyleSheet.flatten(levelBlock.props.style)).toEqual(
      expect.objectContaining({ bottom: 10, left: 10, zIndex: 2 }),
    );

    const potentialFrame = screen.getByTestId('operator-card-potential-frame-char_001');
    expect(StyleSheet.flatten(potentialFrame.props.style)).toEqual(
      expect.objectContaining({
        bottom: 10,
        height: 30,
        right: 10,
        width: 30,
        zIndex: 2,
      }),
    );

    const potentialIcon = screen.getByTestId('operator-card-potential-char_001');
    expect(potentialIcon.props.contentFit).toBe('contain');
    expect(potentialIcon.props.source).toBeDefined();
    expect(potentialIcon.props.recyclingKey).toBe('char_001-potential-5');
    expect(potentialIcon.props.accessibilityLabel).toContain('6');
    expect(
      screen.getByTestId('operator-card-potential-filter-mask-char_001', {
        includeHiddenElements: true,
      }).props.maskType,
    ).toBe(1);
    expect(
      screen.getByTestId('operator-card-potential-filter-svg-char_001', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();
    expect(screen.getByTestId('operator-card-potential-char_002').props.source).toBeDefined();
    expect(screen.getByTestId('operator-card-potential-char_003').props.source).toBeDefined();

    const portraitLayer = screen.getByTestId('operator-card-portrait-layer-char_001', {
      includeHiddenElements: true,
    });
    expect(StyleSheet.flatten(portraitLayer.props.style)).toEqual(
      expect.objectContaining({ right: 0, width: '50%' }),
    );
    expect(
      screen.getByTestId('operator-card-portrait-zoom-char_001', { includeHiddenElements: true }),
    ).toBeTruthy();
    expect(
      screen.getByTestId('operator-card-portrait-char_001', { includeHiddenElements: true }).props.src,
    ).toEqual({ uri: getOperatorPortraitUrl('char_001') });

    const filterMask = screen.getByTestId('operator-card-filter-mask-char_001', {
      includeHiddenElements: true,
    });
    expect(filterMask.props.maskType).toBe(1);
    expect(
      screen.getByTestId('operator-card-filter-mask-image-char_001', { includeHiddenElements: true }).props.src,
    ).toEqual({ uri: getOperatorPortraitUrl('char_001') });
    expect(
      screen.getByTestId('operator-card-filter-char_001', { includeHiddenElements: true }).props.mask,
    ).toContain('operator-portrait-alpha-mask-');
    expect(
      screen.getByTestId('operator-card-left-fade-mask-char_001', { includeHiddenElements: true }).props.maskType,
    ).toBe(1);
    expect(
      screen.getByTestId('operator-card-right-fade-mask-char_001', { includeHiddenElements: true }).props.maskType,
    ).toBe(1);
    expect(
      screen.getByTestId('operator-card-bottom-fade-mask-char_001', { includeHiddenElements: true }).props.maskType,
    ).toBe(1);
    expect(
      screen.getByTestId('operator-card-left-fade-char_001', { includeHiddenElements: true }).props.mask,
    ).toContain('operator-left-fade-mask-');
    expect(
      screen.getByTestId('operator-card-right-fade-char_001', { includeHiddenElements: true }).props.mask,
    ).toContain('operator-right-fade-mask-');
    expect(
      screen.getByTestId('operator-card-bottom-fade-char_001', { includeHiddenElements: true }).props.mask,
    ).toContain('operator-bottom-fade-mask-');
    expect(
      screen.getByTestId('operator-card-filter-svg-char_001', { includeHiddenElements: true }),
    ).toBeTruthy();
    expect(
      screen.getByTestId('operator-card-bottom-transition-char_001', { includeHiddenElements: true }),
    ).toBeTruthy();
    expect(screen.queryByTestId('operator-card-right-transition-char_001')).toBeNull();
    const ticks = screen.getByTestId('operator-card-ticks-char_001', {
      includeHiddenElements: true,
    });
    expect(ticks.children).toHaveLength(24);
  });

  it('keeps the existing large-screen card branch', async () => {
    mockLayoutSize = 'large';

    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <I18nextProvider i18n={i18n}>
          <OperatorRosterView operators={operatorViewModels} />
        </I18nextProvider>
      </TamaguiProvider>,
    );

    await fireEvent(screen.getByTestId('operator-roster-list'), 'layout', gridLayoutEvent(320));

    expect(screen.getByTestId('operator-card-char_001')).toBeTruthy();
    expect(screen.queryByTestId('operator-card-portrait-char_001')).toBeNull();
    expect(screen.queryByTestId('operator-card-filter-svg-char_001')).toBeNull();
    expect(screen.queryByTestId('operator-card-bottom-transition-char_001')).toBeNull();
    expect(screen.queryByTestId('operator-card-elite-char_001')).toBeNull();
    expect(screen.queryByTestId('operator-card-right-transition-char_001')).toBeNull();
    expect(screen.queryByTestId('operator-card-potential-char_001')).toBeNull();
  });
});
