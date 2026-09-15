import { Button, styled } from 'tamagui';

export const AuthButton = styled(Button, {
  name: 'AuthButton',
  unstyled: true,
  minH: '$4.5',
  px: '$3',
  py: '$2',
  flexDirection: 'row',
  items: 'center',
  justify: 'center',
  gap: '$2',
  rounded: '$0',
  borderWidth: 1,
  fontFamily: '$body',
  fontSize: '$3',
  fontWeight: '600',
  cursor: 'pointer',
  hoverStyle: { bg: '$appAccentSoft' },
  pressStyle: { opacity: 0.75 },
  focusVisibleStyle: { outlineWidth: 2, outlineStyle: 'solid', outlineColor: '$appAccent' },
  disabledStyle: { opacity: 0.5, cursor: 'default' },
  variants: {
    tone: {
      primary: { bg: '$appAccentSoft', borderColor: '$appAccent', color: '$appAccent' },
      secondary: { bg: '$appSurfaceRaised', borderColor: '$appBorder', color: '$appText' },
      link: { bg: 'transparent', borderColor: 'transparent', color: '$appMuted', px: '$1', fontSize: '$2.5' },
    },
  } as const,
  defaultVariants: { tone: 'primary' },
});
