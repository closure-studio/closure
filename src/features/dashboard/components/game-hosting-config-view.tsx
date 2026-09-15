import { Bot, Building2, Swords } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Switch, XStack, YStack, getTokens, useMedia } from 'tamagui';

import {
  DecorativeBarcode,
  Frame,
  MonoText,
  TerminalNotice,
  TerminalSectionHeading,
  TerminalText,
} from '@/components';
import type {
  ArkHostBuilding,
  ArkHostGameConfig,
  ArkHostGameConfigPatch,
} from '@/schemas/arkhost';
import { DroneAccelerationSetting } from '../game-settings/components/base-blueprint-matrix';
import { BattleQueueSetting } from '../game-settings/components/battle-configuration';
import { ResourceReserveSetting } from '../game-settings/components/resource-reserve-editor';
import { useStageTable } from '../resources';

type GameHostingConfigViewProps = {
  rooms?: ArkHostBuilding['rooms'] | undefined;
  config: ArkHostGameConfig;
  isSubmitting: boolean;
  onSubmit: (patch: ArkHostGameConfigPatch) => Promise<void>;
  submitError: string | null;
};

export function GameHostingConfigView({
  config,
  rooms,
  isSubmitting,
  onSubmit,
  submitError,
}: GameHostingConfigViewProps) {
  const { t } = useTranslation('dashboard');
  const stageTable = useStageTable();

  return (
    <YStack testID="game-hosting-config-view" gap="$4" pb="$4">
      <TerminalNotice tone="warning">{t('hostingConfig.warning')}</TerminalNotice>
      {submitError ? <TerminalNotice tone="danger">{submitError}</TerminalNotice> : null}

      <YStack gap="$2.5">
        <TerminalSectionHeading
          code="01"
          title={t('hostingConfig.sections.reserves')}
          trailing={<DecorativeBarcode />}
        />
        <XStack flexDirection="column" gap="$3" $large={{ flexDirection: 'row' }}>
          <YStack grow={1} shrink={1} minW={200}>
            <ResourceReserveSetting
              field="keeping_ap"
              value={config.keeping_ap}
              isSubmitting={isSubmitting}
              onSubmit={onSubmit}
            />
          </YStack>
          <YStack grow={1} shrink={1} minW={200}>
            <ResourceReserveSetting
              field="recruit_reserve"
              value={config.recruit_reserve}
              isSubmitting={isSubmitting}
              onSubmit={onSubmit}
            />
          </YStack>
        </XStack>
      </YStack>

      <AutomationSettings
        config={config}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      />

      <YStack gap="$2.5">
        <TerminalSectionHeading code="03" title={t('hostingConfig.sections.drone')} />
        <DroneAccelerationSetting
          rooms={rooms}
          value={config.accelerate_slot}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      </YStack>

      <YStack gap="$2.5">
        <TerminalSectionHeading code="04" title={t('hostingConfig.sections.combat')} />
        <BattleQueueSetting
          tasks={config.battle_tasks}
          stageTable={stageTable}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      </YStack>
    </YStack>
  );
}

type EditableAutomationField =
  | 'enable_building_arrange'
  | 'is_auto_battle'
  | 'recruit_ignore_robot';

function AutomationSettings({
  config,
  isSubmitting,
  onSubmit,
}: Pick<GameHostingConfigViewProps, 'config' | 'isSubmitting' | 'onSubmit'>) {
  const { t } = useTranslation('dashboard');
  const settings = [
    { id: 'enable-building-arrange', field: 'enable_building_arrange', icon: Building2, checked: config.enable_building_arrange, title: t('hostingConfig.enableBuildingArrange'), description: t('hostingConfig.summaries.enableBuildingArrange') },
    { id: 'auto-battle', field: 'is_auto_battle', icon: Swords, checked: config.is_auto_battle, title: t('hostingConfig.autoBattle'), description: t('hostingConfig.summaries.isAutoBattle') },
    { id: 'ignore-robot', field: 'recruit_ignore_robot', icon: Bot, checked: config.recruit_ignore_robot, title: t('hostingConfig.ignoreRobot'), description: t('hostingConfig.summaries.recruitIgnoreRobot') },
  ] as const;

  const update = (field: EditableAutomationField, checked: boolean) => {
    if (isSubmitting) return;
    void onSubmit({ [field]: checked }).catch(() => undefined);
  };

  return (
    <YStack gap="$2.5">
      <TerminalSectionHeading code="02" title={t('hostingConfig.sections.switches')} />
      <XStack flexWrap="wrap" gap="$2">
        {settings.map((setting) => (
          <AutomationCard
            key={setting.id}
            id={setting.id}
            icon={setting.icon}
            title={setting.title}
            description={setting.description}
            checked={setting.checked}
            disabled={isSubmitting}
            onCheckedChange={(checked) => update(setting.field, checked)}
          />
        ))}
      </XStack>
    </YStack>
  );
}

function AutomationCard({
  id,
  icon: Icon,
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  id: string;
  icon: typeof Building2;
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const colors = getTokens().color;
  const { large } = useMedia();

  return (
    <YStack width="100%" $large={{ width: '49%' }}>
      <Frame
        testID={`hosting-config-card-${id}`}
        p="$3"
        gap="$1.5"
      >
        <XStack items="center" justify="space-between" gap="$2">
          <XStack items="center" gap="$2" minW={0} shrink={1}>
            <Icon size={16} color={colors.appMuted.val} />
            <TerminalText size="$3" fontWeight="700" numberOfLines={1}>
              {title}
            </TerminalText>
          </XStack>
          <XStack items="center" gap="$1.5" shrink={0}>
            <Switch
              testID={`hosting-config-${id}`}
              aria-label={title}
              aria-disabled={disabled}
              checked={checked}
              disabled={disabled}
              size={large ? '$3.5' : '$2'}
              bg={checked ? '$appAccentSoft' : '$appSurface'}
              borderWidth={1}
              borderColor={checked ? '$appAccentBorder' : '$appBorder'}
              onCheckedChange={onCheckedChange}
            >
              <Switch.Thumb bg={checked ? '$appAccent' : '$appMuted'} />
            </Switch>
          </XStack>
        </XStack>
        <MonoText size="$2" color="$appMuted" numberOfLines={2}>
          {description}
        </MonoText>
      </Frame>
    </YStack>
  );
}
