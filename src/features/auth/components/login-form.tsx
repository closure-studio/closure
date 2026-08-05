import { ArrowLeft, ArrowRight, Check, LockKeyhole, Mail, UserRound } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';
import { AnimatePresence, Button, Form, Spinner, XStack, YStack, getTokens, styled, useMedia } from 'tamagui';

import { MonoText, TerminalCheckbox, TerminalPanel, TerminalPasswordVisibilityButton, TerminalSectionHeading, TerminalText, TerminalTextField } from '@/components';
import type { TerminalTextFieldHandle } from '@/components';
import type { LoginCredentials } from '@/schemas/auth';

type AuthFormMode = 'login' | 'forgot';
type InvalidLoginField = 'username' | 'password' | null;

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

export function LoginForm({ onSubmit }: { onSubmit: (credentials: LoginCredentials) => Promise<void> | void }) {
  const { t } = useTranslation('auth');
  const { t: tCommon } = useTranslation('common');
  const colors = getTokens().color;
  const media = useMedia();
  const reducedMotion = useReducedMotion();
  const usernameRef = useRef<TerminalTextFieldHandle>(null);
  const passwordRef = useRef<TerminalTextFieldHandle>(null);
  const resetRef = useRef<TerminalTextFieldHandle>(null);
  const submittingRef = useRef(false);
  const [mode, setMode] = useState<AuthFormMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [invalidLoginField, setInvalidLoginField] = useState<InvalidLoginField>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [isRecoveryIdentifierMissing, setIsRecoveryIdentifierMissing] = useState(false);
  const [isRecoveryRequestSent, setIsRecoveryRequestSent] = useState(false);

  const submitLogin = async () => {
    if (isSubmittingLogin || submittingRef.current) return;
    if (!username.trim()) {
      setInvalidLoginField('username');
      usernameRef.current?.focus();
      return;
    }
    if (!password.trim()) {
      setInvalidLoginField('password');
      passwordRef.current?.focus();
      return;
    }

    setInvalidLoginField(null);
    setSubmissionError(null);
    submittingRef.current = true;
    setIsSubmittingLogin(true);
    try {
      await onSubmit({ username: username.trim(), password, remember: rememberSession });
    } finally {
      submittingRef.current = false;
      setIsSubmittingLogin(false);
    }
  };

  const handleLoginSubmit = () => {
    submitLogin().catch(() => {
      setSubmissionError(t('login.unexpectedError'));
    });
  };

  const submitRecoveryRequest = () => {
    if (!recoveryIdentifier.trim()) {
      setIsRecoveryIdentifierMissing(true);
      resetRef.current?.focus();
      return;
    }
    setIsRecoveryIdentifierMissing(false);
    setIsRecoveryRequestSent(true);
  };

  return (
    <AnimatePresence mode="wait">
      {mode === 'login' ? (
        <YStack key="login" transition={reducedMotion ? '0ms' : '400ms'} enterStyle={reducedMotion ? null : { opacity: 0, x: -24 }} exitStyle={reducedMotion ? null : { opacity: 0, x: -24 }} opacity={1} x={0} gap="$3">
          <Form onSubmit={handleLoginSubmit}>
            <TerminalPanel cornerBrackets p="$4.5" gap="$4">
              <TerminalSectionHeading code="01" title={t('login.title')} {...(media.xxs ? { subtitle: 'AUTH' } : {})} />
              <TerminalTextField
                ref={usernameRef}
                icon={UserRound}
                label={t('login.usernameLabel')}
                value={username}
                onChangeText={(value) => {
                  setUsername(value);
                  if (invalidLoginField === 'username') setInvalidLoginField(null);
                }}
                placeholder="doctor@rhodes.is"
                autoComplete="username"
                enterKeyHint="next"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
                {...(invalidLoginField === 'username' ? { error: t('login.usernameRequired') } : {})}
              />
              <TerminalTextField
                ref={passwordRef}
                icon={LockKeyhole}
                label={t('login.passwordLabel')}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
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
              <XStack
                flexDirection="column"
                items="flex-start"
                gap="$1"
                $xs={{ flexDirection: 'row', items: 'center', justify: 'space-between', gap: '$0' }}
              >
                <TerminalCheckbox
                  id="remember-session"
                  label={t('login.keepConnected')}
                  checked={rememberSession}
                  onCheckedChange={setRememberSession}
                />
                <TerminalActionButton onPress={() => { setMode('forgot'); setIsRecoveryRequestSent(false); setIsRecoveryIdentifierMissing(false); }}>
                  <MonoText size="$3" color="$appAccent">{t('login.forgotAccessKey')}</MonoText>
                </TerminalActionButton>
              </XStack>
              <Form.Trigger asChild>
                <Button height="$4.5" borderWidth={1} borderColor="$appAccent" rounded="$0" bg="$appAccentSoft" hoverStyle={{ bg: '$appAccentSoft', borderColor: '$appAccent' }} pressStyle={{ bg: '$appSurfaceRaised' }} focusVisibleStyle={{ borderColor: '$appText' }} disabledStyle={{ opacity: 0.55 }} disabled={isSubmittingLogin} aria-busy={isSubmittingLogin} {...(isSubmittingLogin ? { icon: <Spinner size="small" color="$appAccent" /> } : {})} $platform-web={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
                  <TerminalText size="$3" color="$appAccent" fontWeight="700">{isSubmittingLogin ? t('login.connecting') : t('login.submit')}</TerminalText>
                  {!isSubmittingLogin ? <ArrowRight size={16} color={colors.appAccent.val} /> : null}
                </Button>
              </Form.Trigger>
              {submissionError ? <MonoText size="$2.5" color="$appWarning" accessibilityLiveRegion="polite">{submissionError}</MonoText> : null}
            </TerminalPanel>
          </Form>
          <MonoText size="$2.5" text="center">{t('login.unregistered')}</MonoText>
        </YStack>
      ) : (
        <YStack key="forgot" transition={reducedMotion ? '0ms' : '400ms'} enterStyle={reducedMotion ? null : { opacity: 0, x: 24 }} exitStyle={reducedMotion ? null : { opacity: 0, x: 24 }} opacity={1} x={0}>
          <Form onSubmit={submitRecoveryRequest}>
            <TerminalPanel cornerBrackets p="$4.5" gap="$4">
              <TerminalSectionHeading code="SOS" title={t('recovery.title')} {...(media.xxs ? { subtitle: 'RECOVERY' } : {})} />
              <AnimatePresence mode="wait">
                {isRecoveryRequestSent ? (
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
                      <Button height="$4.5" borderWidth={1} borderColor="$appWarning" rounded="$1" bg="$appWarningSoft" hoverStyle={{ borderColor: '$appWarning', bg: '$appWarningSoft' }} pressStyle={{ bg: '$appSurfaceRaised' }} focusVisibleStyle={{ borderColor: '$appText' }}>
                        <TerminalText size="$3" color="$appWarning" fontWeight="700">{t('recovery.send')}</TerminalText>
                        <ArrowRight size={16} color={colors.appWarning.val} />
                      </Button>
                    </Form.Trigger>
                  </YStack>
                )}
              </AnimatePresence>
              <TerminalActionButton self="flex-start" onPress={() => { setMode('login'); setInvalidLoginField(null); }}>
                <ArrowLeft size={16} color={colors.appAccent.val} />
                <MonoText size="$3" color="$appAccent">{t('recovery.backToLogin')}</MonoText>
              </TerminalActionButton>
            </TerminalPanel>
          </Form>
        </YStack>
      )}
    </AnimatePresence>
  );
}
