import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { XStack, YStack, getTokens } from 'tamagui';

import { MonoText, type ScrollViewportMetrics, TerminalCornerBrackets, TerminalPanel, TerminalSectionHeading, TerminalText } from '@/components';
import type { ActivityTimelineEntry } from '@/schemas/game-account';
import { DashboardViewportReveal } from './dashboard-viewport-reveal';

const toneByCategory: Record<ActivityTimelineEntry['category'], 'cyan' | 'warning' | 'danger' | 'default'> = {
  event: 'cyan',
  banner: 'warning',
  maintenance: 'danger',
  notice: 'default',
};

const INITIAL_RAIL_PROGRESS = 0.48;
const FULL_RAIL_PROGRESS_SCROLL_OFFSET = 550;

function TimelineProgressRail({ viewport }: { viewport: ScrollViewportMetrics }) {
  const colors = getTokens().color;
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{
      scaleY: interpolate(
        viewport.offset.get(),
        [0, FULL_RAIL_PROGRESS_SCROLL_OFFSET],
        [INITIAL_RAIL_PROGRESS, 1],
        Extrapolation.CLAMP,
      ),
    }],
  }));

  return <Animated.View style={[styles.progressRail, { backgroundColor: colors.terminalCyan.val }, animatedStyle]} />;
}

export function ActivityTimelineView({ entries, viewport }: { entries: readonly ActivityTimelineEntry[]; viewport: ScrollViewportMetrics }) {
  const { t } = useTranslation('dashboard');
  return (
    <YStack width="100%" maxW={860} self="center" gap={16} pb="$4">
      <TerminalSectionHeading code="LOG" title={t('timeline.title')} subtitle="TIMELINE" />
      <YStack position="relative" gap={12}>
        <YStack position="absolute" t={0} b={0} l={9} width={1} bg="$terminalBorder" />
        <TimelineProgressRail viewport={viewport} />
        {entries.map((entry, index) => (
          <DashboardViewportReveal key={entry.id} index={index} origin="left" viewport={viewport}>
          <XStack position="relative" pl={40}>
            <YStack position="absolute" l={3} t={16} width={12} height={12} rotate="45deg" borderWidth={1} borderColor="$terminalCyan" bg="$terminalBg" items="center" justify="center">
              <YStack width={4} height={4} bg="$terminalCyan" />
            </YStack>
            <TerminalPanel width="100%" p={12} tone={toneByCategory[entry.category]}>
              <TerminalCornerBrackets />
              <XStack items="center" justify="space-between" gap="$2">
                <MonoText size="$1" color={entry.category === 'banner' ? '$terminalWarning' : entry.category === 'maintenance' ? '$terminalDanger' : entry.category === 'notice' ? '$terminalMuted' : '$terminalCyan'}>{entry.tag}</MonoText>
                <YStack px="$2" py="$0.5" bg={entry.status === 'active' ? '$terminalSuccessSoft' : entry.status === 'upcoming' ? '$terminalWarningSoft' : '$terminalRaised'}>
                  <MonoText size="$1" color={entry.status === 'active' ? '$terminalSuccess' : entry.status === 'upcoming' ? '$terminalWarning' : '$terminalMuted'}>{t(`timeline.status.${entry.status}`)}</MonoText>
                </YStack>
              </XStack>
              <TerminalText mt={4} size="$4" fontWeight="800">{entry.title}</TerminalText>
              <MonoText mt={8} size="$1">{entry.scheduleLabel}</MonoText>
              <TerminalText mt={8} size="$3" lineHeight="$4" color="$terminalMuted">{entry.description}</TerminalText>
            </TerminalPanel>
          </XStack>
          </DashboardViewportReveal>
        ))}
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  progressRail: {
    bottom: 0,
    left: 9,
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    transformOrigin: 'top',
    width: 1,
  },
});
