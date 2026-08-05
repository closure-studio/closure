import {
  Activity,
  Circle,
  CircleDot,
  Clock3,
  RefreshCw,
  Route,
  Server,
  Signal,
  SignalZero,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import {
  AnimatePresence,
  Button,
  RadioGroup,
  Spinner,
  XStack,
  YStack,
  getTokens,
  useMedia,
} from 'tamagui';
import * as v from 'valibot';

import {
  MonoText,
  NotchedButton,
  NotchedSelectionIndicator,
  SectionPageHeader,
  SlidingSelection,
  TerminalNotice,
  TerminalPanel,
  TerminalText,
} from '@/components';
import { apiNodeIdSchema } from '@/schemas/api-node';
import { SettingsPage } from '../components/settings-page';
import { mockApiNodes } from '../mocks/settings-mocks';
import { useSettingsMockState } from '../settings-mock-context';

const API_NODE_DETECTION_DELAY_MS = 650;
const LOW_LATENCY_MAX_MS = 80;
const ELEVATED_LATENCY_MAX_MS = 150;

type LatencyTone = '$appSuccess' | '$appWarning' | '$appDanger';

function resolveLatencyTone(latencyMs: number): LatencyTone {
  if (latencyMs <= LOW_LATENCY_MAX_MS) return '$appSuccess';
  if (latencyMs <= ELEVATED_LATENCY_MAX_MS) return '$appWarning';
  return '$appDanger';
}

export function NetworkSettingsScreen() {
  const { t } = useTranslation('settings');
  const colors = getTokens().color;
  const media = useMedia();
  const reducedMotion = useReducedMotion();
  const isDesktop = Boolean(media.md);
  const { selectApiNode, selectedApiNodeId } = useSettingsMockState();
  const [detectionRun, setDetectionRun] = useState(0);
  const [isChecking, setIsChecking] = useState(true);
  const selectedApiNode = mockApiNodes.find((apiNode) => apiNode.id === selectedApiNodeId);

  if (!selectedApiNode) {
    throw new Error(`Selected mock API Node is missing: ${selectedApiNodeId}`);
  }

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

  const handleRetest = () => {
    setIsChecking(true);
    setDetectionRun((run) => run + 1);
  };

  const activeNodeReachable = selectedApiNode.outcome === 'reachable';
  const activeLatencyTone = activeNodeReachable
    ? resolveLatencyTone(selectedApiNode.mockLatencyMs)
    : '$appDanger';
  const activeStatusColor = activeNodeReachable
    ? colors.appSuccess.val
    : colors.appDanger.val;

  return (
    <SettingsPage>
      {isDesktop ? (
        <SectionPageHeader
          code={t('network.code')}
          description={t('network.description')}
          eyebrow={t('network.eyebrow')}
          status={t('network.status')}
          title={t('network.title')}
        />
      ) : null}

      <YStack gap="$3" $md={{ gap: '$5' }}>
        {isDesktop ? (
          <TerminalPanel
            cornerBrackets
            minH={320}
            overflow="hidden"
            p="$6"
            gap="$5"
          >
          <YStack
            position="absolute"
            t={0}
            l={0}
            r={0}
            height={2}
            bg={isChecking ? '$appWarning' : '$appAccent'}
            transition={reducedMotion ? '0ms' : '500ms'}
            opacity={isChecking ? 1 : 0.55}
          />
          <YStack
            position="absolute"
            t="$4"
            r="$4"
            width="$12"
            height="$12"
            rounded="$10"
            borderWidth={1}
            borderColor="$appAccentBorder"
            opacity={0.22}
            scale={isChecking ? 1.08 : 1}
            transition={reducedMotion ? '0ms' : 'slow'}
            $md={{ t: '$5', r: '$6', width: '$15', height: '$15' }}
          />
          <YStack
            position="absolute"
            t="$6"
            r="$6"
            width="$8"
            height="$8"
            rounded="$10"
            borderWidth={1}
            borderColor="$appAccentBorder"
            opacity={0.12}
            $md={{ t: '$8', r: '$9', width: '$10', height: '$10' }}
          />

          <XStack items="center" justify="space-between" gap="$3">
            <XStack items="center" gap="$2">
              <Route size={16} color={colors.appAccent.val} strokeWidth={1.8} />
              <MonoText size="$1" color="$appAccent">
                {t('network.activeRoute')}
              </MonoText>
            </XStack>
            <MonoText size="$1">{t('network.sessionId')}</MonoText>
          </XStack>

          <XStack
            grow={1}
            flexDirection="column"
            justify="space-between"
            gap="$6"
            $md={{ flexDirection: 'row', items: 'flex-end', gap: '$8' }}
          >
            <YStack grow={1} minW={0} gap="$2">
              <MonoText size="$1" color="$appMuted">
                {selectedApiNode.description}
              </MonoText>
              <AnimatePresence mode="wait">
                <YStack
                  key={selectedApiNode.id}
                  transition={reducedMotion ? '0ms' : 'quickLessBouncy'}
                  enterStyle={reducedMotion ? null : { opacity: 0, x: -22 }}
                  exitStyle={reducedMotion ? null : { opacity: 0, x: 22 }}
                  opacity={1}
                  x={0}
                >
                  <TerminalText
                    size="$10"
                    lineHeight="$10"
                    fontWeight="900"
                    letterSpacing={-1.5}
                    color="$appText"
                    textTransform="uppercase"
                    numberOfLines={2}
                    $md={{ size: '$10', lineHeight: '$10' }}
                  >
                    {t(`network.nodes.${selectedApiNode.id}`)}
                  </TerminalText>
                </YStack>
              </AnimatePresence>
              <XStack items="center" gap="$2" pt="$2">
                {isChecking ? (
                  <Spinner size="small" color="$appWarning" />
                ) : activeNodeReachable ? (
                  <Signal size={15} color={activeStatusColor} strokeWidth={1.8} />
                ) : (
                  <SignalZero size={15} color={activeStatusColor} strokeWidth={1.8} />
                )}
                <MonoText
                  size="$2"
                  color={isChecking
                    ? '$appWarning'
                    : activeNodeReachable
                      ? '$appSuccess'
                      : '$appDanger'}
                >
                  {t(isChecking
                    ? 'network.checking'
                    : activeNodeReachable
                      ? 'network.connected'
                      : 'network.unreachable')}
                </MonoText>
              </XStack>
            </YStack>

            <YStack minW={180} items="flex-start" gap="$1" $md={{ items: 'flex-end' }}>
              <XStack items="center" gap="$2">
                <Activity size={14} color={colors.appMuted.val} strokeWidth={1.6} />
                <MonoText size="$1">{t('network.latency')}</MonoText>
              </XStack>
              <AnimatePresence mode="wait">
                <XStack
                  key={isChecking ? `checking-${detectionRun}` : `latency-${selectedApiNode.id}`}
                  items="baseline"
                  gap="$2"
                  transition={reducedMotion ? '0ms' : 'quickLessBouncy'}
                  enterStyle={reducedMotion ? null : { opacity: 0, y: 14, scale: 0.96 }}
                  exitStyle={reducedMotion ? null : { opacity: 0, y: -10, scale: 0.98 }}
                  opacity={1}
                  y={0}
                  scale={1}
                >
                  <TerminalText
                    size="$10"
                    lineHeight="$10"
                    fontWeight="900"
                    color={isChecking
                      ? '$appMuted'
                      : activeLatencyTone}
                    fontVariant={['tabular-nums']}
                  >
                    {isChecking ? '--' : activeNodeReachable ? selectedApiNode.mockLatencyMs : '--'}
                  </TerminalText>
                  <MonoText size="$3" color={isChecking ? '$appMuted' : activeLatencyTone}>
                    {t('network.latencyUnit')}
                  </MonoText>
                </XStack>
              </AnimatePresence>
            </YStack>
          </XStack>

          <XStack items="center" gap="$3">
            <YStack grow={1} height={1} bg="$appBorder" overflow="hidden">
              <YStack
                height="100%"
                width={isChecking ? '100%' : '34%'}
                bg={isChecking ? '$appWarning' : '$appAccent'}
                opacity={0.8}
                transition={reducedMotion ? '0ms' : 'slow'}
              />
            </YStack>
            <Clock3 size={13} color={colors.appMuted.val} strokeWidth={1.5} />
            <MonoText size="$1">{t('network.sessionOnly')}</MonoText>
          </XStack>
          </TerminalPanel>
        ) : null}

        <YStack gap="$3">
          {isDesktop ? (
            <XStack items="center" justify="space-between" gap="$3">
              <XStack items="baseline" gap="$2">
                <TerminalText size="$5" fontWeight="800">
                  {t('network.nodesTitle')}
                </TerminalText>
                <MonoText size="$1">
                  {t('network.nodeCount')} / {t('network.nodesSubtitle')}
                </MonoText>
              </XStack>
              <Button
                unstyled
                minH="$4"
                px="$3"
                flexDirection="row"
                items="center"
                justify="center"
                gap="$2"
                borderWidth={1}
                borderColor={isChecking ? '$appWarningBorder' : '$appAccentBorder'}
                bg={isChecking ? '$appWarningSoft' : '$appAccentSoft'}
                hoverStyle={{ borderColor: '$appAccent', bg: '$appAccentSoft' }}
                pressStyle={{ opacity: 0.72, scale: 0.98 }}
                focusVisibleStyle={{ borderColor: '$appText' }}
                disabled={isChecking}
                disabledStyle={{ opacity: 0.58 }}
                onPress={handleRetest}
                aria-label={t('network.retestLabel')}
                aria-busy={isChecking}
                $platform-web={{
                  clipPath: 'polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px))',
                }}
              >
                {isChecking ? (
                  <Spinner size="small" color="$appWarning" />
                ) : (
                  <RefreshCw size={15} color={colors.appAccent.val} strokeWidth={1.8} />
                )}
                <MonoText size="$2.5" color={isChecking ? '$appWarning' : '$appAccent'}>
                  {isChecking ? t('network.checking') : t('network.retest')}
                </MonoText>
              </Button>
            </XStack>
          ) : null}

          {!isDesktop ? (
            <MonoText
              size="$2"
              lineHeight="$3"
              color="$appText"
              selectable
            >
              {t('network.description')}
            </MonoText>
          ) : null}

          <RadioGroup
            value={selectedApiNodeId}
            onValueChange={handleNodeChange}
            width="100%"
            aria-label={t('network.nodesTitle')}
          >
            <SlidingSelection
              value={selectedApiNodeId}
              indicator={<NotchedSelectionIndicator />}
              width="100%"
              flexDirection="column"
              gap="$3"
              $lg={{ flexDirection: 'row' }}
            >
              {mockApiNodes.map((apiNode, index) => {
                const isSelected = apiNode.id === selectedApiNodeId;
                const isReachable = apiNode.outcome === 'reachable';
                const latencyTone = isReachable
                  ? resolveLatencyTone(apiNode.mockLatencyMs)
                  : '$appDanger';
                const SelectionIcon = isSelected ? CircleDot : Circle;

                return (
                  <SlidingSelection.Item
                    key={apiNode.id}
                    value={apiNode.id}
                    width="100%"
                    minW={0}
                    $lg={{ flexBasis: 0, grow: 1 }}
                  >
                    <RadioGroup.Item
                      asChild
                      unstyled
                      id={`api-node-${apiNode.id}`}
                      value={apiNode.id}
                    >
                      <NotchedButton
                        isSelected={isSelected}
                        testID={`api-node-option-${apiNode.id}`}
                        width="100%"
                        minW={0}
                        overflow="hidden"
                        p="$3"
                        flexDirection="column"
                        items="stretch"
                        justify="flex-start"
                        gap="$2.5"
                        aria-label={t(`network.nodes.${apiNode.id}`)}
                        $md={{ p: '$3.5', gap: '$3.5' }}
                      >
                        <TerminalText
                          position="absolute"
                          t="$2"
                          r="$3"
                          size="$9"
                          lineHeight="$9"
                          fontWeight="900"
                          color={isSelected ? '$appAccent' : '$appBorderSolid'}
                          opacity={isSelected ? 0.16 : 0.7}
                          fontVariant={['tabular-nums']}
                          $md={{ size: '$10', lineHeight: '$10' }}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </TerminalText>

                        <XStack items="center" justify="space-between" gap="$3" z="$1">
                          <XStack items="center" gap="$2">
                            <SelectionIcon
                              size={17}
                              color={isSelected ? colors.appAccent.val : colors.appMuted.val}
                              strokeWidth={1.8}
                            />
                            <MonoText size="$1" color={isSelected ? '$appAccent' : '$appMuted'}>
                              {isSelected ? t('network.active') : t('network.switch')}
                            </MonoText>
                          </XStack>
                          <Server
                            size={18}
                            color={isSelected ? colors.appAccent.val : colors.appMuted.val}
                            strokeWidth={1.6}
                          />
                        </XStack>

                        <XStack items="flex-end" justify="space-between" gap="$3" z="$1">
                          <YStack grow={1} minW={0} gap="$0.5">
                            <TerminalText size="$5" fontWeight="800" numberOfLines={1} $md={{ size: '$6' }}>
                              {t(`network.nodes.${apiNode.id}`)}
                            </TerminalText>
                            <MonoText size="$2" numberOfLines={1} selectable>
                              {apiNode.description}
                            </MonoText>
                          </YStack>
                          <XStack shrink={0} items="baseline" gap="$1">
                            {isChecking ? <Spinner size="small" color="$appWarning" /> : null}
                            <TerminalText
                              size="$6"
                              lineHeight="$6"
                              fontWeight="900"
                              color={isChecking ? '$appMuted' : latencyTone}
                              fontVariant={['tabular-nums']}
                              $md={{ size: '$7', lineHeight: '$7' }}
                            >
                              {isChecking ? '--' : isReachable ? apiNode.mockLatencyMs : '--'}
                            </TerminalText>
                            <MonoText size="$1" color={isChecking ? '$appMuted' : latencyTone}>
                              {t('network.latencyUnit')}
                            </MonoText>
                          </XStack>
                        </XStack>

                        <RadioGroup.Indicator position="absolute" opacity={0} />
                      </NotchedButton>
                    </RadioGroup.Item>
                  </SlidingSelection.Item>
                );
              })}
            </SlidingSelection>
          </RadioGroup>
        </YStack>

        <TerminalNotice>{t('network.mockNotice')}</TerminalNotice>
      </YStack>
    </SettingsPage>
  );
}
