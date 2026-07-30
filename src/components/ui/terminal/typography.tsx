import { SizableText, styled } from 'tamagui';

export const TerminalText = styled(SizableText, {
  name: 'TerminalText',
  color: '$terminalText',
  fontFamily: '$heading',
  letterSpacing: 0,
});

export const MonoText = styled(SizableText, {
  name: 'MonoText',
  color: '$terminalMuted',
  fontFamily: '$mono',
  letterSpacing: 1,
});
