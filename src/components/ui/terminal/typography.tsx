import { SizableText, styled } from 'tamagui';

export const TerminalText = styled(SizableText, {
  name: 'TerminalText',
  color: '$appText',
  fontFamily: '$heading',
  letterSpacing: 0,
});

export const MonoText = styled(SizableText, {
  name: 'MonoText',
  color: '$appMuted',
  fontFamily: '$mono',
  letterSpacing: 1,
});
