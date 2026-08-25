import { Button, RadioGroup, XStack, YStack } from 'tamagui';

import { MonoText, TerminalText } from '@/components';

export const ACCELERATE_SLOT_OPTIONS = [
  { key: 'topLeft', label: '顶层左', value: '顶层左' },
  { key: 'topCenter', label: '顶层中', value: '顶层中' },
  { key: 'topRight', label: '顶层右', value: '顶层右' },
  { key: 'middleLeft', label: '中层左', value: '中层左' },
  { key: 'middleCenter', label: '中层中', value: '中层中' },
  { key: 'middleRight', label: '中层右', value: '中层右' },
  { key: 'bottomLeft', label: '底层左', value: '底层左' },
  { key: 'bottomCenter', label: '底层中', value: '底层中' },
  { key: 'bottomRight', label: '底层右', value: '底层右' },
] as const;

export type SlotKey = (typeof ACCELERATE_SLOT_OPTIONS)[number]['key'];

export function BaseMiniGrid({
  selectedSlot,
}: {
  selectedSlot: string;
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
                {slot.label.slice(-1)}
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
                {slot.label.slice(-1)}
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
                {slot.label.slice(-1)}
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
  draftSlot: string;
  getSlotLabel: (key: SlotKey) => string;
  onSelectSlot: (value: string) => void;
}) {
  return (
    <RadioGroup
      value={draftSlot}
      onValueChange={onSelectSlot}
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
