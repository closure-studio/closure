import type { LucideIcon } from 'lucide-react-native';
import type { PropsWithChildren } from 'react';
import { ChevronRight } from 'lucide-react-native';
import { XStack, getTokens } from 'tamagui';

import { Frame, MonoText, TerminalText } from '@/components';

export type BadgeTone = 'cyan' | 'success' | 'warning' | 'danger' | 'default';

const BADGE_COLOR_MAP = {
  cyan: { bg: '$appAccentSoft' as const, border: '$appAccentBorder' as const, color: '$appAccent' as const },
  danger: { bg: '$appDangerSoft' as const, border: '$appDangerBorder' as const, color: '$appDanger' as const },
  default: { bg: '$appSurfaceRaised' as const, border: '$appBorder' as const, color: '$appMuted' as const },
  success: { bg: '$appSuccessSoft' as const, border: '$appSuccess' as const, color: '$appSuccess' as const },
  warning: { bg: '$appWarningSoft' as const, border: '$appWarningBorder' as const, color: '$appWarning' as const },
} as const;

export type ConfigSummaryCardProps = PropsWithChildren<{
  actionLabel?: string;
  active?: boolean;
  badge?: string;
  badgeTone?: BadgeTone;
  description?: string;
  disabled?: boolean;
  icon?: LucideIcon;
  onPress?: () => void;
  testID: string;
  title: string;
  value?: string;
}>;

export function ConfigSummaryCard({
  actionLabel,
  active = false,
  badge,
  badgeTone = 'default',
  children,
  description,
  disabled = false,
  icon: Icon,
  onPress,
  testID,
  title,
  value,
}: ConfigSummaryCardProps) {
  const colors = getTokens().color;
  const badgeStyle = BADGE_COLOR_MAP[badgeTone];

  const interactiveProps = disabled
    ? {}
    : {
        cursor: 'pointer' as const,
        hoverStyle: {
          bg: '$appSurfaceStrong' as const,
          borderColor: '$appAccentBorder' as const,
        },
        onPress,
        pressStyle: { opacity: 0.8 },
        role: 'button' as const,
      };

  return (
    <Frame
      testID={testID}
      selected={active}
      p="$3.5"
      gap="$2.5"
      tone={active ? 'cyan' : 'default'}
      opacity={disabled ? 0.65 : 1}
      {...interactiveProps}
    >
      <XStack items="center" justify="space-between" gap="$2">
        <XStack items="center" gap="$2" minW={0} shrink={1}>
          {Icon ? (
            <Icon
              size={16}
              color={active ? colors.appAccent.val : colors.appMuted.val}
            />
          ) : null}
          <TerminalText size="$3" fontWeight="700" numberOfLines={1}>
            {title}
          </TerminalText>
        </XStack>
        {badge ? (
          <XStack
            px="$2"
            py="$0.5"
            borderWidth={1}
            borderColor={badgeStyle.border}
            bg={badgeStyle.bg}
            items="center"
          >
            <MonoText size="$1" color={badgeStyle.color} fontWeight="700">
              {badge}
            </MonoText>
          </XStack>
        ) : null}
      </XStack>

      {value ? (
        <TerminalText size="$6" fontWeight="800" color={active ? '$appAccent' : '$appText'}>
          {value}
        </TerminalText>
      ) : null}

      {children}

      {description ? (
        <MonoText size="$2" color="$appMuted" numberOfLines={2}>
          {description}
        </MonoText>
      ) : null}

      {!disabled && actionLabel ? (
        <XStack items="center" justify="flex-end" gap="$1" mt="$1">
          <MonoText size="$2" color="$appAccent">
            {actionLabel}
          </MonoText>
          <ChevronRight size={12} color={colors.appAccent.val} />
        </XStack>
      ) : null}
    </Frame>
  );
}
