import { ChevronRight, Cpu } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, Form, RadioGroup, XStack, YStack, getTokens, useMedia } from 'tamagui';

import { Frame, MonoText, TerminalText } from '@/components';
import type { ArkHostAccelerateSlot, ArkHostBuilding, ArkHostGameConfigPatch } from '@/schemas/arkhost';
import { AdaptiveEditorDialog, EditorActions } from './adaptive-editor-dialog';
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

function BaseAccelerationCardContent({
  selectedLabel,
  selectedSlot,
  rooms,
}: {
  rooms?: ArkHostBuilding['rooms'] | undefined;
  selectedLabel: string;
  selectedSlot: ArkHostAccelerateSlot;
}) {
  const { t } = useTranslation('dashboard');
  const colors = getTokens().color;

  return (
    <>
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

      <XStack items="center" justify="space-between" gap="$3" minW={0}>
        <MonoText size="$2" color="$appMuted" numberOfLines={2} grow={1} minW={0}>
          {t('hostingConfig.summaries.droneAcceleration', { roomType: selectedLabel })}
        </MonoText>
        <BaseRoomPreview selectedSlot={selectedSlot} rooms={rooms} />
      </XStack>
    </>
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
    MANUFACTURE: {
      title: t('hostingConfig.roomTypes.manufacture'),
      status: t('hostingConfig.roomStatuses.manufacture'),
    },
    TRADING: {
      title: t('hostingConfig.roomTypes.trading'),
      status: t('hostingConfig.roomStatuses.trading'),
    },
    POWER: {
      title: t('hostingConfig.roomTypes.power'),
      status: t('hostingConfig.roomStatuses.power'),
    },
  };
  const selectedLabel = labels[getRoomType(rooms, value)].title;

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
          <BaseAccelerationCardContent
            rooms={rooms}
            selectedLabel={selectedLabel}
            selectedSlot={value}
          />
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
  labels: BaseArtworkLabels;
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
    labels[getRoomType(rooms, slot)].title;
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
              animated
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
