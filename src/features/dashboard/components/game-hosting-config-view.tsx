import {
  Bot,
  Building2,
  Check,
  Cpu,
  Flame,
  Plus,
  Search,
  ShieldAlert,
  Swords,
  Ticket,
  Trash2,
  X,
  Zap,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as v from 'valibot';
import {
  Adapt,
  Button,
  Dialog,
  Form,
  Input,
  ScrollView,
  Sheet,
  Spinner,
  Switch,
  Unspaced,
  XStack,
  YStack,
  getTokens,
} from 'tamagui';

import {
  DecorativeBarcode,
  Frame,
  MonoText,
  TerminalNotice,
  TerminalSectionHeading,
  TerminalText,
} from '@/components';
import { useBackDismissal } from '@/hooks/use-back-dismissal';
import { arkHostGameConfigPatchSchema } from '@/schemas/arkhost';
import type {
  ArkHostGameConfig,
  ArkHostGameConfigPatch,
} from '@/schemas/arkhost';
import type { StageTableEntry } from '@/schemas/game-data';
import {
  ACCELERATE_SLOT_OPTIONS,
  BaseInteractiveSelector,
  BaseMiniGrid,
  BattleStageChips,
  ConfigSummaryCard,
  formatStageLabel,
  type SlotKey,
} from '../game-settings/components';
import { useStageTable } from '../resources';

export { ACCELERATE_SLOT_OPTIONS };

export type ActiveConfigEditor =
  | 'keeping_ap'
  | 'recruit_reserve'
  | 'enable_building_arrange'
  | 'is_auto_battle'
  | 'recruit_ignore_robot'
  | 'accelerate_slot'
  | 'battle_maps'
  | null;

export type GameHostingConfigViewProps = {
  account: string;
  config: ArkHostGameConfig;
  isSubmitting: boolean;
  onSubmit: (patch: ArkHostGameConfigPatch) => Promise<void>;
  showSuccess: boolean;
  submitError: string | null;
};

const ACCELERATE_SLOT_I18N_KEYS: Record<
  SlotKey,
  | 'hostingConfig.accelerateSlots.bottomCenter'
  | 'hostingConfig.accelerateSlots.bottomLeft'
  | 'hostingConfig.accelerateSlots.bottomRight'
  | 'hostingConfig.accelerateSlots.middleCenter'
  | 'hostingConfig.accelerateSlots.middleLeft'
  | 'hostingConfig.accelerateSlots.middleRight'
  | 'hostingConfig.accelerateSlots.topCenter'
  | 'hostingConfig.accelerateSlots.topLeft'
  | 'hostingConfig.accelerateSlots.topRight'
> = {
  bottomCenter: 'hostingConfig.accelerateSlots.bottomCenter',
  bottomLeft: 'hostingConfig.accelerateSlots.bottomLeft',
  bottomRight: 'hostingConfig.accelerateSlots.bottomRight',
  middleCenter: 'hostingConfig.accelerateSlots.middleCenter',
  middleLeft: 'hostingConfig.accelerateSlots.middleLeft',
  middleRight: 'hostingConfig.accelerateSlots.middleRight',
  topCenter: 'hostingConfig.accelerateSlots.topCenter',
  topLeft: 'hostingConfig.accelerateSlots.topLeft',
  topRight: 'hostingConfig.accelerateSlots.topRight',
};

const STEPPER_DELTAS = [-10, -1, 1, 10] as const;

export function GameHostingConfigView({
  account,
  config,
  isSubmitting,
  onSubmit,
  showSuccess,
  submitError,
}: GameHostingConfigViewProps) {
  const { t } = useTranslation('dashboard');
  const stageTable = useStageTable();
  const colors = getTokens().color;

  const [activeEditor, setActiveEditor] = useState<ActiveConfigEditor>(null);
  const [draftNumeric, setDraftNumeric] = useState('');
  const [draftSwitch, setDraftSwitch] = useState(false);
  const [draftSlot, setDraftSlot] = useState('');
  const [draftQueue, setDraftQueue] = useState<string[]>([]);
  const [stageKeyword, setStageKeyword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const isDialogOpen = activeEditor !== null;

  useBackDismissal(isDialogOpen, () => {
    setActiveEditor(null);
  });

  const openNumericEditor = (field: 'keeping_ap' | 'recruit_reserve') => {
    setLocalError(null);
    setDraftNumeric(String(config[field]));
    setActiveEditor(field);
  };

  const openSwitchEditor = (
    field: 'enable_building_arrange' | 'is_auto_battle' | 'recruit_ignore_robot',
  ) => {
    setLocalError(null);
    setDraftSwitch(Boolean(config[field]));
    setActiveEditor(field);
  };

  const openDroneEditor = () => {
    setLocalError(null);
    setDraftSlot(config.accelerate_slot_cn || '中层左');
    setActiveEditor('accelerate_slot');
  };

  const openBattleQueueEditor = () => {
    setLocalError(null);
    setDraftQueue([...config.battle_maps]);
    setStageKeyword('');
    setActiveEditor('battle_maps');
  };

  const closeEditor = () => {
    setActiveEditor(null);
    setLocalError(null);
  };

  const handleSaveNumeric = () => {
    if (!activeEditor) return;
    const value = draftNumeric.trim() === '' ? Number.NaN : Number(draftNumeric);
    const parsed = v.safeParse(arkHostGameConfigPatchSchema, { [activeEditor]: value });
    if (!parsed.success || Number.isNaN(value) || value < 0) {
      setLocalError(t('hostingConfig.submitValidation'));
      return;
    }

    onSubmit(parsed.output)
      .then(() => closeEditor())
      .catch(() => undefined);
  };

  const handleSaveSwitch = () => {
    if (!activeEditor) return;
    const parsed = v.safeParse(arkHostGameConfigPatchSchema, { [activeEditor]: draftSwitch });
    if (!parsed.success) return;

    onSubmit(parsed.output)
      .then(() => closeEditor())
      .catch(() => undefined);
  };

  const handleSaveSlot = () => {
    const parsed = v.safeParse(arkHostGameConfigPatchSchema, { accelerate_slot_cn: draftSlot });
    if (!parsed.success) return;

    onSubmit(parsed.output)
      .then(() => closeEditor())
      .catch(() => undefined);
  };

  const handleSaveQueue = () => {
    const parsed = v.safeParse(arkHostGameConfigPatchSchema, { battle_maps: draftQueue });
    if (!parsed.success) return;

    onSubmit(parsed.output)
      .then(() => closeEditor())
      .catch(() => undefined);
  };

  const filteredStages = useMemo(() => {
    if (!stageKeyword.trim()) return [];
    const query = stageKeyword.trim().toUpperCase();
    const results: { id: string; entry: StageTableEntry }[] = [];

    for (const [id, entry] of Object.entries(stageTable)) {
      if (
        id.toUpperCase().includes(query) ||
        entry.code.toUpperCase().includes(query) ||
        entry.name.toUpperCase().includes(query)
      ) {
        results.push({ entry, id });
        if (results.length >= 10) break;
      }
    }
    return results;
  }, [stageKeyword, stageTable]);

  const sanityCode = `// ${t('hostingConfig.codes.sanity')}`;
  const permitsCode = `// ${t('hostingConfig.codes.permits')}`;
  const switchesCode = `// ${t('hostingConfig.codes.switches')}`;
  const droneCode = `// ${t('hostingConfig.codes.drone')}`;
  const combatCode = `// ${t('hostingConfig.codes.combat')}`;
  const zeroStepLabel = '0';
  const draftQueueCountLabel = `${draftQueue.length} ${t('hostingConfig.units.stages')}`;

  const keepingApValue = `${config.keeping_ap} ${t('hostingConfig.units.ap')}`;
  const recruitReserveValue = `${config.recruit_reserve} ${t('hostingConfig.units.permits')}`;
  const droneSlotValue = config.accelerate_slot_cn || t('hostingConfig.status.notSet');
  const battleMapsBadge = `${config.battle_maps.length} ${t('hostingConfig.units.stages')}`;

  return (
    <YStack testID="game-hosting-config-view" gap="$4" pb="$4">
      {/* Header Banner */}
      <XStack items="baseline" justify="space-between" gap="$3" minW={0} flexWrap="wrap">
        <YStack gap="$1" minW={0}>
          <MonoText size="$1" color="$appAccent">{t('hostingConfig.code')}</MonoText>
          <TerminalText size="$6" fontWeight="800" numberOfLines={1}>
            {t('hostingConfig.title')}
          </TerminalText>
        </YStack>
        <YStack items="flex-end" minW={0}>
          <MonoText size="$1">{t('hostingConfig.account')}</MonoText>
          <TerminalText size="$2.5" fontWeight="700" selectable numberOfLines={1}>
            {account}
          </TerminalText>
        </YStack>
      </XStack>

      <TerminalNotice tone="warning">{t('hostingConfig.warning')}</TerminalNotice>

      {submitError ? <TerminalNotice tone="danger">{submitError}</TerminalNotice> : null}
      {showSuccess ? <TerminalNotice tone="success">{t('hostingConfig.saved')}</TerminalNotice> : null}

      {/* 01 资源保留 */}
      <YStack gap="$2.5">
        <TerminalSectionHeading
          code="01"
          title={t('hostingConfig.sections.reserves')}
          trailing={<DecorativeBarcode />}
        />
        <XStack flexDirection="column" gap="$3" $sm={{ flexDirection: 'row' }}>
          <YStack grow={1} shrink={1} minW={200}>
            <ConfigSummaryCard
              testID="hosting-config-card-keeping-ap"
              icon={Zap}
              title={t('hostingConfig.keepingAp')}
              value={keepingApValue}
              description={t('hostingConfig.descriptions.keepingAp')}
              actionLabel={t('hostingConfig.dialog.edit')}
              onPress={() => openNumericEditor('keeping_ap')}
            />
          </YStack>
          <YStack grow={1} shrink={1} minW={200}>
            <ConfigSummaryCard
              testID="hosting-config-card-recruit-reserve"
              icon={Ticket}
              title={t('hostingConfig.recruitReserve')}
              value={recruitReserveValue}
              description={t('hostingConfig.descriptions.recruitReserve')}
              actionLabel={t('hostingConfig.dialog.edit')}
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
        <XStack flexWrap="wrap" gap="$3">
          <YStack width="100%" $sm={{ width: '48.5%' }}>
            <ConfigSummaryCard
              testID="hosting-config-card-enable-building-arrange"
              icon={Building2}
              title={t('hostingConfig.enableBuildingArrange')}
              badge={config.enable_building_arrange ? t('hostingConfig.status.enabled') : t('hostingConfig.status.disabled')}
              badgeTone={config.enable_building_arrange ? 'success' : 'default'}
              description={t('hostingConfig.descriptions.enableBuildingArrange')}
              actionLabel={t('hostingConfig.dialog.edit')}
              onPress={() => openSwitchEditor('enable_building_arrange')}
            />
          </YStack>

          <YStack width="100%" $sm={{ width: '48.5%' }}>
            <ConfigSummaryCard
              testID="hosting-config-card-auto-battle"
              icon={Swords}
              title={t('hostingConfig.autoBattle')}
              badge={config.is_auto_battle ? t('hostingConfig.status.enabled') : t('hostingConfig.status.disabled')}
              badgeTone={config.is_auto_battle ? 'success' : 'default'}
              description={t('hostingConfig.descriptions.isAutoBattle')}
              actionLabel={t('hostingConfig.dialog.edit')}
              onPress={() => openSwitchEditor('is_auto_battle')}
            />
          </YStack>

          <YStack width="100%" $sm={{ width: '48.5%' }}>
            <ConfigSummaryCard
              testID="hosting-config-card-ignore-robot"
              icon={Bot}
              title={t('hostingConfig.ignoreRobot')}
              badge={config.recruit_ignore_robot ? t('hostingConfig.status.enabled') : t('hostingConfig.status.disabled')}
              badgeTone={config.recruit_ignore_robot ? 'success' : 'default'}
              description={t('hostingConfig.descriptions.recruitIgnoreRobot')}
              actionLabel={t('hostingConfig.dialog.edit')}
              onPress={() => openSwitchEditor('recruit_ignore_robot')}
            />
          </YStack>

          <YStack width="100%" $sm={{ width: '48.5%' }}>
            <ConfigSummaryCard
              testID="hosting-config-card-allow-login-assist"
              icon={ShieldAlert}
              title={t('hostingConfig.allowLoginAssist')}
              badge={t('hostingConfig.status.maintenance')}
              badgeTone="warning"
              description={t('hostingConfig.descriptions.allowLoginAssist')}
              disabled
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
        <ConfigSummaryCard
          testID="hosting-config-card-drone-acceleration"
          icon={Cpu}
          title={t('hostingConfig.droneAcceleration')}
          value={droneSlotValue}
          description={t('hostingConfig.descriptions.droneAcceleration')}
          actionLabel={t('hostingConfig.dialog.edit')}
          onPress={openDroneEditor}
        >
          <BaseMiniGrid selectedSlot={config.accelerate_slot_cn} />
        </ConfigSummaryCard>
      </YStack>

      {/* 04 作战配置 */}
      <YStack gap="$2.5">
        <TerminalSectionHeading
          code="04"
          title={t('hostingConfig.sections.combat')}
        />
        <ConfigSummaryCard
          testID="hosting-config-card-battle-maps"
          icon={Flame}
          title={t('hostingConfig.battleQueue')}
          badge={battleMapsBadge}
          badgeTone={config.battle_maps.length > 0 ? 'cyan' : 'default'}
          description={t('hostingConfig.descriptions.battleMaps')}
          actionLabel={t('hostingConfig.dialog.edit')}
          onPress={openBattleQueueEditor}
        >
          <BattleStageChips
            emptyLabel={t('hostingConfig.dialog.queueEmpty')}
            queue={config.battle_maps}
            stageTable={stageTable}
          />
        </ConfigSummaryCard>
      </YStack>

      {/* Adapt Dialog / Sheet */}
      <Dialog
        modal
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeEditor();
        }}
      >
        <Adapt when="max-md" platform="touch">
          <Sheet
            zIndex={200000}
            modal
            dismissOnSnapToBottom
            dismissOnOverlayPress
            snapPoints={[90]}
            snapPointsMode="percent"
          >
            <Sheet.Overlay bg="$appScrim" />
            <Sheet.Handle bg="$appBorder" />
            <Sheet.Frame
              p="$4"
              pb="$8"
              bg="$appSurfaceStrong"
              borderTopWidth={1}
              borderColor="$appAccentBorder"
              borderTopLeftRadius="$4"
              borderTopRightRadius="$4"
            >
              <ScrollView showsVerticalScrollIndicator={false} pb="$6">
                <Adapt.Contents />
              </ScrollView>
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
            maxW={520}
            p="$4.5"
            gap="$4"
            bg="$appSurfaceStrong"
            borderWidth={1}
            borderColor="$appAccentBorder"
            rounded="$0"
          >
            {/* Numeric Editor */}
            {(activeEditor === 'keeping_ap' || activeEditor === 'recruit_reserve') && (
              <Form onSubmit={handleSaveNumeric} gap="$4">
                <YStack gap="$1.5">
                  <MonoText size="$1" color="$appAccent">
                    {activeEditor === 'keeping_ap' ? sanityCode : permitsCode}
                  </MonoText>
                  <TerminalText size="$5" fontWeight="800">
                    {activeEditor === 'keeping_ap' ? t('hostingConfig.keepingAp') : t('hostingConfig.recruitReserve')}
                  </TerminalText>
                  <MonoText size="$2">
                    {activeEditor === 'keeping_ap'
                      ? t('hostingConfig.descriptions.keepingAp')
                      : t('hostingConfig.descriptions.recruitReserve')}
                  </MonoText>
                </YStack>

                <YStack gap="$2.5">
                  <Input
                    id="hosting-config-numeric-input"
                    testID={activeEditor === 'keeping_ap' ? 'hosting-config-keeping-ap' : 'hosting-config-recruit-reserve'}
                    value={draftNumeric}
                    onChangeText={(val) => {
                      setLocalError(null);
                      setDraftNumeric(val);
                    }}
                    keyboardType="number-pad"
                    fontFamily="$mono"
                    fontSize="$6"
                    fontWeight="800"
                    color="$appText"
                    borderWidth={1}
                    borderColor="$appBorder"
                    bg="$appSurfaceRaised"
                    rounded="$0"
                    p="$3"
                    text="center"
                  />

                  {/* Stepper shortcuts */}
                  <XStack justify="center" gap="$2">
                    {STEPPER_DELTAS.map((delta) => {
                      const deltaLabel = delta > 0 ? `+${delta}` : String(delta);
                      return (
                        <Button
                          key={delta}
                          testID={`numeric-step-${delta}`}
                          unstyled
                          px="$3"
                          py="$1.5"
                          borderWidth={1}
                          borderColor="$appBorder"
                          bg="$appSurfaceRaised"
                          hoverStyle={{ borderColor: '$appAccent' }}
                          onPress={() => {
                            setLocalError(null);
                            const current = Number(draftNumeric) || 0;
                            setDraftNumeric(String(Math.max(0, current + delta)));
                          }}
                        >
                          <MonoText size="$2" color="$appAccent">
                            {deltaLabel}
                          </MonoText>
                        </Button>
                      );
                    })}
                    <Button
                      testID="numeric-step-reset"
                      unstyled
                      px="$3"
                      py="$1.5"
                      borderWidth={1}
                      borderColor="$appBorder"
                      bg="$appSurfaceRaised"
                      hoverStyle={{ borderColor: '$appAccent' }}
                      onPress={() => {
                        setLocalError(null);
                        setDraftNumeric('0');
                      }}
                    >
                      <MonoText size="$2" color="$appMuted">{zeroStepLabel}</MonoText>
                    </Button>
                  </XStack>
                </YStack>

                {localError ? <TerminalNotice tone="danger">{localError}</TerminalNotice> : null}

                <XStack justify="flex-end" gap="$3" mt="$2">
                  <Button
                    testID="hosting-config-dialog-cancel"
                    unstyled
                    px="$4"
                    py="$2"
                    borderWidth={1}
                    borderColor="$appBorder"
                    onPress={closeEditor}
                    disabled={isSubmitting}
                  >
                    <MonoText size="$2">{t('hostingConfig.dialog.cancel')}</MonoText>
                  </Button>
                  <Form.Trigger asChild>
                    <Button
                      testID="hosting-config-submit"
                      unstyled
                      px="$4"
                      py="$2"
                      borderWidth={1}
                      borderColor="$appAccent"
                      bg="$appAccentSoft"
                      hoverStyle={{ bg: '$appSurfaceRaised' }}
                      disabled={isSubmitting}
                    >
                      <XStack items="center" gap="$2">
                        {isSubmitting ? <Spinner size="small" color="$appAccent" /> : <Check size={14} color={colors.appAccent.val} />}
                        <MonoText size="$2" color="$appAccent" fontWeight="700">
                          {t('hostingConfig.dialog.save')}
                        </MonoText>
                      </XStack>
                    </Button>
                  </Form.Trigger>
                </XStack>
              </Form>
            )}

            {/* Switch Editor */}
            {(activeEditor === 'enable_building_arrange' ||
              activeEditor === 'is_auto_battle' ||
              activeEditor === 'recruit_ignore_robot') && (
              <Form onSubmit={handleSaveSwitch} gap="$4">
                <YStack gap="$1.5">
                  <MonoText size="$1" color="$appAccent">
                    {switchesCode}
                  </MonoText>
                  <TerminalText size="$5" fontWeight="800">
                    {activeEditor === 'enable_building_arrange' && t('hostingConfig.enableBuildingArrange')}
                    {activeEditor === 'is_auto_battle' && t('hostingConfig.autoBattle')}
                    {activeEditor === 'recruit_ignore_robot' && t('hostingConfig.ignoreRobot')}
                  </TerminalText>
                  <MonoText size="$2">
                    {activeEditor === 'enable_building_arrange' && t('hostingConfig.descriptions.enableBuildingArrange')}
                    {activeEditor === 'is_auto_battle' && t('hostingConfig.descriptions.isAutoBattle')}
                    {activeEditor === 'recruit_ignore_robot' && t('hostingConfig.descriptions.recruitIgnoreRobot')}
                  </MonoText>
                </YStack>

                <Frame p="$4" tone={draftSwitch ? 'cyan' : 'default'} gap="$2" items="center">
                  <XStack items="center" justify="space-between" width="100%">
                    <MonoText size="$3" fontWeight="700">
                      {draftSwitch ? t('hostingConfig.status.enabled') : t('hostingConfig.status.disabled')}
                    </MonoText>
                    <Switch
                      testID={
                        activeEditor === 'enable_building_arrange'
                          ? 'hosting-config-enable-building-arrange'
                          : activeEditor === 'is_auto_battle'
                            ? 'hosting-config-auto-battle'
                            : 'hosting-config-ignore-robot'
                      }
                      checked={draftSwitch}
                      onCheckedChange={setDraftSwitch}
                      size="$4"
                    >
                      <Switch.Thumb />
                    </Switch>
                  </XStack>
                </Frame>

                <XStack justify="flex-end" gap="$3" mt="$2">
                  <Button
                    testID="hosting-config-dialog-cancel"
                    unstyled
                    px="$4"
                    py="$2"
                    borderWidth={1}
                    borderColor="$appBorder"
                    onPress={closeEditor}
                    disabled={isSubmitting}
                  >
                    <MonoText size="$2">{t('hostingConfig.dialog.cancel')}</MonoText>
                  </Button>
                  <Form.Trigger asChild>
                    <Button
                      testID="hosting-config-submit"
                      unstyled
                      px="$4"
                      py="$2"
                      borderWidth={1}
                      borderColor="$appAccent"
                      bg="$appAccentSoft"
                      disabled={isSubmitting}
                    >
                      <XStack items="center" gap="$2">
                        {isSubmitting ? <Spinner size="small" color="$appAccent" /> : <Check size={14} color={colors.appAccent.val} />}
                        <MonoText size="$2" color="$appAccent" fontWeight="700">
                          {t('hostingConfig.dialog.save')}
                        </MonoText>
                      </XStack>
                    </Button>
                  </Form.Trigger>
                </XStack>
              </Form>
            )}

            {/* Drone Slot Editor */}
            {activeEditor === 'accelerate_slot' && (
              <Form onSubmit={handleSaveSlot} gap="$4">
                <YStack gap="$1.5">
                  <MonoText size="$1" color="$appAccent">
                    {droneCode}
                  </MonoText>
                  <TerminalText size="$5" fontWeight="800">
                    {t('hostingConfig.droneAcceleration')}
                  </TerminalText>
                  <MonoText size="$2">{t('hostingConfig.descriptions.droneAcceleration')}</MonoText>
                </YStack>

                <BaseInteractiveSelector
                  draftSlot={draftSlot}
                  getSlotLabel={(key) => t(ACCELERATE_SLOT_I18N_KEYS[key])}
                  onSelectSlot={setDraftSlot}
                />

                <XStack justify="flex-end" gap="$3" mt="$2">
                  <Button
                    testID="hosting-config-dialog-cancel"
                    unstyled
                    px="$4"
                    py="$2"
                    borderWidth={1}
                    borderColor="$appBorder"
                    onPress={closeEditor}
                    disabled={isSubmitting}
                  >
                    <MonoText size="$2">{t('hostingConfig.dialog.cancel')}</MonoText>
                  </Button>
                  <Form.Trigger asChild>
                    <Button
                      testID="hosting-config-submit"
                      unstyled
                      px="$4"
                      py="$2"
                      borderWidth={1}
                      borderColor="$appAccent"
                      bg="$appAccentSoft"
                      disabled={isSubmitting}
                    >
                      <XStack items="center" gap="$2">
                        {isSubmitting ? <Spinner size="small" color="$appAccent" /> : <Check size={14} color={colors.appAccent.val} />}
                        <MonoText size="$2" color="$appAccent" fontWeight="700">
                          {t('hostingConfig.dialog.save')}
                        </MonoText>
                      </XStack>
                    </Button>
                  </Form.Trigger>
                </XStack>
              </Form>
            )}

            {/* Battle Queue Editor */}
            {activeEditor === 'battle_maps' && (
              <Form onSubmit={handleSaveQueue} gap="$3.5">
                <YStack gap="$1.5">
                  <MonoText size="$1" color="$appAccent">
                    {combatCode}
                  </MonoText>
                  <TerminalText size="$5" fontWeight="800">
                    {t('hostingConfig.battleQueue')}
                  </TerminalText>
                  <MonoText size="$2">{t('hostingConfig.descriptions.battleMaps')}</MonoText>
                </YStack>

                {/* Stage Search Input */}
                <XStack items="center" gap="$2" px="$3" borderWidth={1} borderColor="$appBorder" bg="$appSurfaceRaised">
                  <Search size={14} color={colors.appMuted.val} />
                  <Input
                    testID="hosting-config-stage-search"
                    grow={1}
                    unstyled
                    p="$2"
                    fontSize="$2.5"
                    fontFamily="$mono"
                    color="$appText"
                    placeholder={t('hostingConfig.dialog.searchStages')}
                    placeholderTextColor="$appMuted"
                    value={stageKeyword}
                    onChangeText={setStageKeyword}
                  />
                  {stageKeyword ? (
                    <Button unstyled p="$1" onPress={() => setStageKeyword('')}>
                      <X size={14} color={colors.appMuted.val} />
                    </Button>
                  ) : null}
                </XStack>

                {/* Search Results */}
                {stageKeyword.trim() ? (
                  <YStack gap="$1.5" maxH={140} overflow="hidden">
                    <MonoText size="$1">{t('hostingConfig.dialog.searchResults')}</MonoText>
                    {filteredStages.length === 0 ? (
                      <MonoText size="$2" color="$appWarning">{t('hostingConfig.dialog.noSearchResults')}</MonoText>
                    ) : (
                      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                        <YStack gap="$1">
                          {filteredStages.map(({ entry, id }) => {
                            const isAlreadyInQueue = draftQueue.includes(id);
                            const stageCostText = `(${t('hostingConfig.dialog.stageCost', { cost: entry.ap })})`;
                            return (
                              <XStack
                                key={id}
                                testID={`stage-search-result-${id}`}
                                items="center"
                                justify="space-between"
                                p="$2"
                                borderWidth={1}
                                borderColor="$appBorder"
                                bg="$appSurface"
                              >
                                <XStack items="center" gap="$2">
                                  <TerminalText size="$2.5" fontWeight="700" color="$appAccent">
                                    {entry.code}
                                  </TerminalText>
                                  <MonoText size="$2">{entry.name}</MonoText>
                                  <MonoText size="$1" color="$appMuted">
                                    {stageCostText}
                                  </MonoText>
                                </XStack>
                                <Button
                                  testID={`stage-add-${id}`}
                                  unstyled
                                  px="$2.5"
                                  py="$1"
                                  borderWidth={1}
                                  borderColor={isAlreadyInQueue ? '$appBorder' : '$appAccent'}
                                  bg={isAlreadyInQueue ? '$appSurfaceRaised' : '$appAccentSoft'}
                                  disabled={isAlreadyInQueue}
                                  onPress={() => {
                                    if (!isAlreadyInQueue) {
                                      setDraftQueue((current) => [...current, id]);
                                    }
                                  }}
                                >
                                  <XStack items="center" gap="$1">
                                    <Plus size={12} color={isAlreadyInQueue ? colors.appMuted.val : colors.appAccent.val} />
                                    <MonoText size="$1" color={isAlreadyInQueue ? '$appMuted' : '$appAccent'}>
                                      {t('hostingConfig.dialog.addStage')}
                                    </MonoText>
                                  </XStack>
                                </Button>
                              </XStack>
                            );
                          })}
                        </YStack>
                      </ScrollView>
                    )}
                  </YStack>
                ) : null}

                {/* Current Queue */}
                <YStack gap="$1.5">
                  <XStack justify="space-between" items="center">
                    <MonoText size="$1">{t('hostingConfig.dialog.currentQueue')}</MonoText>
                    <MonoText size="$1" color="$appAccent">
                      {draftQueueCountLabel}
                    </MonoText>
                  </XStack>

                  {draftQueue.length === 0 ? (
                    <YStack p="$3" borderWidth={1} borderColor="$appBorder" bg="$appSurfaceRaised">
                      <MonoText size="$2" color="$appMuted">{t('hostingConfig.dialog.queueEmpty')}</MonoText>
                    </YStack>
                  ) : (
                    <YStack gap="$1" maxH={140} overflow="hidden">
                      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                        <YStack gap="$1">
                          {draftQueue.map((stageId, index) => {
                            const { code, name } = formatStageLabel(stageTable, stageId);
                            const nameText = name ? ` (${name})` : '';
                            const queueIndexText = String(index + 1).padStart(2, '0');

                            return (
                              <XStack
                                key={`${stageId}-${index}`}
                                testID={`queue-item-${index}`}
                                items="center"
                                justify="space-between"
                                p="$2"
                                borderWidth={1}
                                borderColor="$appBorder"
                                bg="$appSurfaceRaised"
                              >
                                <XStack items="center" gap="$2">
                                  <MonoText size="$2" color="$appAccent" fontWeight="700">
                                    {queueIndexText}
                                  </MonoText>
                                  <TerminalText size="$2.5" fontWeight="700">
                                    {code}
                                  </TerminalText>
                                  {name ? <MonoText size="$2">{nameText}</MonoText> : null}
                                </XStack>
                                <Button
                                  testID={`queue-remove-${index}`}
                                  unstyled
                                  p="$1.5"
                                  hoverStyle={{ bg: '$appDangerSoft' }}
                                  onPress={() => {
                                    setDraftQueue((current) => current.filter((_, i) => i !== index));
                                  }}
                                >
                                  <Trash2 size={13} color={colors.appDanger.val} />
                                </Button>
                              </XStack>
                            );
                          })}
                        </YStack>
                      </ScrollView>
                    </YStack>
                  )}
                </YStack>

                <XStack justify="flex-end" gap="$3" mt="$2">
                  <Button
                    testID="hosting-config-dialog-cancel"
                    unstyled
                    px="$4"
                    py="$2"
                    borderWidth={1}
                    borderColor="$appBorder"
                    onPress={closeEditor}
                    disabled={isSubmitting}
                  >
                    <MonoText size="$2">{t('hostingConfig.dialog.cancel')}</MonoText>
                  </Button>
                  <Form.Trigger asChild>
                    <Button
                      testID="hosting-config-submit"
                      unstyled
                      px="$4"
                      py="$2"
                      borderWidth={1}
                      borderColor="$appAccent"
                      bg="$appAccentSoft"
                      disabled={isSubmitting}
                    >
                      <XStack items="center" gap="$2">
                        {isSubmitting ? <Spinner size="small" color="$appAccent" /> : <Check size={14} color={colors.appAccent.val} />}
                        <MonoText size="$2" color="$appAccent" fontWeight="700">
                          {t('hostingConfig.dialog.save')}
                        </MonoText>
                      </XStack>
                    </Button>
                  </Form.Trigger>
                </XStack>
              </Form>
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
