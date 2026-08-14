import { type MutationStatus } from '@tanstack/react-query';
import { useReducedMotion } from 'react-native-reanimated';
import { KeyboardAvoidingView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, XStack, YStack, getTokens } from 'tamagui';

import { DecorativeBarcode, FlickeringStatusIndicator, MonoText } from '@/components';
import type { AuthFailure } from '../api';
import type { LoginSubmission, PasswordRecoveryRequestInput } from '@/schemas/auth';
import { AccessOrbit } from '../components/access-orbit';
import { LoginForm } from '../components/login-form';
import { TerminalBrand } from '../components/terminal-brand';

const ACCESS_ORBIT_NODE_ID = '07';

type AuthScreenProps = {
  isSubmitting: boolean;
  loginError: AuthFailure | null;
  onLogin: (submission: LoginSubmission) => Promise<void>;
  onPasswordRecovery: (input: PasswordRecoveryRequestInput) => Promise<void>;
  onResetPasswordRecovery: () => void;
  passwordRecoveryError: AuthFailure | null;
  passwordRecoveryStatus: MutationStatus;
};

function loginFailureMessage(error: AuthFailure | null, translate: (key: string) => string): string | null {
  if (!error) return null;
  switch (error.code) {
    case 'invalid-credentials':
      return translate('login.errors.invalidCredentials');
    case 'account-banned':
      return translate('login.errors.accountBanned');
    case 'rate-limited':
      return translate('login.errors.rateLimited');
    case 'network-unavailable':
    case 'timeout':
      return translate('login.errors.networkUnavailable');
    case 'server-error':
      return translate('login.errors.serverError');
    case 'invalid-response':
      return translate('login.errors.invalidResponse');
    case 'already-bound':
    case 'email-already-registered':
    case 'invalid-input':
    case 'invalid-oauth-code':
    case 'invalid-verification-code':
    case 'permission-denied':
    case 'session-expired':
    case 'unknown-business-error':
    case 'user-not-found':
    case 'verification-code-expired':
      return translate('login.errors.fallback');
  }
  return translate('login.errors.fallback');
}

function recoveryFailureMessage(error: AuthFailure | null, translate: (key: string) => string): string | null {
  if (!error) return null;
  switch (error.code) {
    case 'user-not-found':
      return translate('recovery.errors.userNotFound');
    case 'network-unavailable':
    case 'timeout':
      return translate('recovery.errors.networkUnavailable');
    case 'server-error':
      return translate('recovery.errors.serverError');
    case 'invalid-response':
      return translate('recovery.errors.invalidResponse');
    case 'account-banned':
    case 'already-bound':
    case 'email-already-registered':
    case 'invalid-credentials':
    case 'invalid-input':
    case 'invalid-oauth-code':
    case 'invalid-verification-code':
    case 'permission-denied':
    case 'rate-limited':
    case 'session-expired':
    case 'unknown-business-error':
    case 'verification-code-expired':
      return translate('recovery.errors.fallback');
  }
  return translate('recovery.errors.fallback');
}

export function AuthScreen({
  isSubmitting,
  loginError,
  onLogin,
  onPasswordRecovery,
  onResetPasswordRecovery,
  passwordRecoveryError,
  passwordRecoveryStatus,
}: AuthScreenProps) {
  const { t } = useTranslation('auth');
  const colors = getTokens().color;
  const reducedMotion = useReducedMotion();
  const loginErrorMessage = loginFailureMessage(loginError, t);
  const recoveryErrorMessage = recoveryFailureMessage(passwordRecoveryError, t);

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
                <LoginForm
                  isSubmitting={isSubmitting}
                  isRecoverySubmitting={passwordRecoveryStatus === 'pending'}
                  recoveryStatus={passwordRecoveryStatus}
                  recoverySubmissionError={recoveryErrorMessage}
                  submissionError={loginErrorMessage}
                  onRecoveryRequest={onPasswordRecovery}
                  onResetPasswordRecovery={onResetPasswordRecovery}
                  onSubmit={onLogin}
                />
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
