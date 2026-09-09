import { ChevronRight, Cpu } from 'lucide-react-native';
import { Button, RadioGroup, XStack, YStack, getTokens } from 'tamagui';

import { Frame, MonoText, TerminalText } from '@/components';
import type { ArkHostAccelerateSlot, ArkHostBuilding } from '@/schemas/arkhost';
import { BASE_VIEWBOX, BaseBlueprintArtwork, baseRoomBounds, type BaseArtworkLabels, type BaseRoomType } from './base-blueprint-artwork';

export const ACCELERATE_SLOT_OPTIONS = [
  { key: 'topLeft', value: 'slot_24' },
  { key: 'topCenter', value: 'slot_25' },
  { key: 'topRight', value: 'slot_26' },
  { key: 'middleLeft', value: 'slot_14' },
  { key: 'middleCenter', value: 'slot_15' },
  { key: 'middleRight', value: 'slot_16' },
  { key: 'bottomLeft', value: 'slot_5' },
  { key: 'bottomCenter', value: 'slot_6' },
  { key: 'bottomRight', value: 'slot_7' },
] as const satisfies readonly {
  key: string;
  value: ArkHostAccelerateSlot;
}[];

export function getRoomType(rooms: ArkHostBuilding['rooms'] | undefined, slot: ArkHostAccelerateSlot): BaseRoomType {
  if (rooms?.TRADING?.[slot]) return 'TRADING';
  if (rooms?.MANUFACTURE?.[slot]) return 'MANUFACTURE';
  return 'POWER';
}

export function isAccelerateSlotSelectable(
  rooms: ArkHostBuilding['rooms'] | undefined,
  slot: ArkHostAccelerateSlot,
): boolean {
  return getRoomType(rooms, slot) !== 'POWER';
}

export type BaseMatrixLabels = BaseArtworkLabels;

function BaseRoomPreview({ selectedSlot, rooms }: { selectedSlot: ArkHostAccelerateSlot; rooms: ArkHostBuilding['rooms'] | undefined }) {
  return (
    <YStack width={100} aspectRatio={BASE_VIEWBOX.width / BASE_VIEWBOX.height} aria-hidden shrink={0}>
      <BaseBlueprintArtwork roomTypes={ACCELERATE_SLOT_OPTIONS.map(slot => getRoomType(rooms, slot.value))} selectedIndex={ACCELERATE_SLOT_OPTIONS.findIndex(slot => slot.value === selectedSlot)} />
    </YStack>
  );
}

export type BaseAccelerationCardProps = {
  rooms?: ArkHostBuilding['rooms'] | undefined;
  actionLabel: string;
  ariaLabel: string;
  description: string;
  onPress: () => void;
  selectedLabel: string;
  selectedSlot: ArkHostAccelerateSlot;
  testID: string;
};

export function BaseAccelerationCard({
  actionLabel,
  ariaLabel,
  description,
  onPress,
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
      onPress={onPress}
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

export type BaseInteractiveSelectorProps = {
  rooms?: ArkHostBuilding['rooms'] | undefined;
  ariaLabel: string;
  disabled?: boolean;
  draftSlot: ArkHostAccelerateSlot;
  labels: BaseMatrixLabels;
  onSelectSlot: (value: ArkHostAccelerateSlot) => void;
};

export function BaseInteractiveSelector({
  ariaLabel,
  disabled = false,
  draftSlot,
  labels,
  onSelectSlot,
  rooms,
}: BaseInteractiveSelectorProps) {
  const getRoomLabel = (slot: (typeof ACCELERATE_SLOT_OPTIONS)[number]) =>
    labels.roomTypes[getRoomType(rooms, slot.value)];
  const selectedIndex = ACCELERATE_SLOT_OPTIONS.findIndex(slot => slot.value === draftSlot);
  return (
    <YStack gap="$2">
      <RadioGroup
        value={draftSlot}
        disabled={disabled}
        onValueChange={(value) => {
          const option = ACCELERATE_SLOT_OPTIONS.find(candidate => candidate.value === value);
          if (option) onSelectSlot(option.value);
        }}
        aria-label={ariaLabel}
      >
        <YStack position="relative" width="100%" aspectRatio={BASE_VIEWBOX.width / BASE_VIEWBOX.height} opacity={disabled ? 0.45 : 1}>
          <YStack position="absolute" t={0} l={0} r={0} b={0} aria-hidden style={{ pointerEvents: 'none' }}>
            <BaseBlueprintArtwork
              selectedIndex={selectedIndex}
              roomTypes={ACCELERATE_SLOT_OPTIONS.map(slot => getRoomType(rooms, slot.value))}
              labels={labels}
            />
          </YStack>
          {ACCELERATE_SLOT_OPTIONS.map((option, index) => {
            const room = baseRoomBounds(index);
            const optionDisabled = disabled || !isAccelerateSlotSelectable(rooms, option.value);
            return (
              <RadioGroup.Item
                key={option.value}
                value={option.value}
                id={`hosting-config-slot-${option.key}`}
                aria-label={getRoomLabel(option)}
                disabled={optionDisabled}
                asChild
                unstyled
              >
                <Button
                  testID={`hosting-config-slot-${option.key}`}
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
          {ACCELERATE_SLOT_OPTIONS.filter(slot => slot.value === draftSlot).map(getRoomLabel)}
        </TerminalText>
      </XStack>
    </YStack>
  );
}
