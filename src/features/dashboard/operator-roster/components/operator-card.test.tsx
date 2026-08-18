import { render } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import * as v from 'valibot';

import { operatorSchema } from '@/schemas/game-account';
import type { Operator } from '@/schemas/game-account';
import type { LayoutSize } from '@/schemas/layout-size';
import { tamaguiConfig } from '../../../../../tamagui.config';
import { OperatorCard, type OperatorCardLabels } from './operator-card';
import { getOperatorPortraitUrl } from '../portrait-image';

jest.mock('expo-image', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    Image: (props: { [key: string]: unknown }) => <View {...props} />,
  };
});

jest.mock('@expo/ui/community/masked-view', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    MaskedView: ({
      children,
      maskElement,
      ...props
    }: {
      children?: ReactNode;
      maskElement: ReactElement;
      [key: string]: unknown;
    }) => (
      <View {...props}>
        {maskElement}
        {children}
      </View>
    ),
  };
});

jest.mock('@/components', () => {
  const actual = jest.requireActual<typeof import('@/components')>('@/components');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    ...actual,
    TerminalMeterBar: () => <View testID="mock-terminal-meter-bar" />,
  };
});

const operator: Operator = v.parse(operatorSchema, {
  charId: 'char_001',
  evolvePhase: 2,
  level: 60,
  potentialRank: 5,
});

const labels: OperatorCardLabels = {
  cellLevel: 'LV',
  detailLevel: 'Level',
  detailPotential: 'Potential',
  elite: {
    0: 'Elite 0',
    1: 'Elite 1',
    2: 'Elite 2',
  },
  potential: {
    0: 'Potential 1',
    1: 'Potential 2',
    2: 'Potential 3',
    3: 'Potential 4',
    4: 'Potential 5',
    5: 'Potential 6',
  },
};

async function renderCard(size: LayoutSize = 'small', cardOperator: Operator = operator) {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <OperatorCard labels={labels} name="阿米娅" operator={cardOperator} size={size} />
    </TamaguiProvider>,
  );
}

describe('OperatorCard', () => {
  it('keeps the two required masks and removes redundant portrait wrappers', async () => {
    const screen = await renderCard();
    const edgeFadeMask = screen.getByTestId('operator-card-edge-fade-mask-char_001', {
      includeHiddenElements: true,
    });
    const filterMask = screen.getByTestId('operator-card-filter-char_001', {
      includeHiddenElements: true,
    });

    expect([edgeFadeMask, filterMask]).toHaveLength(2);
    expect(StyleSheet.flatten(edgeFadeMask.props.style)).toEqual(
      expect.objectContaining({
        bottom: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        width: '55%',
      }),
    );
    const portrait = screen.getByTestId('operator-card-portrait-char_001', {
      includeHiddenElements: true,
    });
    const expectedPortraitSource = {
      uri: getOperatorPortraitUrl('char_001'),
      width: 180,
      height: 360,
    };
    expect(portrait.props.source).toEqual(expectedPortraitSource);
    expect(portrait.props.cachePolicy).toBe('memory-disk');
    expect(portrait.props.recyclingKey).toBe('char_001-portrait');
    expect(portrait.props.contentFit).toBe('contain');
    expect(StyleSheet.flatten(portrait.props.style)).toEqual(
      expect.objectContaining({ width: '120%', aspectRatio: 0.5, top: -20, right: 0 }),
    );

    const filterMaskImage = screen.getByTestId('operator-card-filter-mask-image-char_001', {
      includeHiddenElements: true,
    });
    expect(filterMaskImage.props.source).toEqual(expectedPortraitSource);
    expect(filterMaskImage.props.recyclingKey).toBe('char_001-portrait-mask');
    expect(StyleSheet.flatten(filterMaskImage.props.style)).toEqual(
      StyleSheet.flatten(portrait.props.style),
    );

    const edgeFadeImage = screen.getByTestId('operator-card-edge-fade-image-char_001', {
      includeHiddenElements: true,
    });
    expect(edgeFadeImage.props.cachePolicy).toBe('memory');
    expect(edgeFadeImage.props.contentFit).toBe('fill');

    const filterImage = screen.getByTestId('operator-card-filter-image-char_001', {
      includeHiddenElements: true,
    });
    expect(filterImage.props.cachePolicy).toBe('memory');
    expect(filterImage.props.contentFit).toBe('contain');
    expect(StyleSheet.flatten(filterImage.props.style)).toEqual(
      StyleSheet.flatten(portrait.props.style),
    );
  });

  it('renders static icons directly without frame wrappers', async () => {
    const screen = await renderCard();
    const eliteIcon = screen.getByTestId('operator-card-elite-char_001');
    const potentialIcon = screen.getByTestId('operator-card-potential-char_001');

    expect(eliteIcon.props.recyclingKey).toBe('char_001-elite-2');
    expect(eliteIcon.props.accessibilityLabel).toBe('Elite 2');
    expect(StyleSheet.flatten(eliteIcon.props.style)).toEqual(
      expect.objectContaining({ bottom: 44, height: 30, left: 10, width: 30, zIndex: 2 }),
    );
    expect(potentialIcon.props.recyclingKey).toBe('char_001-potential-5');
    expect(potentialIcon.props.accessibilityLabel).toBe('Potential 6');
    expect(StyleSheet.flatten(potentialIcon.props.style)).toEqual(
      expect.objectContaining({ bottom: 10, height: 35, right: 10, width: 35, zIndex: 2 }),
    );
  });

  it('does not create compact artwork on the large layout branch', async () => {
    const screen = await renderCard('large');

    expect(screen.getByTestId('operator-card-char_001')).toBeTruthy();
    expect(screen.queryByTestId('operator-card-edge-fade-mask-char_001')).toBeNull();
    expect(screen.queryByTestId('operator-card-filter-image-char_001')).toBeNull();
    expect(screen.queryByTestId('operator-card-elite-char_001')).toBeNull();
    expect(screen.queryByTestId('operator-card-potential-char_001')).toBeNull();
  });
});
