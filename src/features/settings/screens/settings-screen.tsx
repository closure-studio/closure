import { ArrowLeft, SlidersHorizontal } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Button, ScrollView, XStack, YStack, getTokens } from 'tamagui';

import { DecorativeBarcode, MonoText, TerminalSectionHeading, TerminalText } from '@/components';

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation('settings');
  const colors = getTokens().color;

  return (
    <YStack grow={1} minH={0} overflow="hidden">
      <XStack
        minH="$5"
        px="$3.5"
        py="$2.5"
        items="center"
        gap="$3"
        borderBottomWidth={1}
        borderColor="$terminalBorder"
        bg="$terminalSurface"
        $md={{ px: '$5' }}
      >
        <Button
          unstyled
          minW="$4"
          minH="$4"
          px="$2"
          flexDirection="row"
          items="center"
          justify="center"
          gap="$2"
          borderWidth={1}
          borderColor="$terminalBorder"
          hoverStyle={{ borderColor: '$terminalCyanBorder', bg: '$terminalCyanSoft' }}
          pressStyle={{ opacity: 0.7 }}
          aria-label={t('backToDashboard')}
          onPress={onBack}
        >
          <ArrowLeft size={16} color={colors.terminalCyan.val} />
          <MonoText display="none" size="$2" color="$terminalCyan" $sm={{ display: 'flex' }}>
            {t('back')}
          </MonoText>
        </Button>
        <YStack minW={0} grow={1}>
          <TerminalText size="$4" fontWeight="700" numberOfLines={1}>{t('title')}</TerminalText>
          <MonoText size="$1" color="$terminalCyan" numberOfLines={1}>{t('routeCode')}</MonoText>
        </YStack>
        <SlidersHorizontal size={18} color={colors.terminalMuted.val} />
      </XStack>

      <ScrollView
        grow={1}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ grow: 1 }}
      >
        <YStack width="100%" maxW={960} minH="100%" grow={1} self="center" p="$3.5" gap="$4" $md={{ p: '$5' }}>
          <TerminalSectionHeading code="SYS.01" title={t('title')} />
          <YStack height={1} bg="$terminalBorder" />
          <YStack grow={1} minH={160} />
          <DecorativeBarcode />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
