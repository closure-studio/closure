import {
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
} from 'lucide-react-native';
import { XStack, getTokens, styled } from 'tamagui';

import { MonoText } from './typography';

export type TerminalNoticeTone = 'danger' | 'info' | 'success' | 'warning';

export type TerminalNoticeProps = {
  children: string;
  tone?: TerminalNoticeTone;
};

const TerminalNoticeFrame = styled(XStack, {
  name: 'TerminalNotice',
  minH: '$4',
  px: '$3',
  py: '$2',
  items: 'center',
  gap: '$2',
  borderLeftWidth: 2,

  variants: {
    tone: {
      danger: {
        borderColor: '$appDanger',
        bg: '$appDangerSoft',
      },
      info: {
        borderColor: '$appAccent',
        bg: '$appAccentSoft',
      },
      success: {
        borderColor: '$appSuccess',
        bg: '$appSuccessSoft',
      },
      warning: {
        borderColor: '$appWarning',
        bg: '$appWarningSoft',
      },
    },
  } as const,

  defaultVariants: {
    tone: 'warning',
  },
});

export function TerminalNotice({
  children,
  tone = 'warning',
}: TerminalNoticeProps) {
  const colors = getTokens().color;
  const tonePresentation = {
    danger: {
      color: '$appDanger' as const,
      icon: CircleX,
      iconColor: colors.appDanger.val,
    },
    info: {
      color: '$appAccent' as const,
      icon: Info,
      iconColor: colors.appAccent.val,
    },
    success: {
      color: '$appSuccess' as const,
      icon: CircleCheck,
      iconColor: colors.appSuccess.val,
    },
    warning: {
      color: '$appWarning' as const,
      icon: TriangleAlert,
      iconColor: colors.appWarning.val,
    },
  }[tone];
  const NoticeIcon = tonePresentation.icon;

  return (
    <TerminalNoticeFrame tone={tone} role={tone === 'danger' ? 'alert' : 'status'} aria-live="polite">
      <NoticeIcon size={14} color={tonePresentation.iconColor} strokeWidth={1.7} />
      <MonoText
        size="$1"
        flex={1}
        lineHeight="$2"
        color={tonePresentation.color}
        select="text"
      >
        {children}
      </MonoText>
    </TerminalNoticeFrame>
  );
}
