import { Check, ChevronRight, Cpu } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, Form, RadioGroup, Spinner, XStack, YStack, getTokens, useMedia } from 'tamagui';

import { Frame, MonoText, TerminalText } from '@/components';
import type { ArkHostAccelerateSlot, ArkHostBuilding, ArkHostGameConfigPatch } from '@/schemas/arkhost';
import { AdaptiveEditorDialog } from './adaptive-editor-dialog';
import { BASE_VIEWBOX, BaseBlueprintArtwork, baseRoomBounds, type BaseArtworkLabels, type BaseRoomType } from './base-blueprint-artwork';

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

function BaseRoomPreview({ selectedSlot, rooms }: { selectedSlot: ArkHostAccelerateSlot; rooms: ArkHostBuilding['rooms'] | undefined }) {
  return (
    <YStack width={100} aspectRatio={BASE_VIEWBOX.width / BASE_VIEWBOX.height} aria-hidden shrink={0}>
      <BaseBlueprintArtwork roomTypes={ACCELERATE_SLOTS.map(slot => getRoomType(rooms, slot))} selectedIndex={ACCELERATE_SLOTS.indexOf(selectedSlot)} />
    </YStack>
  );
}

type BaseAccelerationCardProps = {
  rooms?: ArkHostBuilding['rooms'] | undefined;
  actionLabel: string;
  ariaLabel: string;
  description: string;
  selectedLabel: string;
  selectedSlot: ArkHostAccelerateSlot;
  testID: string;
};

function BaseAccelerationCard({
  actionLabel,
  ariaLabel,
  description,
  selectedLabel,
  selectedSlot,
  rooms,
  testID,
}: BaseAccelerationCardProps) {
  const colors = getTokens().color;

  return (
    <Frame
      testID={testID}
      aria-label={ariaLabel}
      role="button"
      cursor="pointer"
      p="$3.5"
      gap="$2.5"
      hoverStyle={{
        bg: '$appSurfaceStrong',
        borderColor: '$appAccentBorder',
      }}
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
            {actionLabel}
          </MonoText>
          <ChevronRight size={13} color={colors.appAccent.val} />
        </XStack>
      </XStack>

      <XStack items="center" justify="space-between" gap="$3" minW={0}>
        <MonoText size="$2" color="$appMuted" numberOfLines={2} grow={1} minW={0}>
          {description}
        </MonoText>
        <BaseRoomPreview selectedSlot={selectedSlot} rooms={rooms} />
      </XStack>
    </Frame>
  );
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
  const labels: BaseArtworkLabels = {
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
  const selectedLabel = labels.roomTypes[getRoomType(rooms, value)];

  return (
    <AdaptiveEditorDialog
      wide
      trigger={(
        <BaseAccelerationCard
          rooms={rooms}
          testID="hosting-config-card-drone-acceleration"
          ariaLabel={`${t('hostingConfig.sections.drone')}: ${selectedLabel}`}
          selectedLabel={selectedLabel}
          selectedSlot={value}
          description={t('hostingConfig.summaries.droneAcceleration', { roomType: selectedLabel })}
          actionLabel={t('hostingConfig.dialog.edit')}
        />
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
  labels: BaseArtworkLabels;
  isSubmitting: boolean;
  onSubmit: (patch: ArkHostGameConfigPatch) => Promise<void>;
  onSaved: () => void;
}) {
  const { t } = useTranslation('dashboard');
  const { large } = useMedia();
  const colors = getTokens().color;
  const [draftSlot, setDraftSlot] = useState(initialValue);
  const canSave = draftSlot !== initialValue && isAccelerateSlotSelectable(rooms, draftSlot) && !isSubmitting;

  const handleSubmit = () => {
    if (!canSave) return;
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

      <XStack items="center" justify="flex-end" gap="$2">
        <Button
          testID="hosting-config-dialog-cancel"
          unstyled
          minH="$4"
          px="$3"
          py="$2"
          hoverStyle={{ bg: '$appSurfaceRaised' }}
          pressStyle={{ opacity: 0.7 }}
          disabled={isSubmitting}
          onPress={onSaved}
        >
          <MonoText size={large ? '$2' : '$2.5'}>{t('hostingConfig.dialog.cancel')}</MonoText>
        </Button>
        <Form.Trigger asChild>
          <Button
            testID="hosting-config-submit" unstyled minH="$4" px="$4" py="$2"
            borderWidth={1} borderColor="$appAccent" bg="$appAccent"
            opacity={canSave ? 1 : 0.4} hoverStyle={{ opacity: 0.85 }} pressStyle={{ opacity: 0.7 }} disabled={!canSave}
          >
            <XStack items="center" justify="center" gap="$2">
              {isSubmitting ? <Spinner size="small" color="$appBackground" /> : <Check size={14} color={colors.appBackground.val} />}
              <MonoText size={large ? '$2' : '$2.5'} color="$appBackground" fontWeight="700">{t('hostingConfig.dialog.save')}</MonoText>
            </XStack>
          </Button>
        </Form.Trigger>
      </XStack>
    </Form>
  );
}

type BaseInteractiveSelectorProps = {
  rooms?: ArkHostBuilding['rooms'] | undefined;
  ariaLabel: string;
  disabled?: boolean;
  draftSlot: ArkHostAccelerateSlot;
  labels: BaseArtworkLabels;
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
    labels.roomTypes[getRoomType(rooms, slot)];
  const selectedIndex = ACCELERATE_SLOTS.indexOf(draftSlot);
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
        <YStack position="relative" width="100%" aspectRatio={BASE_VIEWBOX.width / BASE_VIEWBOX.height} opacity={disabled ? 0.45 : 1}>
          <YStack position="absolute" t={0} l={0} r={0} b={0} aria-hidden style={{ pointerEvents: 'none' }}>
            <BaseBlueprintArtwork
              selectedIndex={selectedIndex}
              roomTypes={ACCELERATE_SLOTS.map(slot => getRoomType(rooms, slot))}
              labels={labels}
            />
          </YStack>
          {ACCELERATE_SLOTS.map((slot, index) => {
            const room = baseRoomBounds(index);
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
                  position="absolute"
                  l={`${room.x / BASE_VIEWBOX.width * 100}%`}
                  t={`${room.y / BASE_VIEWBOX.height * 100}%`}
                  width={`${room.width / BASE_VIEWBOX.width * 100}%`}
                  height={`${room.height / BASE_VIEWBOX.height * 100}%`}
                  disabled={optionDisabled}
                  bg="transparent"
                  cursor={optionDisabled ? 'default' : 'pointer'}
                  rounded="$0"
                  hoverStyle={{ bg: '$appGrid' }}
                  focusStyle={{ outlineColor: '$appAccent', outlineWidth: 2, borderWidth: 1, borderColor: '$appAccent' }}
                  pressStyle={{ bg: '$appGrid' }}
                />
              </RadioGroup.Item>
            );
          })}
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
