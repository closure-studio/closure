import { ChevronRight, Cpu } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, Form, RadioGroup, XStack, YStack, getTokens, useMedia } from 'tamagui';

import { Frame, MonoText, TerminalText } from '@/components';
import type { ArkHostAccelerateSlot, ArkHostBuilding, ArkHostGameConfigPatch } from '@/schemas/arkhost';
import { AdaptiveEditorDialog, EditorActions } from './adaptive-editor-dialog';

const ACCELERATE_SLOTS = [
  'slot_24',
  'slot_25',
  'slot_26',
  'slot_14',
  'slot_15',
  'slot_16',
  'slot_5',
  'slot_6',
  'slot_7',
] as const satisfies readonly ArkHostAccelerateSlot[];

type BaseRoomType = 'MANUFACTURE' | 'POWER' | 'TRADING';

function getRoomType(rooms: ArkHostBuilding['rooms'] | undefined, slot: ArkHostAccelerateSlot): BaseRoomType {
  if (rooms?.TRADING?.[slot]) return 'TRADING';
  if (rooms?.MANUFACTURE?.[slot]) return 'MANUFACTURE';
  return 'POWER';
}

function isAccelerateSlotSelectable(
  rooms: ArkHostBuilding['rooms'] | undefined,
  slot: ArkHostAccelerateSlot,
): boolean {
  return getRoomType(rooms, slot) !== 'POWER';
}

export function DroneAccelerationSetting({
  rooms,
  value,
  isSubmitting,
  onSubmit,
}: {
  rooms?: ArkHostBuilding['rooms'] | undefined;
  value: ArkHostAccelerateSlot;
  isSubmitting: boolean;
  onSubmit: (patch: ArkHostGameConfigPatch) => Promise<void>;
}) {
  const { t } = useTranslation('dashboard');
  const colors = getTokens().color;
  const labels: Record<BaseRoomType, string> = {
    MANUFACTURE: t('hostingConfig.roomTypes.manufacture'),
    TRADING: t('hostingConfig.roomTypes.trading'),
    POWER: t('hostingConfig.roomTypes.power'),
  };
  const selectedLabel = labels[getRoomType(rooms, value)];

  return (
    <AdaptiveEditorDialog
      wide
      trigger={(
        <Frame
          testID="hosting-config-card-drone-acceleration"
          aria-label={`${t('hostingConfig.sections.drone')}: ${selectedLabel}`}
          role="button"
          cursor="pointer"
          p="$3.5"
          gap="$2.5"
          hoverStyle={{ bg: '$appSurfaceStrong', borderColor: '$appAccentBorder' }}
          pressStyle={{ opacity: 0.8 }}
        >
          <XStack items="center" justify="space-between" gap="$3" minW={0}>
            <XStack items="center" gap="$2" minW={0} shrink={1}>
              <Cpu size={17} color={colors.appMuted.val} />
              <TerminalText size="$5" fontWeight="800" numberOfLines={1}>
                {selectedLabel}
              </TerminalText>
            </XStack>
            <XStack items="center" gap="$1" shrink={0}>
              <MonoText size="$2" color="$appAccent">
                {t('hostingConfig.dialog.edit')}
              </MonoText>
              <ChevronRight size={13} color={colors.appAccent.val} />
            </XStack>
          </XStack>
          <MonoText size="$2" color="$appMuted" numberOfLines={2}>
            {t('hostingConfig.summaries.droneAcceleration', { roomType: selectedLabel })}
          </MonoText>
        </Frame>
      )}
    >
      {(close) => (
        <DroneAccelerationEditor
          rooms={rooms}
          initialValue={value}
          labels={labels}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onSaved={close}
        />
      )}
    </AdaptiveEditorDialog>
  );
}

function DroneAccelerationEditor({
  rooms,
  initialValue,
  labels,
  isSubmitting,
  onSubmit,
  onSaved,
}: {
  rooms?: ArkHostBuilding['rooms'] | undefined;
  initialValue: ArkHostAccelerateSlot;
  labels: Record<BaseRoomType, string>;
  isSubmitting: boolean;
  onSubmit: (patch: ArkHostGameConfigPatch) => Promise<void>;
  onSaved: () => void;
}) {
  const { t } = useTranslation('dashboard');
  const { large } = useMedia();
  const [draftSlot, setDraftSlot] = useState(initialValue);
  const canSave = draftSlot !== initialValue && isAccelerateSlotSelectable(rooms, draftSlot);

  const handleSubmit = () => {
    if (!canSave || isSubmitting) return;
    onSubmit({ accelerate_slot: draftSlot }).then(onSaved).catch(() => undefined);
  };

  return (
    <Form onSubmit={handleSubmit} gap="$4">
      <YStack gap="$2">
        <MonoText size="$1" color="$appMuted" letterSpacing={3}>{t('hostingConfig.dialog.baseTerminal')}</MonoText>
        <Dialog.Title asChild>
          <TerminalText size={large ? '$9' : '$5.5'} fontWeight="800" numberOfLines={2}>{t('hostingConfig.dialog.targetRoom')}</TerminalText>
        </Dialog.Title>
        <Dialog.Description asChild>
          <MonoText size={large ? '$2' : '$2.5'} color="$appMuted">{t('hostingConfig.descriptions.droneAcceleration')}</MonoText>
        </Dialog.Description>
      </YStack>

      <BaseInteractiveSelector
        rooms={rooms}
        ariaLabel={t('hostingConfig.dialog.targetRoom')}
        disabled={isSubmitting}
        draftSlot={draftSlot}
        labels={labels}
        onSelectSlot={setDraftSlot}
      />

      <EditorActions
        canSave={canSave}
        isSubmitting={isSubmitting}
        onCancel={onSaved}
        solid
      />
    </Form>
  );
}

type BaseInteractiveSelectorProps = {
  rooms?: ArkHostBuilding['rooms'] | undefined;
  ariaLabel: string;
  disabled?: boolean;
  draftSlot: ArkHostAccelerateSlot;
  labels: Record<BaseRoomType, string>;
  onSelectSlot: (value: ArkHostAccelerateSlot) => void;
};

function BaseInteractiveSelector({
  ariaLabel,
  disabled = false,
  draftSlot,
  labels,
  onSelectSlot,
  rooms,
}: BaseInteractiveSelectorProps) {
  const getRoomLabel = (slot: ArkHostAccelerateSlot) =>
    labels[getRoomType(rooms, slot)];
  return (
    <YStack gap="$2">
      <RadioGroup
        value={draftSlot}
        disabled={disabled}
        onValueChange={(value) => {
          const slot = ACCELERATE_SLOTS.find(candidate => candidate === value);
          if (slot) onSelectSlot(slot);
        }}
        aria-label={ariaLabel}
      >
        <YStack gap="$2" opacity={disabled ? 0.45 : 1}>
          {[0, 3, 6].map((start) => (
            <XStack key={start} gap="$2">
              {ACCELERATE_SLOTS.slice(start, start + 3).map((slot) => {
                const selected = slot === draftSlot;
                const optionDisabled = disabled || !isAccelerateSlotSelectable(rooms, slot);
                return (
                  <RadioGroup.Item
                    key={slot}
                    value={slot}
                    id={`hosting-config-slot-${slot}`}
                    aria-label={getRoomLabel(slot)}
                    disabled={optionDisabled}
                    asChild
                    unstyled
                  >
                    <Button
                      testID={`hosting-config-slot-${slot}`}
                      unstyled
                      grow={1}
                      minW={0}
                      minH="$6"
                      px="$2"
                      items="center"
                      justify="center"
                      borderWidth={1}
                      borderColor={selected ? '$appAccent' : '$appBorder'}
                      bg={selected ? '$appAccentSoft' : '$appSurfaceRaised'}
                      disabled={optionDisabled}
                      cursor={optionDisabled ? 'default' : 'pointer'}
                      opacity={optionDisabled ? 0.35 : 1}
                      hoverStyle={{ borderColor: '$appAccentBorder' }}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <TerminalText
                        size="$2"
                        color={selected ? '$appAccent' : '$appText'}
                        fontWeight={selected ? '800' : '600'}
                        text="center"
                        numberOfLines={2}
                      >
                        {getRoomLabel(slot)}
                      </TerminalText>
                    </Button>
                  </RadioGroup.Item>
                );
              })}
            </XStack>
          ))}
        </YStack>
      </RadioGroup>
      <XStack items="center" gap="$2" borderTopWidth={1} borderColor="$appBorder" pt="$3">
        <YStack width={3} height={22} bg="$appAccent" />
        <TerminalText color="$appAccent" size="$4" fontWeight="800" aria-live="polite">
          {getRoomLabel(draftSlot)}
        </TerminalText>
      </XStack>
    </YStack>
  );
}
