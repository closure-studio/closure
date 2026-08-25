import { ArrowLeft } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, YStack, getTokens } from 'tamagui';

import { MonoText, TerminalText } from '../ui/terminal';
import { Frame } from '../ui/frame';

export function NotFoundView() {
  const { t } = useTranslation('common');
  const colors = getTokens().color;

  return (
    <YStack grow={1} items="center" justify="center" bg="$appBackground" p="$4">
      <Frame cornerBrackets width="100%" maxW={520} p="$5" gap="$4">
        <MonoText size="$1" color="$appWarning">{t('notFound.eyebrow')}</MonoText>
        <YStack gap="$1">
          <TerminalText size="$10" fontWeight="900" color="$appAccent">404</TerminalText>
          <TerminalText size="$5" fontWeight="700">{t('notFound.title')}</TerminalText>
          <MonoText size="$2">{t('notFound.description')}</MonoText>
        </YStack>
        <Link href="/" asChild>
          <Button
            height="$4.5"
            rounded="$0"
            borderWidth={1}
            borderColor="$appAccentBorder"
            bg="$appAccentSoft"
            icon={<ArrowLeft size={16} color={colors.appAccent.val} />}
          >
            <MonoText size="$2" color="$appAccent">{t('notFound.returnHome')}</MonoText>
          </Button>
        </Link>
      </Frame>
    </YStack>
  );
}
