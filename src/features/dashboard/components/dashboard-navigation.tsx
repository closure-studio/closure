import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LayoutChangeEvent } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';
import { Button, ScrollView, XStack, YStack, getTokens } from 'tamagui';

import { MonoText, SlidingSelection, TerminalText } from '@/components';
import type { GameAccount } from '@/schemas/game-account';
import { formatCompactNumber } from '../utils';

const GAME_ACCOUNT_NOTCH_SIZE = 12;

type NotchedSurfaceProps = {
  fill: string;
  fillOpacity?: number;
  stroke: string;
  strokeDasharray?: string;
};

function NotchedSurface({
  fill,
  fillOpacity = 1,
  stroke,
  strokeDasharray,
}: NotchedSurfaceProps) {
  const [layout, setLayout] = useState({ height: 0, width: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setLayout((currentLayout) => (
      currentLayout.height === height && currentLayout.width === width
        ? currentLayout
        : { height, width }
    ));
  };

  const { height, width } = layout;
  const fillPoints = `0,0 ${width - GAME_ACCOUNT_NOTCH_SIZE},0 ${width},${GAME_ACCOUNT_NOTCH_SIZE} ${width},${height} ${GAME_ACCOUNT_NOTCH_SIZE},${height} 0,${height - GAME_ACCOUNT_NOTCH_SIZE}`;
  const strokeInset = 0.5;
  const strokePath = [
    `M${strokeInset},${strokeInset} H${width - GAME_ACCOUNT_NOTCH_SIZE - strokeInset}`,
    `M${width - strokeInset},${GAME_ACCOUNT_NOTCH_SIZE + strokeInset} V${height - strokeInset}`,
    `M${width - strokeInset},${height - strokeInset} H${GAME_ACCOUNT_NOTCH_SIZE + strokeInset}`,
    `M${strokeInset},${height - GAME_ACCOUNT_NOTCH_SIZE - strokeInset} V${strokeInset}`,
  ].join(' ');

  return (
    <YStack
      position="absolute"
      t={0}
      b={0}
      l={0}
      r={0}
      z={0}
      style={{ pointerEvents: 'none' }}
      onLayout={handleLayout}
    >
      {width > 0 && height > 0 ? (
        <Svg width={width} height={height} style={{ pointerEvents: 'none' }}>
          <Polygon points={fillPoints} fill={fill} fillOpacity={fillOpacity} />
          <Path
            d={strokePath}
            fill="none"
            stroke={stroke}
            strokeWidth={1}
            {...(strokeDasharray ? { strokeDasharray } : {})}
          />
        </Svg>
      ) : null}
    </YStack>
  );
}

function GameAccountSelectionIndicator() {
  const colors = getTokens().color;

  return (
    <YStack position="relative" width="100%" height="100%">
      <NotchedSurface
        fill={colors.appAccentSoft.val}
        fillOpacity={0.5}
        stroke={colors.appAccentBorder.val}
      />
    </YStack>
  );
}

function GameAccountButton({ gameAccount, isActive, onPress }: { gameAccount: GameAccount; isActive: boolean; onPress: () => void }) {
  const { t } = useTranslation('dashboard');
  const colors = getTokens().color;
  const avatarTone = gameAccount.color === 'warning'
    ? '$appWarningRing'
    : gameAccount.color === 'primary'
      ? '$appAccentRing'
      : '$appMutedRing';
  const avatarColor = gameAccount.color === 'warning'
    ? '$appWarning'
    : gameAccount.color === 'primary'
      ? '$appAccent'
      : '$appMuted';

  return (
    <Button
      unstyled
      height={50}
      shrink={0}
      px={12}
      py={8}
      flexDirection="row"
      items="center"
      justify="flex-start"
      position="relative"
      bg="transparent"
      hoverStyle={isActive ? null : { opacity: 0.9 }}
      pressStyle={{ opacity: 0.72 }}
      onPress={onPress}
      aria-pressed={isActive}
    >
      <NotchedSurface
        fill={colors.appSurfaceRaised.val}
        stroke={isActive ? colors.appAccentBorder.val : colors.appBorder.val}
      />
      <XStack position="relative" z="$1" items="center" gap={10}>
        <YStack width={32} height={32} shrink={0} items="center" justify="center" bg="$appSurfaceStrong" borderWidth={1} borderColor={avatarTone}>
          <TerminalText size="$3" fontWeight="700" color={avatarColor}>{gameAccount.avatar}</TerminalText>
        </YStack>
        <YStack shrink={0}>
          <MonoText size="$2" lineHeight="$1" letterSpacing={0} color={isActive ? '$appText' : '$appMuted'} fontWeight="600" numberOfLines={1}>{gameAccount.callsign}</MonoText>
          <MonoText size="$1" letterSpacing={0} textTransform="uppercase" numberOfLines={1}>{t('operators.accountLevel', { level: gameAccount.doctorLevel })} · {formatCompactNumber(gameAccount.orundum)} ♦</MonoText>
        </YStack>
        <YStack width={6} height={6} shrink={0} rounded="$10" bg={gameAccount.online === '在线' ? '$appSuccess' : '$appMuted'} opacity={gameAccount.online === '在线' ? 1 : 0.5} />
      </XStack>
    </Button>
  );
}

function LinkGameAccountButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation('common');
  const { t: tDashboard } = useTranslation('dashboard');
  const colors = getTokens().color;

  return (
    <Button
      unstyled
      height={50}
      shrink={0}
      px={12}
      py={8}
      flexDirection="row"
      items="center"
      position="relative"
      bg="transparent"
      hoverStyle={{ opacity: 0.9 }}
      pressStyle={{ opacity: 0.72 }}
      onPress={onPress}
      aria-label={tDashboard('account.title')}
    >
      <NotchedSurface
        fill={colors.appSurfaceRaised.val}
        stroke={colors.appBorder.val}
        strokeDasharray="4 3"
      />
      <XStack position="relative" z="$1" items="center" gap={8}>
        <YStack width={32} height={32} items="center" justify="center" bg="$appSurfaceStrong">
          <Plus size={16} color={colors.appMuted.val} />
        </YStack>
        <MonoText size="$2" letterSpacing={0} fontWeight="600" color="$appMuted" textTransform="uppercase">
          {t('actions.add')}
        </MonoText>
      </XStack>
    </Button>
  );
}

export function GameAccountSwitcher({ gameAccounts, activeGameAccountId, onSelectGameAccount, onLinkGameAccount }: { gameAccounts: readonly GameAccount[]; activeGameAccountId: string; onSelectGameAccount: (gameAccountId: string) => void; onLinkGameAccount: () => void }) {
  return (
    <ScrollView mx="$-3.5" horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ pb: 1 }} $md={{ mx: '$-5' }}>
      <YStack px="$3.5" $md={{ px: '$5' }}>
        <SlidingSelection value={activeGameAccountId} indicator={<GameAccountSelectionIndicator />}>
          {gameAccounts.map((gameAccount) => (
            <SlidingSelection.Item key={gameAccount.id} value={gameAccount.id}>
              <GameAccountButton gameAccount={gameAccount} isActive={gameAccount.id === activeGameAccountId} onPress={() => onSelectGameAccount(gameAccount.id)} />
            </SlidingSelection.Item>
          ))}
          <LinkGameAccountButton onPress={onLinkGameAccount} />
        </SlidingSelection>
      </YStack>
    </ScrollView>
  );
}
