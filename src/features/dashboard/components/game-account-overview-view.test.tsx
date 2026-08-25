import { fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import apGameplayImage from '@/assets/images/inventory/original/AP_GAMEPLAY.webp';
import diamondImage from '@/assets/images/inventory/original/DIAMOND.webp';
import diamondShdImage from '@/assets/images/inventory/original/DIAMOND_SHD.webp';
import goldImage from '@/assets/images/inventory/original/GOLD.webp';
import recruitTicketImage from '@/assets/images/inventory/original/TKT_RECRUIT.webp';
import inventoryGridFilterLarge from '@/assets/images/inventory/grid-filter-large.webp';
import inventoryGridFilterSmall from '@/assets/images/inventory/grid-filter-small.webp';
import { i18n } from '@/i18n';
import { mockArkHostGameDetailResponse, mockArkHostGameListResponse, mockArkHostGameLogsResponse } from '@/mocks/arkhost';
import type { LayoutSize } from '@/schemas/layout-size';
import { tamaguiConfig } from '../../../../tamagui.config';
import { GameAccountOverviewView } from './game-account-overview-view';

let mockLayoutSize: LayoutSize = 'small';

jest.mock('@/providers/layout-size-provider', () => ({
  useLayoutSize: () => mockLayoutSize,
}));

jest.mock('expo-image', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    Image: (props: { [key: string]: unknown }) => <View {...props} />,
  };
});

function OverviewTestTree({ children }: { children: ReactNode }) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </TamaguiProvider>
  );
}

const gameAccountEntry = mockArkHostGameListResponse.code === 1
  ? mockArkHostGameListResponse.data[0]
  : undefined;
const gameDetail = mockArkHostGameDetailResponse.code === 1
  ? mockArkHostGameDetailResponse.data
  : null;
const gameLogs = mockArkHostGameLogsResponse.code === 1
  ? mockArkHostGameLogsResponse.data.logs
  : [];

if (!gameAccountEntry) throw new Error('Expected a game account fixture.');

const gameAccount = {
  account: gameAccountEntry.status.account,
  ap: gameAccountEntry.status.ap,
  avatar: gameAccountEntry.status.avatar,
  captchaInfo: gameAccountEntry.captcha_info,
  color: 'primary' as const,
  config: gameAccountEntry.game_config,
  createdAt: gameAccountEntry.status.created_at,
  isVerified: gameAccountEntry.status.is_verify,
  level: gameAccountEntry.status.level,
  nickname: gameAccountEntry.status.nick_name,
  platform: gameAccountEntry.status.platform,
  statusCode: gameAccountEntry.status.code,
  statusText: gameAccountEntry.status.text,
  userId: gameAccountEntry.status.uuid,
};

function OverviewFixture({ detail, stageSubtitle = '暴君', stageTitle = '1-7' }: { detail: typeof gameDetail; stageSubtitle?: string; stageTitle?: string }) {
  return (
    <GameAccountOverviewView
      detail={detail}
      gameAccount={gameAccount}
      logs={gameLogs}
      stageSubtitle={stageSubtitle}
      stageTitle={stageTitle}
    />
  );
}

async function renderOverview(detail = gameDetail, stageTitle = '1-7', stageSubtitle = '暴君') {
  return render(
    <OverviewTestTree>
      <OverviewFixture detail={detail} stageSubtitle={stageSubtitle} stageTitle={stageTitle} />
    </OverviewTestTree>,
  );
}

describe('GameAccountOverviewView', () => {
  beforeEach(() => {
    mockLayoutSize = 'small';
  });

  it('keeps exactly one selected summary frame while switching across the tab', async () => {
    const screen = await render(
      <OverviewTestTree>
        <OverviewFixture detail={gameDetail} />
      </OverviewTestTree>,
    );
    const profileFrame = screen.getByTestId('overview-profile-frame');
    const goldFrame = screen.getByTestId('overview-balance-frame-GOLD');
    const operationFrame = screen.getByTestId('overview-operation-metric-frame-0');
    const logsFrame = screen.getByTestId('game-logs-frame');
    const firstLog = gameLogs[0];
    if (!firstLog) throw new Error('Expected a game log fixture.');
    const gameLogsViewStyle: unknown = screen.getByTestId('game-logs-view').props.style;
    const logsFrameStyle: unknown = logsFrame.props.style;

    expect(screen.getByTestId('overview-summary-grid')).toBeTruthy();
    expect(screen.queryByTestId('overview-assets-frame')).toBeNull();
    expect(screen.queryByTestId('overview-operation-metrics-frame')).toBeNull();
    expect(screen.getByTestId('overview-balance-frame-GOLD')).toBeTruthy();
    expect(screen.getByTestId('overview-operation-metric-frame-0')).toBeTruthy();
    expect(gameLogsViewStyle).toEqual(expect.objectContaining({ width: '100%' }));
    expect(logsFrameStyle).toEqual(expect.objectContaining({ width: '100%' }));
    expect(screen.getByText(firstLog.content)).toBeTruthy();
    expect(profileFrame.props['aria-pressed']).toBe(true);
    expect(goldFrame.props['aria-pressed']).toBe(false);
    expect(operationFrame.props['aria-pressed']).toBe(false);
    expect(logsFrame.props['aria-pressed']).toBe(false);
    expect(screen.getByTestId('overview-profile-frame-corner-top-left')).toBeTruthy();
    expect(screen.getByTestId('overview-profile-frame-corner-top-right')).toBeTruthy();
    expect(screen.getByTestId('overview-profile-frame-corner-bottom-left')).toBeTruthy();
    expect(screen.getByTestId('overview-profile-frame-corner-bottom-right')).toBeTruthy();

    await fireEvent.press(goldFrame);

    expect(screen.getByTestId('overview-profile-frame').props['aria-pressed']).toBe(false);
    expect(screen.getByTestId('overview-balance-frame-GOLD').props['aria-pressed']).toBe(true);
    expect(screen.getByTestId('overview-operation-metric-frame-0').props['aria-pressed']).toBe(false);
    expect(screen.getByTestId('overview-balance-frame-GOLD-corner-top-left')).toBeTruthy();

    await fireEvent.press(operationFrame);

    expect(screen.getByTestId('overview-balance-frame-GOLD').props['aria-pressed']).toBe(false);
    expect(screen.getByTestId('overview-operation-metric-frame-0').props['aria-pressed']).toBe(true);
    expect(screen.getByTestId('overview-operation-metric-frame-0-corner-top-left')).toBeTruthy();

    await fireEvent.press(logsFrame);

    expect(screen.getByTestId('overview-profile-frame').props['aria-pressed']).toBe(false);
    expect(screen.getByTestId('overview-operation-metric-frame-0').props['aria-pressed']).toBe(false);
    expect(screen.getByTestId('game-logs-frame').props['aria-pressed']).toBe(true);
    expect(screen.queryByTestId('overview-operation-metric-frame-0-corner-top-left')).toBeNull();
    expect(screen.getByTestId('game-logs-frame-corner-top-left')).toBeTruthy();
  });

  it.each([
    { filter: inventoryGridFilterSmall, layoutSize: 'small' as const, size: 48 },
    { filter: inventoryGridFilterLarge, layoutSize: 'large' as const, size: 104 },
  ])('uses shared $layoutSize inventory artwork for asset and sanity artwork', async ({ filter, layoutSize, size }) => {
    mockLayoutSize = layoutSize;
    const screen = await renderOverview();
    const assetImages = [
      ['GOLD', goldImage],
      ['DIAMOND_SHD', diamondShdImage],
      ['DIAMOND', diamondImage],
      ['TKT_RECRUIT', recruitTicketImage],
    ] as const;

    for (const [icon, source] of assetImages) {
      const testID = `overview-balance-image-${icon}`;
      const frame = screen.getByTestId(testID);
      expect(StyleSheet.flatten(frame.props.style)).toEqual(
        expect.objectContaining({
          borderBottomLeftRadius: 999,
          borderBottomRightRadius: 999,
          borderTopLeftRadius: 999,
          borderTopRightRadius: 999,
          height: size,
          overflow: 'hidden',
          width: size,
        }),
      );

      const image = screen.getByTestId(`${testID}-image`, { includeHiddenElements: true });
      expect(image.props.source).toBe(source);
      expect(image.props.contentFit).toBe('contain');
      expect(image.props.cachePolicy).toBe('memory-disk');
      expect(image.props.recyclingKey).toBe(`overview-${icon}`);

      const artworkFilter = screen.getByTestId(`${testID}-filter`, {
        includeHiddenElements: true,
      });
      expect(artworkFilter.props.source).toBe(filter);
      expect(artworkFilter.props.cachePolicy).toBe('memory');
      expect(artworkFilter.props.contentFit).toBe('fill');
    }

    const sanityFrame = screen.getByTestId('overview-sanity-image');
    expect(StyleSheet.flatten(sanityFrame.props.style)).toEqual(
      expect.objectContaining({ height: size, width: size }),
    );
    const sanityImage = screen.getByTestId('overview-sanity-image-image', {
      includeHiddenElements: true,
    });
    expect(sanityImage.props.source).toBe(apGameplayImage);
    expect(sanityImage.props.recyclingKey).toBe('overview-AP_GAMEPLAY');
    expect(sanityImage.props.contentFit).toBe('contain');
    expect(sanityImage.props.cachePolicy).toBe('memory-disk');
    expect(screen.getByTestId('overview-sanity-image-filter', { includeHiddenElements: true }).props.source).toBe(filter);
  });

  it('keeps artwork mounted when game detail is unavailable', async () => {
    const screen = await renderOverview(null);

    expect(screen.getByTestId('overview-balance-image-GOLD')).toBeTruthy();
    expect(screen.getByTestId('overview-sanity-image')).toBeTruthy();
    expect(screen.queryByTestId('overview-sanity-status-row')).toBeNull();
  });

  it('renders the sanity reading without a capacity summary below the meter', async () => {
    const screen = await renderOverview();

    expect(screen.getByTestId('overview-sanity-current').props.children).toBe(19);
    expect(screen.queryByTestId('overview-sanity-status-row')).toBeNull();
  });

  it('moves the overflow state into the status row when sanity reaches capacity', async () => {
    const atCapacityDetail = gameDetail
      ? {
          ...gameDetail,
          status: {
            ...gameDetail.status,
            ap: gameDetail.status.maxAp,
          },
        }
      : null;
    const screen = await renderOverview(atCapacityDetail);

    expect(screen.getByTestId('overview-sanity-current').props.children).toBe(210);
    expect(screen.getByTestId('overview-sanity-status').props.children).toBe(i18n.t('overview.overflow', { ns: 'dashboard' }));
    expect(screen.getByTestId('overview-sanity-status-row')).toBeTruthy();
  });

  it('renders the current stage as a truncated title and subtitle', async () => {
    const screen = await renderOverview(
      gameDetail,
      '1-7-AN-EXTREMELY-LONG-STAGE-CODE',
      '这是一个很长很长的关卡名称，用来验证卡片内的尾部截断行为',
    );
    const title = screen.getByTestId('overview-operation-map-title');
    const subtitle = screen.getByTestId('overview-operation-map-subtitle');

    expect(title.props.children).toBe('1-7-AN-EXTREMELY-LONG-STAGE-CODE');
    expect(title.props.numberOfLines).toBe(1);
    expect(title.props.ellipsizeMode).toBe('tail');
    expect(subtitle.props.children).toBe('这是一个很长很长的关卡名称，用来验证卡片内的尾部截断行为');
    expect(subtitle.props.numberOfLines).toBe(1);
    expect(subtitle.props.ellipsizeMode).toBe('tail');
  });
});
