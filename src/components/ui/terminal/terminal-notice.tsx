import {
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { XStack, getTokens, styled } from 'tamagui';

import { MonoText } from './typography';

export type TerminalNoticeTone = 'danger' | 'info' | 'success' | 'warning';

export type TerminalNoticeProps = {
  children: string;
  icon?: LucideIcon;
  tone?: TerminalNoticeTone;
};

const TerminalNoticeFrame = styled(XStack, {
  name: 'TerminalNotice',
  minH: '$4',
  px: '$3',
  items: 'center',
  gap: '$2',
  borderLeftWidth: 2,

  variants: {
    tone: {
      danger: {
        borderColor: '$terminalDanger',
        bg: '$terminalDangerSoft',
      },
      info: {
        borderColor: '$terminalCyan',
        bg: '$terminalCyanSoft',
      },
      success: {
        borderColor: '$terminalSuccess',
        bg: '$terminalSuccessSoft',
      },
      warning: {
        borderColor: '$terminalWarning',
        bg: '$terminalWarningSoft',
      },
    },
  } as const,

  defaultVariants: {
    tone: 'warning',
  },
});

export function TerminalNotice({
  children,
  icon,
  tone = 'warning',
}: TerminalNoticeProps) {
  const colors = getTokens().color;
  const tonePresentation = {
    danger: {
      color: '$terminalDanger' as const,
      icon: CircleX,
      iconColor: colors.terminalDanger.val,
    },
    info: {
      color: '$terminalCyan' as const,
      icon: Info,
      iconColor: colors.terminalCyan.val,
    },
    success: {
      color: '$terminalSuccess' as const,
      icon: CircleCheck,
      iconColor: colors.terminalSuccess.val,
    },
    warning: {
      color: '$terminalWarning' as const,
      icon: TriangleAlert,
      iconColor: colors.terminalWarning.val,
    },
  }[tone];
  const NoticeIcon = icon ?? tonePresentation.icon;

  return (
    <TerminalNoticeFrame tone={tone}>
      <NoticeIcon size={14} color={tonePresentation.iconColor} strokeWidth={1.7} />
      <MonoText size="$1" color={tonePresentation.color} selectable>
        {children}
      </MonoText>
    </TerminalNoticeFrame>
  );
}
