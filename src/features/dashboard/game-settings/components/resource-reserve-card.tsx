import { ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { XStack, getTokens } from 'tamagui';

import { Frame, MonoText, TerminalText } from '@/components';

export type ResourceReserveCardProps = {
  description: string;
  icon: LucideIcon;
  onPress: () => void;
  testID: string;
  title: string;
  unit: string;
  value: number;
};

export function ResourceReserveCard({
  description,
  icon: Icon,
  onPress,
  testID,
  title,
  unit,
  value,
}: ResourceReserveCardProps) {
  const colors = getTokens().color;

  return (
    <Frame
      testID={testID}
      aria-label={`${title}: ${value} ${unit}`}
      role="button"
      cursor="pointer"
      p="$3.5"
      gap="$2.5"
      minH="$7"
      hoverStyle={{
        bg: '$appSurfaceStrong',
        borderColor: '$appAccentBorder',
      }}
      pressStyle={{ opacity: 0.8 }}
      onPress={onPress}
    >
      <XStack items="center" justify="space-between" gap="$3" minW={0}>
        <XStack items="center" gap="$2" minW={0} shrink={1}>
          <Icon size={17} color={colors.appMuted.val} />
          <TerminalText size="$3" fontWeight="700" numberOfLines={2}>
            {title}
          </TerminalText>
        </XStack>

        <XStack items="center" gap="$2" shrink={0}>
          <XStack items="baseline" gap="$1">
            <TerminalText
              testID={`${testID}-value`}
              size="$5"
              fontWeight="800"
              color="$appAccent"
              fontVariant={['tabular-nums']}
            >
              {value}
            </TerminalText>
            <MonoText size="$1" color="$appMuted">
              {unit}
            </MonoText>
          </XStack>
          <ChevronRight size={14} color={colors.appAccent.val} />
        </XStack>
      </XStack>

      <MonoText size="$2" color="$appMuted" numberOfLines={2}>
        {description}
      </MonoText>
    </Frame>
  );
}
