import { CircleDot, Clapperboard, Radio, ScanLine } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, XStack, YStack, getTokens } from 'tamagui';

import {
  MonoText,
  SectionPageHeader,
  TerminalPanel,
  TerminalSectionHeading,
  TerminalText,
} from '@/components';

const recordingTracks = [
  { id: 'launch', offset: '4%', width: '26%', time: '00:00:00' },
  { id: 'briefing', offset: '20%', width: '44%', time: '00:08:24' },
  { id: 'operation', offset: '49%', width: '38%', time: '00:21:16' },
  { id: 'archive', offset: '73%', width: '20%', time: '00:36:08' },
] as const;

const recordingStats = [
  { id: 'live', value: '03' },
  { id: 'stored', value: '128' },
  { id: 'capacity', value: '78%' },
] as const;

export function RecordingCenterScreen() {
  const { t } = useTranslation('recording-center');
  const colors = getTokens().color;

  return (
    <ScrollView grow={1} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ grow: 1 }}>
      <YStack width="100%" maxW={1180} self="center" p="$3.5" pb="$8" gap="$5" $md={{ p: '$5', pb: '$9' }}>
        <SectionPageHeader code={t('code')} description={t('description')} eyebrow={t('eyebrow')} status={t('status')} title={t('title')} />

        <XStack flexDirection="column" gap="$3" $md={{ flexDirection: 'row' }}>
          {recordingStats.map((stat, index) => (
            <TerminalPanel key={stat.id} grow={1} p="$3.5" minH={104} flexDirection="row" items="flex-end" justify="space-between" tone={index === 0 ? 'danger' : 'default'}>
              <YStack gap="$1"><MonoText size="$1">{t(`stats.${stat.id}`)}</MonoText><MonoText size="$1" color={index === 0 ? '$terminalDanger' : '$terminalMuted'}>{t(`stats.${stat.id}Detail`)}</MonoText></YStack>
              <TerminalText size="$8" lineHeight="$8" fontWeight="800" color={index === 0 ? '$terminalDanger' : '$terminalText'}>{stat.value}</TerminalText>
            </TerminalPanel>
          ))}
        </XStack>

        <TerminalPanel p="$3.5" gap="$4" cornerBrackets $md={{ p: '$5' }}>
          <XStack flexDirection="column" gap="$3" $sm={{ flexDirection: 'row', items: 'center', justify: 'space-between' }}>
            <TerminalSectionHeading code={t('timelineCode')} title={t('timelineTitle')} subtitle={t('timelineSubtitle')} />
            <XStack items="center" gap="$2"><CircleDot size={14} color={colors.terminalDanger.val} /><MonoText size="$1" color="$terminalDanger">{t('captureActive')}</MonoText></XStack>
          </XStack>

          <YStack height={248} borderWidth={1} borderColor="$terminalBorder" bg="$terminalBg" position="relative" overflow="hidden">
            {[0, 1, 2, 3, 4].map((marker) => (
              <YStack key={marker} position="absolute" t={0} b={0} l={`${marker * 25}%`} width={1} bg="$terminalGrid" />
            ))}
            <XStack height="$4" px="$3" items="center" justify="space-between" borderBottomWidth={1} borderColor="$terminalBorder" bg="$terminalRaisedTranslucent">
              <MonoText size="$1">{t('sequence')}</MonoText>
              <MonoText size="$1" color="$terminalCyan">{t('timecode')}</MonoText>
            </XStack>
            <YStack grow={1} py="$3" gap="$2.5">
              {recordingTracks.map((track, index) => (
                <XStack key={track.id} grow={1} minH={34} items="center" position="relative">
                  <XStack width={76} height="100%" px="$2" items="center" borderRightWidth={1} borderColor="$terminalBorder"><MonoText size="$1">{String(index + 1).padStart(2, '0')}</MonoText></XStack>
                  <YStack grow={1} height="100%" position="relative">
                    <XStack position="absolute" l={track.offset} width={track.width} t="$1" b="$1" px="$2" items="center" justify="space-between" gap="$2" bg={index === 2 ? '$terminalCyanSoft' : '$terminalRaised'} borderWidth={1} borderColor={index === 2 ? '$terminalCyanBorder' : '$terminalBorder'}>
                      <TerminalText size="$2" color={index === 2 ? '$terminalCyan' : '$terminalMuted'} numberOfLines={1}>{t(`tracks.${track.id}`)}</TerminalText>
                      <MonoText size="$1" numberOfLines={1}>{track.time}</MonoText>
                    </XStack>
                  </YStack>
                </XStack>
              ))}
            </YStack>
            <YStack position="absolute" t="$4" b={0} l="61%" width={1} bg="$terminalDanger">
              <YStack position="absolute" t={0} l={-3} width={7} height={7} bg="$terminalDanger" />
            </YStack>
          </YStack>

          <XStack flexDirection="column" gap="$2" $sm={{ flexDirection: 'row' }}>
            <XStack grow={1} minH="$4.5" px="$3" items="center" gap="$3" borderWidth={1} borderColor="$terminalBorder"><Clapperboard size={17} color={colors.terminalMuted.val} /><MonoText size="$1">{t('codec')}</MonoText></XStack>
            <XStack grow={1} minH="$4.5" px="$3" items="center" gap="$3" borderWidth={1} borderColor="$terminalBorder"><Radio size={17} color={colors.terminalSuccess.val} /><MonoText size="$1">{t('stream')}</MonoText></XStack>
            <XStack grow={1} minH="$4.5" px="$3" items="center" gap="$3" borderWidth={1} borderColor="$terminalBorder"><ScanLine size={17} color={colors.terminalCyan.val} /><MonoText size="$1">{t('scan')}</MonoText></XStack>
          </XStack>
        </TerminalPanel>
      </YStack>
    </ScrollView>
  );
}
