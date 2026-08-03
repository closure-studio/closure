import { RefreshCw, Router, Signal, SignalZero } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, RadioGroup, Spinner, XStack, YStack, getTokens } from 'tamagui';

import {
  MonoText,
  SectionPageHeader,
  TerminalPanel,
  TerminalSectionHeading,
  TerminalText,
} from '@/components';
import { apiNodeIdSchema } from '@/schemas/api-node';
import * as v from 'valibot';
import { SettingsPage } from '../components/settings-page';
import { mockApiNodes } from '../mocks/settings-mocks';
import { useSettingsMockState } from '../settings-mock-context';

const API_NODE_DETECTION_DELAY_MS = 650;

export function NetworkSettingsScreen() {
  const { t } = useTranslation('settings');
  const colors = getTokens().color;
  const { selectApiNode, selectedApiNodeId } = useSettingsMockState();
  const [detectionRun, setDetectionRun] = useState(0);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const detectionTimer = setTimeout(() => {
      setIsChecking(false);
    }, API_NODE_DETECTION_DELAY_MS);

    return () => clearTimeout(detectionTimer);
  }, [detectionRun]);

  const handleNodeChange = (candidateNodeId: string) => {
    const result = v.safeParse(apiNodeIdSchema, candidateNodeId);
    if (!result.success || result.output === selectedApiNodeId) return;

    selectApiNode(result.output);
    console.info('Mock API Node selected.', { apiNodeId: result.output });
  };

  return (
    <SettingsPage>
      <SectionPageHeader
        code={t('network.code')}
        description={t('network.description')}
        eyebrow={t('network.eyebrow')}
        status={t('network.status')}
        title={t('network.title')}
      />

      <TerminalPanel p="$3.5" gap="$4" cornerBrackets $md={{ p: '$5' }}>
        <XStack flexDirection="column" gap="$3" $sm={{ flexDirection: 'row', items: 'center', justify: 'space-between' }}>
          <TerminalSectionHeading
            code={t('network.nodesCode')}
            title={t('network.nodesTitle')}
            subtitle={t('network.nodesSubtitle')}
          />
          <Button
            unstyled
            minH="$4"
            px="$3"
            flexDirection="row"
            items="center"
            justify="center"
            gap="$2"
            borderWidth={1}
            borderColor="$terminalBorder"
            bg="$terminalRaisedTranslucent"
            hoverStyle={{ borderColor: '$terminalCyanBorder', bg: '$terminalCyanSoft' }}
            pressStyle={{ opacity: 0.7 }}
            focusVisibleStyle={{ borderColor: '$terminalCyan' }}
            onPress={() => {
              setIsChecking(true);
              setDetectionRun((run) => run + 1);
            }}
            aria-label={t('network.retestLabel')}
          >
            <RefreshCw size={15} color={colors.terminalCyan.val} />
            <MonoText size="$2.5" color="$terminalCyan">{t('network.retest')}</MonoText>
          </Button>
        </XStack>

        <RadioGroup value={selectedApiNodeId} onValueChange={handleNodeChange} gap="$3" aria-label={t('network.nodesTitle')}>
          {mockApiNodes.map((apiNode, index) => {
            const isSelected = apiNode.id === selectedApiNodeId;
            const isReachable = apiNode.outcome === 'reachable';
            const statusTone = isChecking
              ? '$terminalMuted'
              : isReachable
                ? '$terminalSuccess'
                : '$terminalDanger';
            const statusColor = isChecking
              ? colors.terminalMuted.val
              : isReachable
                ? colors.terminalSuccess.val
                : colors.terminalDanger.val;
            const StatusIcon = isReachable ? Signal : SignalZero;

            return (
              <RadioGroup.Item
                key={apiNode.id}
                unstyled
                id={`api-node-${apiNode.id}`}
                value={apiNode.id}
                width="100%"
                p={0}
                rounded="$0"
                borderWidth={1}
                borderColor="transparent"
                pressStyle={{ opacity: 0.75 }}
                focusVisibleStyle={{ borderColor: '$terminalCyan' }}
                aria-label={t(`network.nodes.${apiNode.id}`)}
              >
                <TerminalPanel
                  width="100%"
                  p="$3.5"
                  gap="$3"
                  tone={isSelected ? 'cyan' : 'default'}
                  $md={{ p: '$4.5' }}
                >
                  <XStack items="center" gap="$3">
                    <YStack
                      width="$1.5"
                      height="$1.5"
                      items="center"
                      justify="center"
                      rounded="$0"
                      borderWidth={1}
                      borderColor="$terminalMutedRing"
                      bg="$terminalBg"
                    >
                      <RadioGroup.Indicator
                        unstyled
                        width="$0.75"
                        height="$0.75"
                        rounded="$0"
                        bg="$terminalCyan"
                      />
                    </YStack>
                    <Router size={21} color={isSelected ? colors.terminalCyan.val : colors.terminalMuted.val} strokeWidth={1.6} />
                    <YStack grow={1} minW={0} gap="$1">
                      <XStack items="center" justify="space-between" gap="$2">
                        <TerminalText size="$4" fontWeight="700" numberOfLines={1}>
                          {t(`network.nodes.${apiNode.id}`)}
                        </TerminalText>
                        <MonoText size="$1" color={isSelected ? '$terminalCyan' : '$terminalMuted'}>
                          {isSelected ? t('network.active') : t('network.switch')}
                        </MonoText>
                      </XStack>
                      <MonoText size="$2" numberOfLines={1}>{apiNode.description}</MonoText>
                    </YStack>
                  </XStack>

                  <XStack
                    minH="$4.5"
                    px="$3"
                    items="center"
                    justify="space-between"
                    gap="$3"
                    borderWidth={1}
                    borderColor={isSelected ? '$terminalCyanBorder' : '$terminalBorder'}
                    bg="$terminalBg"
                  >
                    <XStack items="center" gap="$2">
                      <StatusIcon size={16} color={statusColor} />
                      <MonoText size="$2">{t('network.latency')}</MonoText>
                    </XStack>
                    {isChecking ? (
                      <XStack items="center" gap="$2">
                        <Spinner size="small" color="$terminalCyan" />
                        <MonoText size="$2" color="$terminalCyan">{t('network.checking')}</MonoText>
                      </XStack>
                    ) : (
                      <YStack items="flex-end" gap="$0.5">
                        <TerminalText size="$4" fontWeight="700" color={statusTone} fontVariant={['tabular-nums']}>
                          {isReachable ? `${apiNode.mockLatencyMs} MS` : '--'}
                        </TerminalText>
                        <MonoText size="$1" color={statusTone}>
                          {t(isReachable ? 'network.connected' : 'network.unreachable')}
                        </MonoText>
                      </YStack>
                    )}
                  </XStack>

                  <YStack position="absolute" t="$2" r="$2">
                    <MonoText size="$1">{String(index + 1).padStart(2, '0')}</MonoText>
                  </YStack>
                </TerminalPanel>
              </RadioGroup.Item>
            );
          })}
        </RadioGroup>

        <MonoText size="$1" color="$terminalWarning">{t('network.mockNotice')}</MonoText>
      </TerminalPanel>
    </SettingsPage>
  );
}
