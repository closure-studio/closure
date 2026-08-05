import { XStack, YStack } from 'tamagui';

import { MonoText, TerminalText } from '../ui/terminal/typography';

export function SectionPageHeader({
  code,
  description,
  eyebrow,
  status,
  title,
}: {
  code: string;
  description: string;
  eyebrow: string;
  status: string;
  title: string;
}) {
  return (
    <YStack gap="$4" py="$2" $md={{ py: '$4' }}>
      <XStack items="center" justify="space-between" gap="$3">
        <XStack items="center" gap="$2">
          <YStack width={7} height={7} rounded="$10" bg="$appAccent" />
          <MonoText size="$1" color="$appAccent">{eyebrow}</MonoText>
        </XStack>
        <MonoText size="$1">{code}</MonoText>
      </XStack>
      <YStack gap="$3" $lg={{ flexDirection: 'row', items: 'flex-end', justify: 'space-between' }}>
        <TerminalText size="$9" lineHeight="$9" fontWeight="800" letterSpacing={-1.5} textTransform="uppercase" maxW={760} $md={{ size: '$10', lineHeight: '$10' }}>
          {title}
        </TerminalText>
        <YStack gap="$2" maxW={360} pb="$1">
          <MonoText size="$2" color="$appText">{description}</MonoText>
          <XStack items="center" gap="$2">
            <YStack grow={1} height={1} bg="$appAccentBorder" />
            <MonoText size="$1" color="$appAccent">{status}</MonoText>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
