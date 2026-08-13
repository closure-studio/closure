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
import { useLayoutSize } from '@/providers/layout-size-provider';
import { apiNodeIdSchema } from '@/schemas/api-node';
import type { ApiNode, ApiNodeId } from '@/schemas/api-node';
import type { ApiNodeFailure } from '../api';
import { SettingsPage } from '../../components/settings-page';
const LOW_LATENCY_MAX_MS = 80;
const ELEVATED_LATENCY_MAX_MS = 150;

type LatencyTone = '$appSuccess' | '$appWarning' | '$appDanger';
type DetectionStatus = 'checking' | 'reachable' | 'unreachable';
type OperationStatus = 'failed' | 'idle' | 'pending' | 'succeeded';

export type NetworkSettingsScreenProps = {
  nodes: readonly ApiNode[];
  onRefresh: () => Promise<void>;
  onSelectApiNode: (apiNodeId: ApiNodeId) => void;
  queryError: ApiNodeFailure | null;
  queryStatus: OperationStatus;
  selectedApiNodeId: ApiNodeId;
};

function resolveLatencyTone(latencyMs: number): LatencyTone {
  if (latencyMs <= LOW_LATENCY_MAX_MS) return '$appSuccess';
  if (latencyMs <= ELEVATED_LATENCY_MAX_MS) return '$appWarning';
  return '$appDanger';
}

export function NetworkSettingsScreen({
  nodes,
  onRefresh,
  onSelectApiNode,
  queryError,
  queryStatus,
  selectedApiNodeId,
}: NetworkSettingsScreenProps) {
  const { t } = useTranslation('settings');
  const colors = getTokens().color;
  const layoutSize = useLayoutSize();
  const reducedMotion = useReducedMotion();
  const selectedApiNode: ApiNode | undefined = nodes.find(
    (apiNode) => apiNode.id === selectedApiNodeId,
  ) ?? nodes[0];

  const handleNodeChange = (candidateNodeId: string) => {
    const result = v.safeParse(apiNodeIdSchema, candidateNodeId);
    if (!result.success || result.output === selectedApiNodeId) return;

    onSelectApiNode(result.output);
  };

  const handleRetest = () => {
    onRefresh().catch(() => undefined);
  };

  const isChecking = queryStatus === 'pending';
  const detectionStatus: DetectionStatus = isChecking
    ? 'checking'
    : selectedApiNode?.outcome ?? 'unreachable';
  const detectionComplete = detectionStatus !== 'checking';
  const detectionPresentation = {
    buttonBackground: detectionComplete ? '$appAccentSoft' : '$appWarningSoft',
    buttonBorderColor: detectionComplete ? '$appAccentBorder' : '$appWarningBorder',
    buttonDisabled: !detectionComplete,
    buttonIcon: detectionComplete
      ? <RefreshCw size={15} color={colors.appAccent.val} strokeWidth={1.8} />
      : <Spinner size="small" color="$appWarning" />,
    buttonLabel: t(detectionComplete ? 'network.retest' : 'network.checking'),
    buttonTone: detectionComplete ? '$appAccent' : '$appWarning',
    latencyAnimationKey: detectionComplete
      ? `latency-${selectedApiNode?.id ?? 'none'}`
      : 'checking',
    panelIndicatorOpacity: detectionComplete ? 0.55 : 1,
    panelIndicatorTone: detectionComplete ? '$appAccent' : '$appWarning',
    panelRingScale: detectionComplete ? 1 : 1.08,
    progressTone: detectionComplete ? '$appAccent' : '$appWarning',
    progressWidth: detectionComplete ? '34%' : '100%',
    ...({
      checking: {
        latencyTone: '$appMuted',
        latencyValue: '--',
        statusIcon: <Spinner size="small" color="$appWarning" />,
        statusLabel: t('network.checking'),
        statusTone: '$appWarning',
      },
      reachable: {
        latencyTone: resolveLatencyTone(selectedApiNode?.latencyMs ?? 0),
        latencyValue: selectedApiNode?.latencyMs ?? '--',
        statusIcon: <Signal size={15} color={colors.appSuccess.val} strokeWidth={1.8} />,
        statusLabel: t('network.connected'),
        statusTone: '$appSuccess',
      },
      unreachable: {
        latencyTone: '$appDanger',
        latencyValue: '--',
        statusIcon: <SignalZero size={15} color={colors.appDanger.val} strokeWidth={1.8} />,
        statusLabel: t('network.unreachable'),
        statusTone: '$appDanger',
      },
    } as const)[detectionStatus],
  } as const;

  if (!selectedApiNode) {
    return (
      <SettingsPage>
        <YStack gap="$3" $md={{ gap: '$5' }}>
          <TerminalNotice tone="danger">
            {queryError ? t('network.queryError') : t('network.checking')}
          </TerminalNotice>
          <Button
            borderWidth={1}
            borderColor="$appAccentBorder"
            bg="$appAccentSoft"
            disabled={isChecking}
            onPress={handleRetest}
          >
            {isChecking ? <Spinner size="small" color="$appWarning" /> : null}
            <MonoText size="$2.5" color="$appAccent">
              {t(isChecking ? 'network.checking' : 'network.retest')}
            </MonoText>
          </Button>
        </YStack>
      </SettingsPage>
    );
  }

  return (
    <SettingsPage>
      {layoutSize === 'large' ? (
        <SectionPageHeader
          code={t('network.code')}
          description={t('network.description')}
          eyebrow={t('network.eyebrow')}
          status={t('network.status')}
          title={t('network.title')}
        />
      ) : null}

      <YStack gap="$3" $md={{ gap: '$5' }}>
        {layoutSize === 'large' ? (
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
            bg={detectionPresentation.panelIndicatorTone}
            transition={reducedMotion ? '0ms' : '500ms'}
            opacity={detectionPresentation.panelIndicatorOpacity}
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
            scale={detectionPresentation.panelRingScale}
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
                {detectionPresentation.statusIcon}
                <MonoText size="$2" color={detectionPresentation.statusTone}>
                  {detectionPresentation.statusLabel}
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
                  key={detectionPresentation.latencyAnimationKey}
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
                    color={detectionPresentation.latencyTone}
                    fontVariant={['tabular-nums']}
                  >
                    {detectionPresentation.latencyValue}
                  </TerminalText>
                  <MonoText size="$3" color={detectionPresentation.latencyTone}>
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
                width={detectionPresentation.progressWidth}
                bg={detectionPresentation.progressTone}
                opacity={0.8}
                transition={reducedMotion ? '0ms' : 'slow'}
              />
            </YStack>
            <Clock3 size={13} color={colors.appMuted.val} strokeWidth={1.5} />
            <MonoText size="$1">{t('network.persistenceLabel')}</MonoText>
          </XStack>
          </TerminalPanel>
        ) : null}

        <YStack gap="$3">
          {layoutSize === 'large' ? (
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
                borderColor={detectionPresentation.buttonBorderColor}
                bg={detectionPresentation.buttonBackground}
                hoverStyle={{ borderColor: '$appAccent', bg: '$appAccentSoft' }}
                pressStyle={{ opacity: 0.72, scale: 0.98 }}
                focusVisibleStyle={{ borderColor: '$appText' }}
                disabled={detectionPresentation.buttonDisabled}
                disabledStyle={{ opacity: 0.58 }}
                onPress={handleRetest}
                aria-label={t('network.retestLabel')}
                aria-busy={detectionPresentation.buttonDisabled}
                $platform-web={{
                  clipPath: 'polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px))',
                }}
              >
                {detectionPresentation.buttonIcon}
                <MonoText size="$2.5" color={detectionPresentation.buttonTone}>
                  {detectionPresentation.buttonLabel}
                </MonoText>
              </Button>
            </XStack>
          ) : null}

          {layoutSize === 'small' ? (
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
              {nodes.map((apiNode, index) => {
                const isSelected = apiNode.id === selectedApiNodeId;
                const isReachable = apiNode.outcome === 'reachable';
                const latencyTone = isReachable
                  ? resolveLatencyTone(apiNode.latencyMs)
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
                            {detectionComplete ? null : <Spinner size="small" color="$appWarning" />}
                            <TerminalText
                              size="$6"
                              lineHeight="$6"
                              fontWeight="900"
                              color={detectionComplete ? latencyTone : '$appMuted'}
                              fontVariant={['tabular-nums']}
                              $md={{ size: '$7', lineHeight: '$7' }}
                            >
                              {detectionComplete && isReachable ? apiNode.latencyMs : '--'}
                            </TerminalText>
                            <MonoText size="$1" color={detectionComplete ? latencyTone : '$appMuted'}>
                              {t('network.latencyUnit')}
                            </MonoText>
                          </XStack>
                        </XStack>

                        <RadioGroup.Indicator unstyled position="absolute" opacity={0} />
                      </NotchedButton>
                    </RadioGroup.Item>
                  </SlidingSelection.Item>
                );
              })}
            </SlidingSelection>
          </RadioGroup>
          {queryError ? (
            <TerminalNotice tone="danger">
              {t('network.queryError')}
            </TerminalNotice>
          ) : null}
        </YStack>

        <TerminalNotice>{t('network.mockNotice')}</TerminalNotice>
      </YStack>
    </SettingsPage>
  );
}
