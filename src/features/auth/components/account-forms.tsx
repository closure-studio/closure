import { useId, useRef, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';
import { ArrowLeft, ArrowRight, Check, CheckCheck, Globe2, Hash, LockKeyhole, Mail } from 'lucide-react-native';
import { Anchor, AnimatePresence, Checkbox, Form, Label, Spinner, Tabs, XStack, YStack, getTokens, styled, useMedia } from 'tamagui';
import * as v from 'valibot';

import { Frame, MonoText, TerminalNotice, TerminalPasswordVisibilityButton, TerminalText, TerminalTextField } from '@/components';
import type { TerminalTextFieldHandle } from '@/components';
import { emailCodeRequestInputSchema, loginCredentialsSchema, registrationInputSchema, passwordResetInputSchema } from '@/schemas/auth';
import type { AuthFormSubmission, EmailCodeRequestInput } from '@/schemas/auth';
import { AuthButton } from './auth-button';

export type AuthEntryView = 'login' | 'register' | 'reset';
type InvalidField = 'email' | 'password' | 'code' | 'terms' | null;

export type AccountFormsProps = {
  view: AuthEntryView;
  initialEmail: string;
  submission: { error: string | null; isPending: boolean;
    kind: 'form' | 'linuxdo' | null; resetCompletedEmail: string | null };
  emailCode: { error: string | null; isPending: boolean; sentEmail: string | null };
  linuxDoAvailable: boolean;
  onViewChange: (view: AuthEntryView, email?: string) => void;
  onSubmit: (input: AuthFormSubmission) => void;
  onSendCode: (input: EmailCodeRequestInput) => void;
  onBeginLinuxDo: () => void;
  onClearFeedback: () => void;
};

const AuthTab = styled(Tabs.Tab, {
  name: 'AuthTab', unstyled: true, accessible: true, grow: 1, flexBasis: 0, minH: '$4.5',
  items: 'center', justify: 'center', rounded: '$0', borderBottomWidth: 2,
  borderColor: 'transparent', bg: 'transparent',
  hoverStyle: { bg: '$appAccentSubtle' },
  focusVisibleStyle: { outlineWidth: 2, outlineStyle: 'solid', outlineColor: '$appAccent' },
  disabledStyle: { opacity: 0.5 },
  variants: {
    active: { true: { borderColor: '$appAccent', bg: '$appAccentSoft' } },
  } as const,
});

export function AccountForms(props: AccountFormsProps) {
  const reducedMotion = useReducedMotion();
  const media = useMedia();
  const { t } = useTranslation('auth');
  const selectedTab = props.view === 'register' ? 'register' : 'login';
  const busy = props.submission.isPending || props.emailCode.isPending;
  const completed = props.view === 'reset' && props.submission.resetCompletedEmail !== null;
  return (
    <Frame
      testID="auth-form-surface"
      cornerBrackets={media.large}
      bg="transparent"
      borderWidth={0}
      overflow="visible"
      p={0}
      $platform-web={{ clipPath: 'none' }}
      $large={{
        bg: '$appSurface',
        borderWidth: 1,
        overflow: 'hidden',
        p: '$5',
        '$platform-web': {
          clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
        },
      }}
    >
      <Tabs value={selectedTab} onValueChange={(value) => {
        if (!busy && (value === 'login' || value === 'register') && value !== props.view) props.onViewChange(value);
      }} orientation="horizontal" flexDirection="column" gap="$4">
        {props.view !== 'reset' ? (
          <Tabs.List bg="$appSurfaceRaised" rounded="$0" borderBottomWidth={1} borderColor="$appBorder">
            <AuthTab value="login" active={props.view === 'login'} disabled={busy}>
              <TerminalText size="$3" color={props.view === 'login' ? '$appAccent' : '$appMuted'} fontWeight="600">{t('form.loginTab')}</TerminalText>
            </AuthTab>
            <AuthTab value="register" active={props.view === 'register'} disabled={busy}>
              <TerminalText size="$3" color={props.view === 'register' ? '$appAccent' : '$appMuted'} fontWeight="600">{t('registration.title')}</TerminalText>
            </AuthTab>
          </Tabs.List>
        ) : null}
        <Tabs.Content
          value={selectedTab}
          aria-label={t(props.view === 'login' ? 'form.loginTab' : props.view === 'register' ? 'registration.title' : 'registration.reset')}
          accessible={false}
          p={0}
        >
          <AnimatePresence mode="wait">
            <YStack key={completed ? 'reset-complete' : props.view} gap="$4"
              transition={reducedMotion ? '0ms' : '200ms'} opacity={1} y={0}
              enterStyle={reducedMotion ? null : { opacity: 0, y: 6 }}
              exitStyle={reducedMotion ? null : { opacity: 0 }}>
              {completed && props.submission.resetCompletedEmail !== null
                ? <ResetComplete email={props.submission.resetCompletedEmail} onViewChange={props.onViewChange} />
                : <CredentialForm {...props} />}
            </YStack>
          </AnimatePresence>
        </Tabs.Content>
      </Tabs>
    </Frame>
  );
}

function CredentialForm({
  view, initialEmail, submission, emailCode, linuxDoAvailable,
  onViewChange, onSubmit, onSendCode, onBeginLinuxDo, onClearFeedback,
}: AccountFormsProps) {
  const { t } = useTranslation('auth');
  const { t: tCommon } = useTranslation('common');
  const colors = getTokens().color;
  const termsId = useId();
  const emailRef = useRef<TerminalTextFieldHandle>(null);
  const passwordRef = useRef<TerminalTextFieldHandle>(null);
  const codeRef = useRef<TerminalTextFieldHandle>(null);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [invalid, setInvalid] = useState<InvalidField>(null);
  const [accountUnavailable, setAccountUnavailable] = useState(false);
  const isSubmitting = submission.isPending && submission.kind === 'form';
  const isLinuxDoSubmitting = submission.isPending && submission.kind === 'linuxdo';
  const busy = submission.isPending || emailCode.isPending;
  const codeSent = emailCode.sentEmail !== null && emailCode.sentEmail === email.trim();
  const submissionError = submission.kind === 'form' ? submission.error : null;
  const linuxDoError = submission.kind === 'linuxdo' ? submission.error : null;

  const reportInvalid = (key: unknown) => {
    const field = key === 'password' ? 'password' : key === 'code' ? 'code' : 'email';
    setInvalid(field);
    (field === 'email' ? emailRef : field === 'password' ? passwordRef : codeRef).current?.focus();
  };
  const edit = () => { setInvalid(null); onClearFeedback(); };
  const submit = () => {
    if (busy) return;
    setInvalid(null);
    if (view === 'login') {
      const result = v.safeParse(loginCredentialsSchema, { identifier: email, password });
      if (!result.success) { reportInvalid(result.issues[0].path?.at(-1)?.key); return; }
      onSubmit({ kind: 'login', ...result.output });
    } else if (view === 'register') {
      const result = v.safeParse(registrationInputSchema, { email, password, code });
      if (!result.success) { reportInvalid(result.issues[0].path?.[0]?.key); return; }
      if (!agreed) { setInvalid('terms'); return; }
      onSubmit({ kind: 'register', ...result.output });
    } else {
      const result = v.safeParse(passwordResetInputSchema, { email, password, code });
      if (!result.success) { reportInvalid(result.issues[0].path?.[0]?.key); return; }
      onSubmit({ kind: 'reset-password', ...result.output });
    }
  };
  const sendCode = () => {
    if (busy) return;
    const result = v.safeParse(emailCodeRequestInputSchema, { email });
    if (!result.success) { reportInvalid('email'); return; }
    setInvalid(null);
    onSendCode(result.output);
  };

  const passwordField = (
    <TerminalTextField ref={passwordRef} icon={LockKeyhole}
      label={t(view === 'reset' ? 'form.newPassword' : 'form.password')}
      placeholder={t('form.passwordPlaceholder')} value={password} disabled={busy}
      onChangeText={(value) => { setPassword(value); edit(); }} secureTextEntry={!visible}
      autoComplete={view === 'login' ? 'current-password' : 'new-password'}
      enterKeyHint={view === 'register' ? 'next' : 'go'} returnKeyType={view === 'register' ? 'next' : 'go'}
      onSubmitEditing={view === 'register' ? () => codeRef.current?.focus() : submit}
      {...(invalid === 'password' ? { error: t(view === 'login' ? 'login.passwordRequired' : 'form.passwordInvalid') } : {})}
      trailing={<TerminalPasswordVisibilityButton isPasswordVisible={visible}
        hideLabel={tCommon('accessibility.hideAccessKey')} showLabel={tCommon('accessibility.showAccessKey')}
        onPress={() => setVisible((value) => !value)} />} />
  );

  return (
    <YStack gap="$4">
      {view === 'reset' ? (
        <AuthButton tone="link" self="flex-start" disabled={busy} onPress={() => onViewChange('login', email.trim())}>
          <ArrowLeft size={16} color={colors.appMuted.val} />{t('recovery.backToLogin')}
        </AuthButton>
      ) : null}
        <Form onSubmit={submit} gap="$3.5">
          <TerminalTextField ref={emailRef} icon={Mail} label={t('form.email')}
            placeholder={t('form.emailPlaceholder')} value={email} disabled={busy}
            onChangeText={(value) => { setEmail(value); setCode(''); edit(); }}
            keyboardType="email-address" autoComplete="email" enterKeyHint="next" returnKeyType="next"
            onSubmitEditing={() => (view === 'reset' ? codeRef : passwordRef).current?.focus()}
            {...(invalid === 'email' ? { error: t(email.trim() ? 'form.emailInvalid' : 'form.emailRequired') } : {})} />
          {view !== 'reset' ? passwordField : null}
          {view === 'register' ? <MonoText size="$1">{t('form.passwordHint')}</MonoText> : null}
          {view !== 'login' ? (
            <YStack gap="$2">
              <XStack gap="$2" items="flex-end" flexWrap="wrap">
                <YStack grow={1} flexBasis={140} minW={0}>
                  <TerminalTextField ref={codeRef} icon={Hash} label={t('registration.code')}
                    placeholder={t('form.codePlaceholder')} value={code} disabled={busy}
                    onChangeText={(value) => { setCode(value); edit(); }} autoComplete="one-time-code"
                    enterKeyHint={view === 'reset' ? 'next' : 'go'} returnKeyType={view === 'reset' ? 'next' : 'go'}
                    onSubmitEditing={view === 'reset' ? () => passwordRef.current?.focus() : submit}
                    {...(invalid === 'code' ? { error: t('form.codeRequired') } : {})} />
                </YStack>
                <AuthButton tone="secondary" disabled={busy} aria-busy={emailCode.isPending} onPress={sendCode}>
                  {emailCode.isPending ? <Spinner size="small" color="$appAccent" /> : null}
                  {t(emailCode.isPending ? 'form.sendingCode' : codeSent ? 'form.resendCode' : 'registration.send')}
                </AuthButton>
              </XStack>
              {emailCode.error ? <TerminalNotice tone="danger">{emailCode.error}</TerminalNotice>
                : codeSent ? <MonoText size="$2" color="$appSuccess" aria-live="polite">{t('recovery.sentDescription', { destination: emailCode.sentEmail })}</MonoText> : null}
            </YStack>
          ) : null}
          {view === 'reset' ? passwordField : null}
          {view === 'register' ? (
            <YStack gap="$1.5">
              <XStack items="flex-start" gap="$2" py="$1">
                <Checkbox accessible id={termsId} checked={agreed} disabled={busy} size="$2" mt="$1"
                  aria-label={t('registration.terms')}
                  onCheckedChange={(value) => { setAgreed(value === true); edit(); }}>
                  <Checkbox.Indicator><Check size={16} color={colors.appAccent.val} /></Checkbox.Indicator>
                </Checkbox>
                <Label htmlFor={termsId} flex={1} color="$appMuted" size="$2.5" lineHeight="$3" minH="$4">
                  <Trans ns="auth" i18nKey="form.terms" components={{ terms: <Anchor color="$appAccent" href="https://closure.ltsc.vip/blog/Terms%26Policies" target="_blank" rel="noopener noreferrer" /> }} />
                </Label>
              </XStack>
              {invalid === 'terms' ? <TerminalNotice tone="danger">{t('form.termsRequired')}</TerminalNotice> : null}
            </YStack>
          ) : null}
          {view === 'login' ? (
            <YStack gap="$1">
              <XStack justify="space-between" flexWrap="wrap" columnGap="$2">
                <AuthButton tone="link" disabled={busy} onPress={() => setAccountUnavailable(true)}>{t('form.forgotAccount')}</AuthButton>
                <AuthButton tone="link" disabled={busy} onPress={() => onViewChange('reset', email.trim())}>{t('form.forgotPassword')}</AuthButton>
              </XStack>
              {accountUnavailable ? <TerminalNotice tone="info">{t('form.accountUnavailable')}</TerminalNotice> : null}
            </YStack>
          ) : null}
          {submissionError ? <TerminalNotice tone="danger">{submissionError}</TerminalNotice> : null}
          <Form.Trigger asChild>
            <AuthButton disabled={busy} aria-busy={isSubmitting}>
              {isSubmitting ? <Spinner size="small" color="$appAccent" /> : null}
              {t(isSubmitting ? 'form.submitting' : view === 'login' ? 'login.submit' : view === 'register' ? 'registration.submit' : 'registration.reset')}
              {!isSubmitting ? <ArrowRight size={16} color={colors.appAccent.val} /> : null}
            </AuthButton>
          </Form.Trigger>
        </Form>
        {view === 'login' ? (
          <YStack gap="$3">
            <XStack items="center" gap="$3"><YStack height={1} grow={1} bg="$appBorder" /><MonoText size="$1">{t('oauth.divider')}</MonoText><YStack height={1} grow={1} bg="$appBorder" /></XStack>
            <AuthButton tone="secondary" disabled={busy || !linuxDoAvailable} aria-busy={isLinuxDoSubmitting} onPress={onBeginLinuxDo}>
              {isLinuxDoSubmitting ? <Spinner size="small" color="$appAccent" /> : <Globe2 size={17} color={colors.appMuted.val} />}
              {t(isLinuxDoSubmitting ? 'oauth.connecting' : 'oauth.login')}
            </AuthButton>
            {linuxDoError ? <TerminalNotice tone="danger">{linuxDoError}</TerminalNotice> : null}
          </YStack>
        ) : null}
    </YStack>
  );
}

function ResetComplete({ email, onViewChange }: Pick<AccountFormsProps, 'onViewChange'> & { email: string }) {
  const { t } = useTranslation('auth');
  const colors = getTokens().color;
  return (
    <YStack gap="$4" py="$3">
      <YStack self="flex-start" p="$3" borderWidth={1} borderColor="$appSuccess" bg="$appSuccessSoft"><CheckCheck size={26} color={colors.appSuccess.val} /></YStack>
      <TerminalText size="$5" fontWeight="700">{t('form.resetComplete')}</TerminalText>
      <TerminalNotice tone="success">{t('registration.success')}</TerminalNotice>
      <AuthButton onPress={() => onViewChange('login', email)}>{t('recovery.backToLogin')}<ArrowRight size={16} color={colors.appAccent.val} /></AuthButton>
    </YStack>
  );
}
