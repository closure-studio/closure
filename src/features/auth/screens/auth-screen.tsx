import { useReducedMotion } from 'react-native-reanimated';
import { KeyboardAvoidingView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, XStack, YStack, getTokens } from 'tamagui';

import { DecorativeBarcode, FlickeringStatusIndicator, MonoText } from '@/components';
import type { LoginCredentials } from '@/schemas/auth';
import { AccessOrbit } from '../components/access-orbit';
import { LoginForm } from '../components/login-form';
import { TerminalBrand } from '../components/terminal-brand';

const MOCK_AUTHENTICATION_DELAY_MS = 1_100;
const ACCESS_ORBIT_NODE_ID = '07';

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (credentials: LoginCredentials) => void }) {
  const { t } = useTranslation('auth');
  const colors = getTokens().color;
  const reducedMotion = useReducedMotion();
  const handleAuthentication = async (credentials: LoginCredentials) => {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        onAuthenticated(credentials);
        resolve();
      }, MOCK_AUTHENTICATION_DELAY_MS);
    });
  };

  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <YStack grow={1} minH={0}>
        <ScrollView grow={1} keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={{ grow: 1 }}>
          <YStack width="100%" maxW={1120} minH="100%" grow={1} self="center" px="$4" pt="$3.5" pb="$2.5" $md={{ px: '$6', pt: '$5', pb: '$4' }}>
            <XStack grow={1} items="center" justify="center" flexDirection="column" px="$2" py="$3" gap="$4" $height-md={{ py: '$5', gap: '$6' }} $md={{ flexDirection: 'row', gap: '$9', px: '$5' }} $lg={{ gap: '$12' }}>
              <YStack position="relative" width="100%" maxW={420} transition={reducedMotion ? '0ms' : '500ms'} enterStyle={reducedMotion ? null : { opacity: 0, y: 18 }} opacity={1} y={0} gap="$3" $md={{ grow: 1 }}>
                <AccessOrbit label={t('hero.orbitLabel')} nodeId={ACCESS_ORBIT_NODE_ID} />
                <TerminalBrand />
                <MonoText display="none" size="$2" lineHeight="$4" $md={{ display: 'flex' }}>{t('meta.description')}</MonoText>
                <DecorativeBarcode />
                <YStack display="none" gap="$2" pt="$2" $md={{ display: 'flex' }}>
                  <XStack items="center" gap="$2"><FlickeringStatusIndicator color={colors.appSuccess.val} /><MonoText size="$1">{t('meta.secureChannel')}</MonoText></XStack>
                  <XStack items="center" gap="$2"><YStack width={6} height={6} rounded="$10" bg="$appAccent" /><MonoText size="$1">{t('meta.syncReady')}</MonoText></XStack>
                </YStack>
              </YStack>

              <YStack width="100%" maxW={440} $md={{ grow: 1 }}>
                <LoginForm onSubmit={handleAuthentication} />
              </YStack>
            </XStack>

            <XStack flexDirection="column" items="center" gap="$1" pt="$3" borderTopWidth={1} borderColor="$appBorder" $max-xxs={{ mx: '$-2' }} $sm={{ mx: '$0', flexDirection: 'row', justify: 'space-between', items: 'center' }}>
              <MonoText size="$1" shrink={1} self="stretch" text="center" $sm={{ self: 'auto', text: 'left' }}>{t('meta.footer')}</MonoText>
              <MonoText size="$1" color="$appAccent" shrink={1} self="stretch" text="center" $sm={{ self: 'auto', text: 'right' }}>{t('meta.syncReady')}</MonoText>
            </XStack>
          </YStack>
        </ScrollView>
      </YStack>
    </KeyboardAvoidingView>
  );
}
