import { useTranslation } from 'react-i18next';
import { Spinner, YStack } from 'tamagui';
import { Link, Redirect } from 'expo-router';
import { Frame, MonoText, TerminalNotice, TerminalText } from '@/components';
import { ROUTES } from '@/constants/routes';
import { useLinuxDoCallback } from '../use-auth-entry';
import { AuthButton } from '../components/auth-button';

export function LinuxDoCallbackScreen() {
  const { t } = useTranslation('auth');
  const callback = useLinuxDoCallback();
  if (callback.destination) return <Redirect href={callback.destination} />;
  return (
    <YStack flex={1} justify="center" items="center" p="$4.5">
      <Frame cornerBrackets width="100%" maxW={460} p="$5" gap="$4">
        <TerminalText size="$5" fontWeight="700">{t('oauth.callbackTitle')}</TerminalText>
        {callback.error ? <TerminalNotice tone="danger">{callback.error}</TerminalNotice> : (
          <YStack gap="$3"><Spinner color="$appAccent" /><MonoText size="$2.5">{t('oauth.callbackDescription')}</MonoText></YStack>
        )}
        <Link href={ROUTES.login} replace asChild><AuthButton tone="secondary">{t('oauth.back')}</AuthButton></Link>
      </Frame>
    </YStack>
  );
}
