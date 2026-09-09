import {
  Bot,
  Building2,
  Check,
  ShieldAlert,
  Swords,
  Ticket,
  X,
  Zap,
} from 'lucide-react-native';
import type { ComponentRef } from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';
import * as v from 'valibot';
import {
  Adapt,
  Button,
  Dialog,
  Form,
  Sheet,
  Spinner,
  Unspaced,
  XStack,
  YStack,
  getTokens,
  useMedia,
} from 'tamagui';

import {
  DecorativeBarcode,
  MonoText,
  TerminalNotice,
  TerminalSectionHeading,
  TerminalText,
} from '@/components';
import { useBackDismissal } from '@/hooks/use-back-dismissal';
import { arkHostGameConfigPatchSchema } from '@/schemas/arkhost';
import type {
  ArkHostAccelerateSlot,
  ArkHostBattleTask,
  ArkHostBuilding,
  ArkHostGameConfig,
  ArkHostGameConfigPatch,
} from '@/schemas/arkhost';
import {
  ACCELERATE_SLOT_OPTIONS,
  AutomationSwitchControl,
  BaseAccelerationCard,
  BaseInteractiveSelector,
  BattleConfigurationCard,
  BattleQueueEditor,
  ConfigSummaryCard,
  ResourceReserveCard,
  ResourceReserveEditor,
  type BaseMatrixLabels,
  getRoomType,
  isAccelerateSlotSelectable,
} from '../game-settings/components';
import { useStageTable } from '../resources';

export { ACCELERATE_SLOT_OPTIONS };

export type ActiveConfigEditor =
  | 'keeping_ap'
  | 'recruit_reserve'
  | 'accelerate_slot'
  | 'battle_tasks'
  | null;

export type GameHostingConfigViewProps = {
  rooms?: ArkHostBuilding['rooms'] | undefined;
  config: ArkHostGameConfig;
  isSubmitting: boolean;
  onSubmit: (patch: ArkHostGameConfigPatch) => Promise<void>;
  submitError: string | null;
};

type EditableAutomationField =
  | 'enable_building_arrange'
  | 'is_auto_battle'
  | 'recruit_ignore_robot';

const SHEET_MAX_HEIGHT_RATIO = 0.9;
const SHEET_HANDLE_HEIGHT = 18;

function replaceLoopBattleTasks(
  tasks: readonly ArkHostBattleTask[],
  loopStageIds: readonly string[],
): ArkHostBattleTask[] {
  const merged: ArkHostBattleTask[] = [];
  let loopIndex = 0;

  for (const task of tasks) {
    if (task.mode !== 'LOOP') {
      merged.push(task);
      continue;
    }

    const stageId = loopStageIds[loopIndex];
    loopIndex += 1;
    if (stageId !== undefined) {
      merged.push({ mode: 'LOOP', stage_id: stageId });
    }
  }

  for (; loopIndex < loopStageIds.length; loopIndex += 1) {
    const stageId = loopStageIds[loopIndex];
    if (stageId !== undefined) {
      merged.push({ mode: 'LOOP', stage_id: stageId });
    }
  }

  return merged;
}

export function GameHostingConfigView({
  config,
  rooms,
  isSubmitting,
  onSubmit,
  submitError,
}: GameHostingConfigViewProps) {
  const { t } = useTranslation('dashboard');
  const stageTable = useStageTable();
  const colors = getTokens().color;
  const { large } = useMedia();
  const { height: viewportHeight } = useWindowDimensions();
  const sheetFrameMaxHeight = Math.max(
    0,
    Math.floor(viewportHeight * SHEET_MAX_HEIGHT_RATIO) - SHEET_HANDLE_HEIGHT,
  );

  const [activeEditor, setActiveEditor] = useState<ActiveConfigEditor>(null);
  const [draftNumeric, setDraftNumeric] = useState(0);
  const [pendingAutomationField, setPendingAutomationField] =
    useState<EditableAutomationField | null>(null);
  const [draftSlot, setDraftSlot] = useState<ArkHostAccelerateSlot>(
    config.accelerate_slot,
  );
  const [draftQueue, setDraftQueue] = useState<string[]>([]);
  const [stageKeyword, setStageKeyword] = useState('');
  const [sheetContentHeight, setSheetContentHeight] = useState<number | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const sheetScrollViewRef = useRef<ComponentRef<typeof Sheet.ScrollView>>(null);

  const isDialogOpen = activeEditor !== null;

  useBackDismissal(isDialogOpen, () => {
    setActiveEditor(null);
  });

  const openNumericEditor = (field: 'keeping_ap' | 'recruit_reserve') => {
    setLocalError(null);
    setSheetContentHeight(null);
    setDraftNumeric(config[field]);
    setActiveEditor(field);
  };

  const openDroneEditor = () => {
    setLocalError(null);
    setSheetContentHeight(null);
    setDraftSlot(config.accelerate_slot);
    setActiveEditor('accelerate_slot');
  };

  const openBattleQueueEditor = () => {
    setLocalError(null);
    setSheetContentHeight(null);
    setDraftQueue(
      config.battle_tasks
        .filter((task) => task.mode === 'LOOP')
        .map((task) => task.stage_id),
    );
    setStageKeyword('');
    setActiveEditor('battle_tasks');
  };

  const closeEditor = () => {
    setActiveEditor(null);
    setSheetContentHeight(null);
    setLocalError(null);
  };

  const handleStageKeywordChange = (keyword: string) => {
    if (stageKeyword.trim() && !keyword.trim()) {
      sheetScrollViewRef.current?.scrollTo({ animated: false, y: 0 });
    }
    setStageKeyword(keyword);
  };

  const handleSaveNumeric = () => {
    if (activeEditor !== 'keeping_ap' && activeEditor !== 'recruit_reserve') return;
    const parsed = v.safeParse(arkHostGameConfigPatchSchema, {
      [activeEditor]: draftNumeric,
    });
    if (!parsed.success) {
      setLocalError(t('hostingConfig.submitValidation'));
      return;
    }

    onSubmit(parsed.output)
      .then(() => closeEditor())
      .catch(() => undefined);
  };

  const handleAutomationChange = (
    field: EditableAutomationField,
    checked: boolean,
  ) => {
    if (isSubmitting || pendingAutomationField !== null) return;
    const parsed = v.safeParse(arkHostGameConfigPatchSchema, { [field]: checked });
    if (!parsed.success) return;

    setPendingAutomationField(field);
    onSubmit(parsed.output)
      .catch(() => undefined)
      .finally(() => setPendingAutomationField(null));
  };

  const handleSaveSlot = () => {
    if (!isAccelerateSlotSelectable(rooms, draftSlot)) return;
    const parsed = v.safeParse(arkHostGameConfigPatchSchema, { accelerate_slot: draftSlot });
    if (!parsed.success) return;

    onSubmit(parsed.output)
      .then(() => closeEditor())
      .catch(() => undefined);
  };

  const handleSaveQueue = () => {
    const parsed = v.safeParse(arkHostGameConfigPatchSchema, {
      battle_tasks: replaceLoopBattleTasks(config.battle_tasks, draftQueue),
    });
    if (!parsed.success) return;

    onSubmit(parsed.output)
      .then(() => closeEditor())
      .catch(() => undefined);
  };

  const baseMatrixLabels: BaseMatrixLabels = {
    roomTypes: {
      MANUFACTURE: t('hostingConfig.roomTypes.manufacture'),
      TRADING: t('hostingConfig.roomTypes.trading'),
      POWER: t('hostingConfig.roomTypes.power'),
    },
    roomStatuses: {
      POWER: t('hostingConfig.roomStatuses.power'),
      MANUFACTURE: t('hostingConfig.roomStatuses.manufacture'),
      TRADING: t('hostingConfig.roomStatuses.trading'),
    },
  };
  const selectedSlot = ACCELERATE_SLOT_OPTIONS.find(
    (option) => option.value === config.accelerate_slot,
  );
  const droneRoomTypeValue = selectedSlot
    ? baseMatrixLabels.roomTypes[getRoomType(rooms, selectedSlot.value)]
    : t('hostingConfig.status.notSet');
  const hasSlotChanges = draftSlot !== config.accelerate_slot;
  const loopBattleTasks = config.battle_tasks.filter(
    (task) => task.mode === 'LOOP',
  );
  const battleMapsBadge = `${loopBattleTasks.length} ${t('hostingConfig.units.stages')}`;
  const hasQueueChanges =
    draftQueue.length !== loopBattleTasks.length ||
    draftQueue.some((stageId, index) => stageId !== loopBattleTasks[index]?.stage_id);

  return (
    <YStack testID="game-hosting-config-view" gap="$4" pb="$4">
      <TerminalNotice tone="warning">{t('hostingConfig.warning')}</TerminalNotice>

      {submitError ? <TerminalNotice tone="danger">{submitError}</TerminalNotice> : null}

      {/* 01 资源保留 */}
      <YStack gap="$2.5">
        <TerminalSectionHeading
          code="01"
          title={t('hostingConfig.sections.reserves')}
          trailing={<DecorativeBarcode />}
        />
        <XStack flexDirection="column" gap="$3" $large={{ flexDirection: 'row' }}>
          <YStack grow={1} shrink={1} minW={200}>
            <ResourceReserveCard
              testID="hosting-config-card-keeping-ap"
              icon={Zap}
              title={t('hostingConfig.keepingAp')}
              value={config.keeping_ap}
              unit={t('hostingConfig.units.ap')}
              description={t('hostingConfig.summaries.keepingAp')}
              onPress={() => openNumericEditor('keeping_ap')}
            />
          </YStack>
          <YStack grow={1} shrink={1} minW={200}>
            <ResourceReserveCard
              testID="hosting-config-card-recruit-reserve"
              icon={Ticket}
              title={t('hostingConfig.recruitReserve')}
              value={config.recruit_reserve}
              unit={t('hostingConfig.units.permits')}
              description={t('hostingConfig.summaries.recruitReserve')}
              onPress={() => openNumericEditor('recruit_reserve')}
            />
          </YStack>
        </XStack>
      </YStack>

      {/* 02 智能自动化开关 */}
      <YStack gap="$2.5">
        <TerminalSectionHeading
          code="02"
          title={t('hostingConfig.sections.switches')}
        />
        <XStack flexWrap="wrap" gap="$2">
          <YStack width="100%" $large={{ width: '49%' }}>
            <ConfigSummaryCard
              testID="hosting-config-card-enable-building-arrange"
              icon={Building2}
              title={t('hostingConfig.enableBuildingArrange')}
              compact
              description={t('hostingConfig.summaries.enableBuildingArrange')}
              headerControl={(
                <AutomationSwitchControl
                  testID="hosting-config-enable-building-arrange"
                  label={t('hostingConfig.enableBuildingArrange')}
                  checked={config.enable_building_arrange}
                  disabled={isSubmitting || pendingAutomationField !== null}
                  pending={pendingAutomationField === 'enable_building_arrange'}
                  onCheckedChange={(checked) =>
                    handleAutomationChange('enable_building_arrange', checked)
                  }
                />
              )}
            />
          </YStack>

          <YStack width="100%" $large={{ width: '49%' }}>
            <ConfigSummaryCard
              testID="hosting-config-card-auto-battle"
              icon={Swords}
              title={t('hostingConfig.autoBattle')}
              compact
              description={t('hostingConfig.summaries.isAutoBattle')}
              headerControl={(
                <AutomationSwitchControl
                  testID="hosting-config-auto-battle"
                  label={t('hostingConfig.autoBattle')}
                  checked={config.is_auto_battle}
                  disabled={isSubmitting || pendingAutomationField !== null}
                  pending={pendingAutomationField === 'is_auto_battle'}
                  onCheckedChange={(checked) =>
                    handleAutomationChange('is_auto_battle', checked)
                  }
                />
              )}
            />
          </YStack>

          <YStack width="100%" $large={{ width: '49%' }}>
            <ConfigSummaryCard
              testID="hosting-config-card-ignore-robot"
              icon={Bot}
              title={t('hostingConfig.ignoreRobot')}
              compact
              description={t('hostingConfig.summaries.recruitIgnoreRobot')}
              headerControl={(
                <AutomationSwitchControl
                  testID="hosting-config-ignore-robot"
                  label={t('hostingConfig.ignoreRobot')}
                  checked={config.recruit_ignore_robot}
                  disabled={isSubmitting || pendingAutomationField !== null}
                  pending={pendingAutomationField === 'recruit_ignore_robot'}
                  onCheckedChange={(checked) =>
                    handleAutomationChange('recruit_ignore_robot', checked)
                  }
                />
              )}
            />
          </YStack>

          <YStack width="100%" $large={{ width: '49%' }}>
            <ConfigSummaryCard
              testID="hosting-config-card-allow-login-assist"
              icon={ShieldAlert}
              title={t('hostingConfig.allowLoginAssist')}
              compact
              description={t('hostingConfig.summaries.allowLoginAssist')}
              disabled
              headerControl={(
                <AutomationSwitchControl
                  testID="hosting-config-allow-login-assist"
                  label={t('hostingConfig.allowLoginAssist')}
                  checked={config.allow_login_assist}
                  disabled
                  statusLabel={t('hostingConfig.status.maintenance')}
                />
              )}
            />
          </YStack>
        </XStack>
      </YStack>

      {/* 03 无人机加速 */}
      <YStack gap="$2.5">
        <TerminalSectionHeading
          code="03"
          title={t('hostingConfig.sections.drone')}
        />
        <BaseAccelerationCard
          rooms={rooms}
          testID="hosting-config-card-drone-acceleration"
          ariaLabel={`${t('hostingConfig.sections.drone')}: ${droneRoomTypeValue}`}
          selectedLabel={droneRoomTypeValue}
          selectedSlot={config.accelerate_slot}
          description={t('hostingConfig.summaries.droneAcceleration', {
            roomType: droneRoomTypeValue,
          })}
          actionLabel={t('hostingConfig.dialog.edit')}
          onPress={openDroneEditor}
        />
      </YStack>

      {/* 04 作战配置 */}
      <YStack gap="$2.5">
        <TerminalSectionHeading
          code="04"
          title={t('hostingConfig.sections.combat')}
        />
        <BattleConfigurationCard
          testID="hosting-config-card-battle-maps"
          ariaLabel={`${t('hostingConfig.battleQueue')}: ${battleMapsBadge}`}
          title={t('hostingConfig.battleQueue')}
          countLabel={battleMapsBadge}
          defaultLabel={t('hostingConfig.status.default')}
          description={t('hostingConfig.summaries.battleMaps')}
          emptyLabel={t('hostingConfig.card.defaultStage')}
          firstLabel={t('hostingConfig.card.firstPriority')}
          moreLabel={t('hostingConfig.card.moreStages', {
            count: Math.max(0, loopBattleTasks.length - 3),
          })}
          actionLabel={t('hostingConfig.dialog.edit')}
          queue={loopBattleTasks.map((task) => task.stage_id)}
          stageTable={stageTable}
          onPress={openBattleQueueEditor}
        />
      </YStack>

      {/* Adapt Dialog / Sheet */}
      <Dialog
        modal
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeEditor();
        }}
      >
        <Adapt when={!large} platform="touch">
          <Sheet
            zIndex={200000}
            modal
            dismissOnSnapToBottom
            dismissOnOverlayPress
            moveOnKeyboardChange
            snapPointsMode="fit"
          >
            <Sheet.Overlay bg="$appScrim" />
            <Sheet.Handle bg="$appBorder" />
            <Sheet.Frame
              maxH={sheetFrameMaxHeight}
              bg="$appSurfaceStrong"
              borderTopWidth={1}
              borderColor="$appAccentBorder"
              borderTopLeftRadius="$4"
              borderTopRightRadius="$4"
            >
              <Sheet.ScrollView
                ref={sheetScrollViewRef}
                maxH={
                  sheetContentHeight === null
                    ? sheetFrameMaxHeight
                    : Math.min(sheetContentHeight, sheetFrameMaxHeight)
                }
                keyboardDismissMode={
                  process.env.EXPO_OS === 'ios' ? 'interactive' : 'on-drag'
                }
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                onContentSizeChange={(_, height) => {
                  const nextHeight = Math.ceil(height);
                  setSheetContentHeight((currentHeight) =>
                    currentHeight === nextHeight ? currentHeight : nextHeight,
                  );
                }}
              >
                <YStack p="$4" pb="$8">
                  <Adapt.Contents />
                </YStack>
              </Sheet.ScrollView>
            </Sheet.Frame>
          </Sheet>
        </Adapt>

        <Dialog.Portal>
          <Dialog.Overlay
            key="overlay"
            opacity={0.8}
            bg="$appScrim"
          />

          <Dialog.Content
            bordered
            elevate
            key="content"
            width="92%"
            maxW={activeEditor === 'accelerate_slot' ? 1120 : 520}
            p="$4.5"
            gap="$4"
            bg={activeEditor === 'accelerate_slot' ? '$appBackground' : '$appSurfaceStrong'}
            borderWidth={1}
            borderColor="$appAccentBorder"
            rounded="$0"
          >
            {/* Numeric Editor */}
            {(activeEditor === 'keeping_ap' || activeEditor === 'recruit_reserve') && (
              <ResourceReserveEditor
                cancelLabel={t('hostingConfig.dialog.cancel')}
                decreaseLabel={t('hostingConfig.dialog.decrease')}
                description={
                  activeEditor === 'keeping_ap'
                    ? t('hostingConfig.descriptions.keepingAp')
                    : t('hostingConfig.descriptions.recruitReserve')
                }
                error={localError}
                increaseLabel={t('hostingConfig.dialog.increase')}
                initialValue={config[activeEditor]}
                isSubmitting={isSubmitting}
                onCancel={closeEditor}
                onDecrease={() => {
                  setLocalError(null);
                  setDraftNumeric((current) => Math.max(0, current - 1));
                }}
                onIncrease={() => {
                  setLocalError(null);
                  setDraftNumeric((current) => current + 1);
                }}
                onSubmit={handleSaveNumeric}
                saveLabel={t('hostingConfig.dialog.save')}
                testID={
                  activeEditor === 'keeping_ap'
                    ? 'hosting-config-keeping-ap'
                    : 'hosting-config-recruit-reserve'
                }
                title={
                  activeEditor === 'keeping_ap'
                    ? t('hostingConfig.keepingAp')
                    : t('hostingConfig.recruitReserve')
                }
                unit={
                  activeEditor === 'keeping_ap'
                    ? t('hostingConfig.units.ap')
                    : t('hostingConfig.units.permits')
                }
                value={draftNumeric}
              />
            )}

            {/* Drone Slot Editor */}
            {activeEditor === 'accelerate_slot' && (
              <Form onSubmit={handleSaveSlot} gap="$4">
                <YStack gap="$2">
                  <MonoText size="$1" color="$appMuted" letterSpacing={3}>
                    {t('hostingConfig.dialog.baseTerminal')}
                  </MonoText>
                  <Dialog.Title asChild>
                    <TerminalText
                      size={large ? '$9' : '$5.5'}
                      fontWeight="800"
                      numberOfLines={2}
                    >
                      {t('hostingConfig.dialog.targetRoom')}
                    </TerminalText>
                  </Dialog.Title>
                  <Dialog.Description asChild>
                    <MonoText size={large ? '$2' : '$2.5'} color="$appMuted">
                      {t('hostingConfig.descriptions.droneAcceleration')}
                    </MonoText>
                  </Dialog.Description>
                </YStack>

                <BaseInteractiveSelector
                  rooms={rooms}
                  ariaLabel={t('hostingConfig.dialog.targetRoom')}
                  disabled={isSubmitting}
                  draftSlot={draftSlot}
                  labels={baseMatrixLabels}
                  onSelectSlot={setDraftSlot}
                />

                <XStack items="center" justify="flex-end" gap="$2">
                  <Button
                    testID="hosting-config-dialog-cancel"
                    unstyled
                    minH="$4"
                    items="center"
                    justify="center"
                    px="$3"
                    py="$2"
                    hoverStyle={{ bg: '$appSurfaceRaised' }}
                    pressStyle={{ opacity: 0.7 }}
                    onPress={closeEditor}
                    disabled={isSubmitting}
                  >
                    <MonoText size={large ? '$2' : '$2.5'}>
                      {t('hostingConfig.dialog.cancel')}
                    </MonoText>
                  </Button>
                  <Form.Trigger asChild>
                    <Button
                      testID="hosting-config-submit"
                      unstyled
                      minH="$4"
                      items="center"
                      justify="center"
                      px="$4"
                      py="$2"
                      borderWidth={1}
                      borderColor="$appAccent"
                      bg="$appAccent"
                      opacity={!hasSlotChanges || isSubmitting ? 0.4 : 1}
                      hoverStyle={{ opacity: 0.85 }}
                      pressStyle={{ opacity: 0.7 }}
                      disabled={!hasSlotChanges || isSubmitting}
                    >
                      <XStack items="center" justify="center" gap="$2">
                        {isSubmitting ? <Spinner size="small" color="$appBackground" /> : <Check size={14} color={colors.appBackground.val} />}
                        <MonoText
                          size={large ? '$2' : '$2.5'}
                          color="$appBackground"
                          fontWeight="700"
                        >
                          {t('hostingConfig.dialog.save')}
                        </MonoText>
                      </XStack>
                    </Button>
                  </Form.Trigger>
                </XStack>
              </Form>
            )}

            {/* Battle Queue Editor */}
            {activeEditor === 'battle_tasks' && (
              <BattleQueueEditor
                hasChanges={hasQueueChanges}
                isSubmitting={isSubmitting}
                keyword={stageKeyword}
                labels={{
                  addStage: t('hostingConfig.dialog.addStage'),
                  added: t('hostingConfig.dialog.added'),
                  cancel: t('hostingConfig.dialog.cancel'),
                  clearSearch: t('hostingConfig.dialog.clearSearch'),
                  count: `${draftQueue.length} ${t('hostingConfig.units.stages')}`,
                  currentQueue: t('hostingConfig.dialog.currentQueue'),
                  description: t('hostingConfig.descriptions.battleMaps'),
                  empty: t('hostingConfig.dialog.queueEmpty'),
                  noSearchResults: t('hostingConfig.dialog.noSearchResults'),
                  removeStage: t('hostingConfig.dialog.removeStage'),
                  save: t('hostingConfig.dialog.save'),
                  searchResults: t('hostingConfig.dialog.searchResults'),
                  searchStages: t('hostingConfig.dialog.searchStages'),
                  stageCost: (cost) => t('hostingConfig.dialog.stageCost', { cost }),
                  title: t('hostingConfig.battleQueue'),
                }}
                queue={draftQueue}
                stageTable={stageTable}
                onAdd={(stageId) => {
                  setDraftQueue((current) =>
                    current.includes(stageId) ? current : [...current, stageId],
                  );
                }}
                onCancel={closeEditor}
                onKeywordChange={handleStageKeywordChange}
                onRemove={(index) => {
                  setDraftQueue((current) => current.filter((_, itemIndex) => itemIndex !== index));
                }}
                onSubmit={handleSaveQueue}
              />
            )}

            <Unspaced>
              <Dialog.Close asChild>
                <Button
                  testID="hosting-config-dialog-close"
                  position="absolute"
                  t="$3"
                  r="$3"
                  unstyled
                  p="$1"
                  onPress={closeEditor}
                >
                  <X size={16} color={colors.appMuted.val} />
                </Button>
              </Dialog.Close>
            </Unspaced>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </YStack>
  );
}
