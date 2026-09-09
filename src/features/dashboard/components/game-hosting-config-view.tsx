import { Bot, Building2, ShieldAlert, Swords } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XStack, YStack, getTokens } from 'tamagui';

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
import {
  AutomationSwitchControl,
} from '../game-settings/components/automation-switch-control';
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
  const [pendingField, setPendingField] = useState<EditableAutomationField | null>(null);

  const update = (field: EditableAutomationField, checked: boolean) => {
    if (isSubmitting || pendingField !== null) return;
    setPendingField(field);
    onSubmit({ [field]: checked })
      .catch(() => undefined)
      .finally(() => setPendingField(null));
  };

  return (
    <YStack gap="$2.5">
      <TerminalSectionHeading code="02" title={t('hostingConfig.sections.switches')} />
      <XStack flexWrap="wrap" gap="$2">
        <AutomationCard
          testID="hosting-config-card-enable-building-arrange"
          switchTestID="hosting-config-enable-building-arrange"
          icon={Building2}
          title={t('hostingConfig.enableBuildingArrange')}
          description={t('hostingConfig.summaries.enableBuildingArrange')}
          checked={config.enable_building_arrange}
          disabled={isSubmitting || pendingField !== null}
          pending={pendingField === 'enable_building_arrange'}
          onCheckedChange={(checked) => update('enable_building_arrange', checked)}
        />
        <AutomationCard
          testID="hosting-config-card-auto-battle"
          switchTestID="hosting-config-auto-battle"
          icon={Swords}
          title={t('hostingConfig.autoBattle')}
          description={t('hostingConfig.summaries.isAutoBattle')}
          checked={config.is_auto_battle}
          disabled={isSubmitting || pendingField !== null}
          pending={pendingField === 'is_auto_battle'}
          onCheckedChange={(checked) => update('is_auto_battle', checked)}
        />
        <AutomationCard
          testID="hosting-config-card-ignore-robot"
          switchTestID="hosting-config-ignore-robot"
          icon={Bot}
          title={t('hostingConfig.ignoreRobot')}
          description={t('hostingConfig.summaries.recruitIgnoreRobot')}
          checked={config.recruit_ignore_robot}
          disabled={isSubmitting || pendingField !== null}
          pending={pendingField === 'recruit_ignore_robot'}
          onCheckedChange={(checked) => update('recruit_ignore_robot', checked)}
        />
        <AutomationCard
          testID="hosting-config-card-allow-login-assist"
          switchTestID="hosting-config-allow-login-assist"
          icon={ShieldAlert}
          title={t('hostingConfig.allowLoginAssist')}
          description={t('hostingConfig.summaries.allowLoginAssist')}
          checked={config.allow_login_assist}
          disabled
          statusLabel={t('hostingConfig.status.maintenance')}
        />
      </XStack>
    </YStack>
  );
}

function AutomationCard({
  testID,
  switchTestID,
  icon: Icon,
  title,
  description,
  checked,
  disabled,
  pending = false,
  statusLabel,
  onCheckedChange,
}: {
  testID: string;
  switchTestID: string;
  icon: typeof Building2;
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  pending?: boolean;
  statusLabel?: string;
  onCheckedChange?: (checked: boolean) => void;
}) {
  const colors = getTokens().color;

  return (
    <YStack width="100%" $large={{ width: '49%' }}>
      <Frame
        testID={testID}
        p="$3"
        gap="$1.5"
        opacity={onCheckedChange ? 1 : 0.65}
      >
        <XStack items="center" justify="space-between" gap="$2">
          <XStack items="center" gap="$2" minW={0} shrink={1}>
            <Icon size={16} color={colors.appMuted.val} />
            <TerminalText size="$3" fontWeight="700" numberOfLines={1}>
              {title}
            </TerminalText>
          </XStack>
          <AutomationSwitchControl
            testID={switchTestID}
            label={title}
            checked={checked}
            disabled={disabled}
            pending={pending}
            {...(statusLabel ? { statusLabel } : {})}
            {...(onCheckedChange ? { onCheckedChange } : {})}
          />
        </XStack>
        <MonoText size="$2" color="$appMuted" numberOfLines={2}>
          {description}
        </MonoText>
      </Frame>
    </YStack>
  );
}
