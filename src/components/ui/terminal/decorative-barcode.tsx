import { XStack, YStack } from 'tamagui';

export function DecorativeBarcode() {
  return (
    <XStack height={16} gap={2} opacity={0.6} items="stretch">
      {'1213112131121132131211231'.split('').map((barWidth, index) => (
        <YStack key={index} width={Number(barWidth)} bg="$terminalText" />
      ))}
    </XStack>
  );
}
