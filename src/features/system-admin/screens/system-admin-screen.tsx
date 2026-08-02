import { Cpu, Database, RadioTower, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, XStack, YStack, getTokens } from 'tamagui';

import {
  MonoText,
  SectionPageHeader,
  TerminalMeterBar,
  TerminalPanel,
  TerminalSectionHeading,
  TerminalText,
} from '@/components';

const topologyNodes = [
  { id: 'edge', icon: RadioTower, load: 72, tone: 'cyan' },
  { id: 'core', icon: Cpu, load: 48, tone: 'success' },
  { id: 'data', icon: Database, load: 63, tone: 'warning' },
  { id: 'guard', icon: ShieldCheck, load: 91, tone: 'cyan' },
] as const;

const systemMetrics = [
  { id: 'uptime', value: '99.982%' },
  { id: 'latency', value: '18 MS' },
  { id: 'requests', value: '2.4 M' },
] as const;

export function SystemAdminScreen() {
  const { t } = useTranslation('system-admin');
  const colors = getTokens().color;

  return (
    <ScrollView grow={1} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ grow: 1 }}>
      <YStack width="100%" maxW={1180} self="center" p="$3.5" pb="$8" gap="$5" $md={{ p: '$5', pb: '$9' }}>
        <SectionPageHeader code={t('code')} description={t('description')} eyebrow={t('eyebrow')} status={t('status')} title={t('title')} />

        <XStack flexDirection="column" gap="$3" $md={{ flexDirection: 'row' }}>
          {systemMetrics.map((metric, index) => (
            <TerminalPanel key={metric.id} grow={1} minH={112} p="$3.5" justify="space-between" tone={index === 0 ? 'cyan' : 'default'}>
              <MonoText size="$1">{t(`metrics.${metric.id}`)}</MonoText>
              <TerminalText size="$7" fontWeight="700" color={index === 0 ? '$terminalCyan' : '$terminalText'}>{metric.value}</TerminalText>
            </TerminalPanel>
          ))}
        </XStack>

        <TerminalPanel p="$3.5" gap="$4" cornerBrackets $md={{ p: '$5' }}>
          <TerminalSectionHeading code={t('topologyCode')} title={t('topologyTitle')} subtitle={t('topologySubtitle')} />
          <XStack flexDirection="column" items="stretch" gap="$2" py="$3" $lg={{ flexDirection: 'row', items: 'center' }}>
            {topologyNodes.map((node, index) => {
              const Icon = node.icon;
              return (
                <XStack key={node.id} grow={1} flexDirection="column" items="stretch" gap="$2" $lg={{ flexDirection: 'row', items: 'center' }}>
                  <YStack grow={1} minH={176} p="$3" justify="space-between" bg="$terminalRaisedTranslucent" borderWidth={1} borderColor={index === 1 ? '$terminalCyanBorder' : '$terminalBorder'}>
                    <XStack items="center" justify="space-between">
                      <MonoText size="$1" color={index === 1 ? '$terminalCyan' : '$terminalMuted'}>{String(index + 1).padStart(2, '0')}</MonoText>
                      <Icon size={22} color={index === 1 ? colors.terminalCyan.val : colors.terminalMuted.val} strokeWidth={1.5} />
                    </XStack>
                    <YStack gap="$1">
                      <TerminalText size="$5" fontWeight="700">{t(`nodes.${node.id}.label`)}</TerminalText>
                      <MonoText size="$1">{t(`nodes.${node.id}.detail`)}</MonoText>
                    </YStack>
                    <YStack gap="$2">
                      <XStack justify="space-between"><MonoText size="$1">{t('load')}</MonoText><MonoText size="$1" color="$terminalCyan">{node.load}%</MonoText></XStack>
                      <TerminalMeterBar value={node.load} tone={node.tone} />
                    </YStack>
                  </YStack>
                  {index < topologyNodes.length - 1 ? (
                    <YStack self="center" width={1} height="$3" bg="$terminalCyanBorder" $lg={{ width: '$3', height: 1 }} />
                  ) : null}
                </XStack>
              );
            })}
          </XStack>
          <XStack flexDirection="column" gap="$2" borderTopWidth={1} borderColor="$terminalBorder" pt="$3" $sm={{ flexDirection: 'row', justify: 'space-between' }}>
            <MonoText size="$1" color="$terminalSuccess">{t('integrity')}</MonoText>
            <MonoText size="$1">{t('lastHandshake')}</MonoText>
          </XStack>
        </TerminalPanel>
      </YStack>
    </ScrollView>
  );
}
