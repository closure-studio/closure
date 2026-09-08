import { Button, RadioGroup, XStack, YStack } from 'tamagui';

import { MonoText, TerminalText } from '@/components';
import type { ArkHostAccelerateSlot } from '@/schemas/arkhost';

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
] as const satisfies readonly { key: string; value: ArkHostAccelerateSlot }[];

export type SlotKey = (typeof ACCELERATE_SLOT_OPTIONS)[number]['key'];

export function BaseMiniGrid({
  getSlotLabel,
  selectedSlot,
}: {
  getSlotLabel: (key: SlotKey) => string;
  selectedSlot: ArkHostAccelerateSlot;
}) {
  return (
    <YStack gap="$1" py="$1" items="center">
      <XStack gap="$1.5">
        {ACCELERATE_SLOT_OPTIONS.slice(0, 3).map((slot) => {
          const isSelected = selectedSlot === slot.value;
          return (
            <YStack
              key={slot.key}
              width={42}
              height={22}
              borderWidth={1}
              borderColor={isSelected ? '$appAccent' : '$appBorder'}
              bg={isSelected ? '$appAccent' : '$appSurfaceRaised'}
              items="center"
              justify="center"
            >
              <MonoText size="$1" color={isSelected ? '$appBackground' : '$appMuted'}>
                {getSlotLabel(slot.key).slice(-1)}
              </MonoText>
            </YStack>
          );
        })}
      </XStack>

      <XStack gap="$1.5" ml={-16}>
        {ACCELERATE_SLOT_OPTIONS.slice(3, 6).map((slot) => {
          const isSelected = selectedSlot === slot.value;
          return (
            <YStack
              key={slot.key}
              width={42}
              height={22}
              borderWidth={1}
              borderColor={isSelected ? '$appAccent' : '$appBorder'}
              bg={isSelected ? '$appAccent' : '$appSurfaceRaised'}
              items="center"
              justify="center"
            >
              <MonoText size="$1" color={isSelected ? '$appBackground' : '$appMuted'}>
                {getSlotLabel(slot.key).slice(-1)}
              </MonoText>
            </YStack>
          );
        })}
      </XStack>

      <XStack gap="$1.5">
        {ACCELERATE_SLOT_OPTIONS.slice(6, 9).map((slot) => {
          const isSelected = selectedSlot === slot.value;
          return (
            <YStack
              key={slot.key}
              width={42}
              height={22}
              borderWidth={1}
              borderColor={isSelected ? '$appAccent' : '$appBorder'}
              bg={isSelected ? '$appAccent' : '$appSurfaceRaised'}
              items="center"
              justify="center"
            >
              <MonoText size="$1" color={isSelected ? '$appBackground' : '$appMuted'}>
                {getSlotLabel(slot.key).slice(-1)}
              </MonoText>
            </YStack>
          );
        })}
      </XStack>
    </YStack>
  );
}

export function BaseInteractiveSelector({
  draftSlot,
  getSlotLabel,
  onSelectSlot,
}: {
  draftSlot: ArkHostAccelerateSlot;
  getSlotLabel: (key: SlotKey) => string;
  onSelectSlot: (value: ArkHostAccelerateSlot) => void;
}) {
  return (
    <RadioGroup
      value={draftSlot}
      onValueChange={(value) => {
        const option = ACCELERATE_SLOT_OPTIONS.find(
          (candidate) => candidate.value === value,
        );
        if (option) onSelectSlot(option.value);
      }}
      aria-label="Drone Acceleration Slot"
    >
      <YStack gap="$2.5" items="center" py="$2" width="100%">
        {/* Top Floor */}
        <XStack gap="$2" width="100%" justify="center">
          {ACCELERATE_SLOT_OPTIONS.slice(0, 3).map((option) => {
            const selected = draftSlot === option.value;
            return (
              <RadioGroup.Item
                key={option.value}
                value={option.value}
                id={`hosting-config-slot-${option.key}`}
                asChild
                unstyled
              >
                <Button
                  testID={`hosting-config-slot-${option.key}`}
                  unstyled
                  minW={94}
                  py="$2.5"
                  px="$3"
                  borderWidth={1}
                  borderColor={selected ? '$appAccent' : '$appBorder'}
                  bg={selected ? '$appAccentSoft' : '$appSurfaceRaised'}
                  hoverStyle={{ borderColor: '$appAccentBorder' }}
                  pressStyle={{ opacity: 0.8 }}
                  items="center"
                  justify="center"
                >
                  <TerminalText
                    size="$2.5"
                    color={selected ? '$appAccent' : '$appText'}
                    fontWeight={selected ? '800' : '500'}
                  >
                    {getSlotLabel(option.key)}
                  </TerminalText>
                </Button>
              </RadioGroup.Item>
            );
          })}
        </XStack>

        {/* Middle Floor */}
        <XStack gap="$2" width="100%" justify="center" ml={-24}>
          {ACCELERATE_SLOT_OPTIONS.slice(3, 6).map((option) => {
            const selected = draftSlot === option.value;
            return (
              <RadioGroup.Item
                key={option.value}
                value={option.value}
                id={`hosting-config-slot-${option.key}`}
                asChild
                unstyled
              >
                <Button
                  testID={`hosting-config-slot-${option.key}`}
                  unstyled
                  minW={94}
                  py="$2.5"
                  px="$3"
                  borderWidth={1}
                  borderColor={selected ? '$appAccent' : '$appBorder'}
                  bg={selected ? '$appAccentSoft' : '$appSurfaceRaised'}
                  hoverStyle={{ borderColor: '$appAccentBorder' }}
                  pressStyle={{ opacity: 0.8 }}
                  items="center"
                  justify="center"
                >
                  <TerminalText
                    size="$2.5"
                    color={selected ? '$appAccent' : '$appText'}
                    fontWeight={selected ? '800' : '500'}
                  >
                    {getSlotLabel(option.key)}
                  </TerminalText>
                </Button>
              </RadioGroup.Item>
            );
          })}
        </XStack>

        {/* Bottom Floor */}
        <XStack gap="$2" width="100%" justify="center">
          {ACCELERATE_SLOT_OPTIONS.slice(6, 9).map((option) => {
            const selected = draftSlot === option.value;
            return (
              <RadioGroup.Item
                key={option.value}
                value={option.value}
                id={`hosting-config-slot-${option.key}`}
                asChild
                unstyled
              >
                <Button
                  testID={`hosting-config-slot-${option.key}`}
                  unstyled
                  minW={94}
                  py="$2.5"
                  px="$3"
                  borderWidth={1}
                  borderColor={selected ? '$appAccent' : '$appBorder'}
                  bg={selected ? '$appAccentSoft' : '$appSurfaceRaised'}
                  hoverStyle={{ borderColor: '$appAccentBorder' }}
                  pressStyle={{ opacity: 0.8 }}
                  items="center"
                  justify="center"
                >
                  <TerminalText
                    size="$2.5"
                    color={selected ? '$appAccent' : '$appText'}
                    fontWeight={selected ? '800' : '500'}
                  >
                    {getSlotLabel(option.key)}
                  </TerminalText>
                </Button>
              </RadioGroup.Item>
            );
          })}
        </XStack>
      </YStack>
    </RadioGroup>
  );
}
