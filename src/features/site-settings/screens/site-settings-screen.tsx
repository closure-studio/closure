import { Monitor, Smartphone, Tablet } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, XStack, YStack, getTokens } from 'tamagui';

import {
  MonoText,
  SectionPageHeader,
  TerminalPanel,
  TerminalSectionHeading,
  TerminalText,
} from '@/components';

const layoutGuides = [
  { id: 'frame', size: '256 PX', value: 82 },
  { id: 'ticker', size: '40 PX', value: 66 },
  { id: 'content', size: '1180 PX', value: 94 },
  { id: 'rhythm', size: '8 PT', value: 54 },
] as const;

const viewports = [
  { id: 'desktop', icon: Monitor, measure: '1440 × 1024' },
  { id: 'tablet', icon: Tablet, measure: '834 × 1194' },
  { id: 'mobile', icon: Smartphone, measure: '390 × 844' },
] as const;

export function SiteSettingsScreen() {
  const { t } = useTranslation('site-settings');
  const colors = getTokens().color;

  return (
    <ScrollView grow={1} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ grow: 1 }}>
      <YStack width="100%" maxW={1180} self="center" p="$3.5" pb="$8" gap="$5" $md={{ p: '$5', pb: '$9' }}>
        <SectionPageHeader code={t('code')} description={t('description')} eyebrow={t('eyebrow')} status={t('status')} title={t('title')} />

        <XStack flexDirection="column" gap="$4" $lg={{ flexDirection: 'row' }}>
          <TerminalPanel grow={1.4} minH={480} p="$3.5" gap="$4" cornerBrackets $md={{ p: '$5' }}>
            <TerminalSectionHeading code={t('blueprintCode')} title={t('blueprintTitle')} subtitle={t('blueprintSubtitle')} />
            <YStack grow={1} minH={340} borderWidth={1} borderColor="$terminalCyanBorder" bg="$terminalBg" position="relative" overflow="hidden">
              <YStack position="absolute" t={0} b={0} l="33.333%" width={1} bg="$terminalGrid" />
              <YStack position="absolute" t={0} b={0} l="66.666%" width={1} bg="$terminalGrid" />
              <YStack position="absolute" l={0} r={0} t="33.333%" height={1} bg="$terminalGrid" />
              <YStack position="absolute" l={0} r={0} t="66.666%" height={1} bg="$terminalGrid" />
              <XStack height="$4" px="$2" items="center" justify="space-between" borderBottomWidth={1} borderColor="$terminalBorder" bg="$terminalRaised">
                <XStack gap="$1"><YStack width={5} height={5} rounded="$10" bg="$terminalDanger" /><YStack width={5} height={5} rounded="$10" bg="$terminalWarning" /><YStack width={5} height={5} rounded="$10" bg="$terminalSuccess" /></XStack>
                <MonoText size="$1">{t('previewAddress')}</MonoText>
              </XStack>
              <XStack grow={1} minH={0}>
                <YStack width="23%" p="$2" gap="$2" borderRightWidth={1} borderColor="$terminalBorder">
                  <YStack height="$3" bg="$terminalCyanSoft" borderWidth={1} borderColor="$terminalCyanBorder" />
                  {[0, 1, 2, 3].map((item) => <YStack key={item} height="$2" bg="$terminalRaised" />)}
                </YStack>
                <YStack grow={1} p="$3" gap="$3">
                  <XStack height="$3" borderWidth={1} borderColor="$terminalBorder" bg="$terminalRaisedTranslucent" />
                  <XStack grow={1} gap="$3">
                    <YStack grow={1} borderWidth={1} borderColor="$terminalCyanBorder" bg="$terminalCyanSoft" p="$3" justify="flex-end">
                      <MonoText size="$1" color="$terminalCyan">{t('canvasPrimary')}</MonoText>
                    </YStack>
                    <YStack width="31%" gap="$3"><YStack grow={1} borderWidth={1} borderColor="$terminalBorder" /><YStack grow={1} borderWidth={1} borderColor="$terminalBorder" /></YStack>
                  </XStack>
                </YStack>
              </XStack>
              <XStack position="absolute" b="$2" r="$2" px="$2" py="$1" bg="$terminalSurfaceStrong" borderWidth={1} borderColor="$terminalCyanBorder">
                <MonoText size="$1" color="$terminalCyan">{t('liveGrid')}</MonoText>
              </XStack>
            </YStack>
          </TerminalPanel>

          <YStack grow={1} minW={0} gap="$4" $lg={{ maxW: 390 }}>
            <TerminalPanel p="$3.5" gap="$3" $md={{ p: '$4' }}>
              <TerminalSectionHeading code={t('guidesCode')} title={t('guidesTitle')} />
              {layoutGuides.map((guide) => (
                <YStack key={guide.id} gap="$2" py="$1.5">
                  <XStack items="center" justify="space-between" gap="$2">
                    <MonoText size="$1">{t(`guides.${guide.id}`)}</MonoText>
                    <TerminalText size="$2.5" color="$terminalCyan" fontWeight="700">{guide.size}</TerminalText>
                  </XStack>
                  <YStack height={3} bg="$terminalRaised"><YStack height="100%" width={`${guide.value}%`} bg="$terminalCyan" /></YStack>
                </YStack>
              ))}
            </TerminalPanel>

            <TerminalPanel p="$3.5" gap="$3" tone="cyan" $md={{ p: '$4' }}>
              <TerminalSectionHeading code={t('viewportCode')} title={t('viewportTitle')} />
              {viewports.map((viewport) => {
                const Icon = viewport.icon;
                return (
                  <XStack key={viewport.id} minH="$4.5" px="$2" items="center" gap="$3" borderBottomWidth={1} borderColor="$terminalBorder">
                    <Icon size={18} color={colors.terminalCyan.val} strokeWidth={1.5} />
                    <YStack grow={1}><TerminalText size="$2.5" fontWeight="600">{t(`viewports.${viewport.id}`)}</TerminalText><MonoText size="$1">{viewport.measure}</MonoText></YStack>
                    <MonoText size="$1" color="$terminalSuccess">{t('synced')}</MonoText>
                  </XStack>
                );
              })}
            </TerminalPanel>
          </YStack>
        </XStack>
      </YStack>
    </ScrollView>
  );
}
