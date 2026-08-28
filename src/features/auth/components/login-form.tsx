import { ArrowLeft, ArrowRight, Check, LockKeyhole, Mail } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type MutationStatus } from '@tanstack/react-query';
import { useReducedMotion } from 'react-native-reanimated';
import { AnimatePresence, Button, Form, Spinner, YStack, getTokens, styled, useMedia } from 'tamagui';

import { Frame, MonoText, TerminalPasswordVisibilityButton, TerminalSectionHeading, TerminalText, TerminalTextField } from '@/components';
import type { TerminalTextFieldHandle } from '@/components';
import type { LoginSubmission, PasswordRecoveryRequestInput } from '@/schemas/auth';

type AuthFormMode = 'login' | 'forgot';
type InvalidLoginField = 'identifier' | 'password' | null;

const TerminalActionButton = styled(Button, {
  name: 'TerminalActionButton',
  unstyled: true,
  minH: '$4.5',
  px: '$2',
  flexDirection: 'row',
  items: 'center',
  justify: 'center',
  gap: '$2',
  borderWidth: 1,
  borderColor: 'transparent',
  rounded: '$0',
  hoverStyle: { bg: '$appAccentSoft' },
  pressStyle: { bg: '$appAccentSoft', opacity: 0.75 },
  focusVisibleStyle: { borderColor: '$appAccent', bg: '$appAccentSoft' },
});

type LoginFormProps = {
  isSubmitting: boolean;
  isRecoverySubmitting: boolean;
  onSubmit: (submission: LoginSubmission) => Promise<void>;
  onRecoveryRequest: (input: PasswordRecoveryRequestInput) => Promise<void>;
  onResetPasswordRecovery: () => void;
  recoveryStatus: MutationStatus;
  recoverySubmissionError: string | null;
  submissionError: string | null;
};

export function LoginForm({
  isSubmitting,
  isRecoverySubmitting,
  onSubmit,
  onRecoveryRequest,
  onResetPasswordRecovery,
  recoveryStatus,
  recoverySubmissionError,
  submissionError,
}: LoginFormProps) {
  const { t } = useTranslation('auth');
  const { t: tCommon } = useTranslation('common');
  const colors = getTokens().color;
  const media = useMedia();
  const reducedMotion = useReducedMotion();
  const identifierRef = useRef<TerminalTextFieldHandle>(null);
  const passwordRef = useRef<TerminalTextFieldHandle>(null);
  const resetRef = useRef<TerminalTextFieldHandle>(null);
  const submittingRef = useRef(false);
  const recoverySubmittingRef = useRef(false);
  const [mode, setMode] = useState<AuthFormMode>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [invalidLoginField, setInvalidLoginField] = useState<InvalidLoginField>(null);
  const [unexpectedSubmissionError, setUnexpectedSubmissionError] = useState<string | null>(null);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [isRecoveryIdentifierMissing, setIsRecoveryIdentifierMissing] = useState(false);

  const submitLogin = async () => {
    if (isSubmitting || submittingRef.current) return;
    if (!identifier.trim()) {
      setInvalidLoginField('identifier');
      identifierRef.current?.focus();
      return;
    }
    if (!password.trim()) {
      setInvalidLoginField('password');
      passwordRef.current?.focus();
      return;
    }

    setInvalidLoginField(null);
    setUnexpectedSubmissionError(null);
    submittingRef.current = true;
    try {
      await onSubmit({
        credentials: { identifier: identifier.trim(), password },
      });
    } finally {
      submittingRef.current = false;
    }
  };

  const handleLoginSubmit = () => {
    submitLogin().catch(() => {
      setUnexpectedSubmissionError(t('login.unexpectedError'));
    });
  };

  const submitRecoveryRequest = () => {
    if (isRecoverySubmitting || recoverySubmittingRef.current) return;
    const identifier = recoveryIdentifier.trim();
    if (!identifier) {
      setIsRecoveryIdentifierMissing(true);
      resetRef.current?.focus();
      return;
    }
    setIsRecoveryIdentifierMissing(false);
    setRecoveryIdentifier(identifier);
    recoverySubmittingRef.current = true;
    onRecoveryRequest({ identifier }).finally(() => {
      recoverySubmittingRef.current = false;
    }).catch(() => undefined);
  };

  return (
    <AnimatePresence mode="wait">
      {mode === 'login' ? (
        <YStack key="login" transition={reducedMotion ? '0ms' : '400ms'} enterStyle={reducedMotion ? null : { opacity: 0, x: -24 }} exitStyle={reducedMotion ? null : { opacity: 0, x: -24 }} opacity={1} x={0} gap="$3">
          <Form onSubmit={handleLoginSubmit}>
            <Frame cornerBrackets p="$4.5" gap="$4">
              <TerminalSectionHeading code="01" title={t('login.title')} {...(media.large ? { subtitle: 'AUTH' } : {})} />
              <TerminalTextField
                ref={identifierRef}
                icon={Mail}
                label={t('login.credentialLabel')}
                value={identifier}
                onChangeText={(value) => {
                  setIdentifier(value);
                  setUnexpectedSubmissionError(null);
                  if (invalidLoginField === 'identifier') setInvalidLoginField(null);
                }}
                placeholder="doctor"
                autoComplete="username"
                enterKeyHint="next"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
                {...(invalidLoginField === 'identifier' ? { error: t('login.credentialRequired') } : {})}
              />
              <TerminalTextField
                ref={passwordRef}
                icon={LockKeyhole}
                label={t('login.passwordLabel')}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setUnexpectedSubmissionError(null);
                  if (invalidLoginField === 'password') setInvalidLoginField(null);
                }}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                enterKeyHint="go"
                returnKeyType="go"
                submitBehavior="blurAndSubmit"
                onSubmitEditing={handleLoginSubmit}
                {...(invalidLoginField === 'password' ? { error: t('login.passwordRequired') } : {})}
                trailing={(
                  <TerminalPasswordVisibilityButton
                    hideLabel={tCommon('accessibility.hideAccessKey')}
                    showLabel={tCommon('accessibility.showAccessKey')}
                    isPasswordVisible={showPassword}
                    onPress={() => setShowPassword((value) => !value)}
                  />
                )}
              />
              <TerminalActionButton self="flex-start" onPress={() => { onResetPasswordRecovery(); setMode('forgot'); setIsRecoveryIdentifierMissing(false); }}>
                <MonoText size="$3" color="$appAccent">{t('login.forgotAccessKey')}</MonoText>
              </TerminalActionButton>
              <Form.Trigger asChild>
                <Button height="$4.5" borderWidth={1} borderColor="$appAccent" rounded="$0" bg="$appAccentSoft" hoverStyle={{ bg: '$appAccentSoft', borderColor: '$appAccent' }} pressStyle={{ bg: '$appSurfaceRaised' }} focusVisibleStyle={{ borderColor: '$appText' }} disabledStyle={{ opacity: 0.55 }} disabled={isSubmitting} aria-busy={isSubmitting} {...(isSubmitting ? { icon: <Spinner size="small" color="$appAccent" /> } : {})} $platform-web={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
                  <TerminalText size="$3" color="$appAccent" fontWeight="700">{isSubmitting ? t('login.connecting') : t('login.submit')}</TerminalText>
                  {!isSubmitting ? <ArrowRight size={16} color={colors.appAccent.val} /> : null}
                </Button>
              </Form.Trigger>
              {unexpectedSubmissionError || submissionError ? (
                <MonoText size="$2.5" color="$appWarning" accessibilityLiveRegion="polite">
                  {unexpectedSubmissionError ?? submissionError}
                </MonoText>
              ) : null}
            </Frame>
          </Form>
          <MonoText size="$2.5" text="center">{t('login.unregistered')}</MonoText>
        </YStack>
      ) : (
        <YStack key="forgot" transition={reducedMotion ? '0ms' : '400ms'} enterStyle={reducedMotion ? null : { opacity: 0, x: 24 }} exitStyle={reducedMotion ? null : { opacity: 0, x: 24 }} opacity={1} x={0}>
          <Form onSubmit={submitRecoveryRequest}>
            <Frame cornerBrackets p="$4.5" gap="$4">
              <TerminalSectionHeading code="SOS" title={t('recovery.title')} {...(media.large ? { subtitle: 'RECOVERY' } : {})} />
              <AnimatePresence mode="wait">
                {recoveryStatus === 'success' ? (
                  <YStack key="reset-sent" transition={reducedMotion ? '0ms' : '300ms'} enterStyle={reducedMotion ? null : { opacity: 0, scale: 0.96 }} exitStyle={reducedMotion ? null : { opacity: 0 }} opacity={1} scale={1} items="center" gap="$2" py="$3">
                    <Check size={36} color={colors.appSuccess.val} />
                    <TerminalText size="$4" fontWeight="700">{t('recovery.sentTitle')}</TerminalText>
                    <MonoText size="$2.5" text="center" lineHeight="$3">
                      {t('recovery.sentDescription', { destination: recoveryIdentifier || t('recovery.fallbackChannel') })}
                    </MonoText>
                  </YStack>
                ) : (
                  <YStack key="reset-form" transition={reducedMotion ? '0ms' : '300ms'} enterStyle={reducedMotion ? null : { opacity: 0 }} exitStyle={reducedMotion ? null : { opacity: 0 }} opacity={1} gap="$4">
                    <MonoText size="$2.5" lineHeight="$3">{t('recovery.description')}</MonoText>
                    <TerminalTextField
                      ref={resetRef}
                      icon={Mail}
                      label={t('recovery.identifierLabel')}
                      value={recoveryIdentifier}
                      onChangeText={(value) => { setRecoveryIdentifier(value); setIsRecoveryIdentifierMissing(false); }}
                      placeholder="doctor@rhodes.is"
                      autoComplete="email"
                      keyboardType="email-address"
                      enterKeyHint="send"
                      returnKeyType="send"
                      submitBehavior="blurAndSubmit"
                      onSubmitEditing={submitRecoveryRequest}
                      {...(isRecoveryIdentifierMissing ? { error: t('recovery.identifierRequired') } : {})}
                    />
                    <Form.Trigger asChild>
                      <Button height="$4.5" borderWidth={1} borderColor="$appWarning" rounded="$1" bg="$appWarningSoft" hoverStyle={{ borderColor: '$appWarning', bg: '$appWarningSoft' }} pressStyle={{ bg: '$appSurfaceRaised' }} focusVisibleStyle={{ borderColor: '$appText' }} disabled={isRecoverySubmitting} disabledStyle={{ opacity: 0.55 }} aria-busy={isRecoverySubmitting} {...(isRecoverySubmitting ? { icon: <Spinner size="small" color="$appWarning" /> } : {})}>
                        <TerminalText size="$3" color="$appWarning" fontWeight="700">{isRecoverySubmitting ? t('recovery.sending') : t('recovery.send')}</TerminalText>
                        {!isRecoverySubmitting ? <ArrowRight size={16} color={colors.appWarning.val} /> : null}
                      </Button>
                    </Form.Trigger>
                    {recoverySubmissionError ? (
                      <MonoText size="$2.5" color="$appWarning" accessibilityLiveRegion="polite">
                        {recoverySubmissionError}
                      </MonoText>
                    ) : null}
                  </YStack>
                )}
              </AnimatePresence>
              <TerminalActionButton self="flex-start" onPress={() => { onResetPasswordRecovery(); setMode('login'); setInvalidLoginField(null); }}>
                <ArrowLeft size={16} color={colors.appAccent.val} />
                <MonoText size="$3" color="$appAccent">{t('recovery.backToLogin')}</MonoText>
              </TerminalActionButton>
            </Frame>
          </Form>
        </YStack>
      )}
    </AnimatePresence>
  );
}
