import { type MutationStatus } from '@tanstack/react-query';
import {
  CalendarClock,
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as v from 'valibot';
import {
  Button,
  Form,
  Spinner,
  XStack,
  YStack,
  getTokens,
} from 'tamagui';

import {
  MonoText,
  SectionPageHeader,
  Frame,
  TerminalPasswordVisibilityButton,
  TerminalText,
  TerminalTextField,
} from '@/components';
import { authFailureMessage } from '@/features/auth';
import type { AuthFailure } from '@/features/auth';
import { USER_PERMISSION } from '@/schemas/auth';
import type { SessionPrincipal } from '@/schemas/auth';
import {
  passwordChangeInputSchema,
  passwordChangeIssue,
} from '@/schemas/user-account';
import type { PasswordChangeInput } from '@/schemas/user-account';
import { SettingsPage } from '../../components/settings-page';

type PasswordField = 'currentPassword' | 'newPassword' | 'repeatNewPassword';
type PasswordIssue = (typeof passwordChangeIssue)[keyof typeof passwordChangeIssue];
type PasswordErrors = Partial<Record<PasswordField, PasswordIssue>>;

export type AccountSettingsScreenProps = {
  onUpdatePassword: (input: PasswordChangeInput) => Promise<boolean>;
  passwordUpdateError: AuthFailure | null;
  passwordUpdateStatus: MutationStatus;
  principal: SessionPrincipal;
};

function hasSuperAdminPermission(permission: number): boolean {
  return (permission & USER_PERMISSION.superAdmin) === USER_PERMISSION.superAdmin;
}

function passwordErrorsFromIssues(issues: readonly { message: string }[]): PasswordErrors {
  const errors: PasswordErrors = {};

  for (const issue of issues) {
    switch (issue.message) {
      case passwordChangeIssue.currentPasswordRequired:
        errors.currentPassword = issue.message;
        break;
      case passwordChangeIssue.newPasswordRequired:
        errors.newPassword = issue.message;
        break;
      case passwordChangeIssue.repeatNewPasswordRequired:
        errors.repeatNewPassword = issue.message;
        break;
      case passwordChangeIssue.passwordsMismatch:
        if (!errors.repeatNewPassword) errors.repeatNewPassword = issue.message;
        break;
    }
  }

  return errors;
}

function AccountPanelHeading({ code, title }: { code: string; title: string }) {
  return (
    <XStack items="baseline" justify="space-between" gap="$3" minW={0}>
      <MonoText size="$2.5" color="$appAccent" shrink={0}>
        {code}
      </MonoText>
      <TerminalText
        size="$3"
        text="right"
        fontWeight="700"
        letterSpacing={2.8}
        textTransform="uppercase"
        shrink={1}
      >
        {title}
      </TerminalText>
    </XStack>
  );
}

function AccountFact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  const colors = getTokens().color;

  return (
    <YStack grow={1} minW={0} p="$3" gap="$1.5" borderWidth={1} borderColor="$appBorder" bg="$appSurfaceRaisedTranslucent">
      <XStack items="center" gap="$2">
        <Icon size={14} color={colors.appAccent.val} strokeWidth={1.7} />
        <MonoText size="$1">{label}</MonoText>
      </XStack>
      <TerminalText size="$2.5" fontWeight="700" select="text" numberOfLines={2}>
        {value}
      </TerminalText>
    </YStack>
  );
}

function AccountIdentityPanel({
  email,
  registeredAt,
  registeredAtLabel,
  role,
  roleLabel,
  status,
  statusLabel,
  title,
  titleCode,
}: {
  email: string;
  registeredAt: string;
  registeredAtLabel: string;
  role: string;
  roleLabel: string;
  status: string;
  statusLabel: string;
  title: string;
  titleCode: string;
}) {
  const colors = getTokens().color;

  return (
    <Frame
      testID="account-identity-panel"
      p="$3.5"
      gap="$4"
      tone="cyan"
      cornerBrackets
      $large={{ p: '$4.5' }}
    >
      <AccountPanelHeading code={titleCode} title={title} />

      <XStack items="center" gap="$3" p="$3" borderWidth={1} borderColor="$appBorder" bg="$appSurfaceRaisedTranslucent">
        <YStack
          width="$7"
          height="$7"
          shrink={0}
          items="center"
          justify="center"
          rounded="$10"
          borderWidth={1}
          borderColor="$appAccentBorder"
          bg="$appAccentSoft"
        >
          <UserRound size={26} color={colors.appAccent.val} strokeWidth={1.6} />
        </YStack>
        <YStack grow={1} minW={0} gap="$1">
          <XStack items="center" gap="$2">
            <Mail size={14} color={colors.appAccent.val} strokeWidth={1.7} />
            <MonoText size="$1">{email}</MonoText>
          </XStack>
          <TerminalText size="$4" fontWeight="800" select="text" numberOfLines={1}>
            {email}
          </TerminalText>
          <XStack items="center" gap="$2">
            <MonoText size="$1">{roleLabel}</MonoText>
            <TerminalText size="$2.5" color="$appAccent" fontWeight="700" select="text">
              {role}
            </TerminalText>
          </XStack>
        </YStack>
      </XStack>

      <XStack flexDirection="column" gap="$3" $large={{ flexDirection: 'row' }}>
        <AccountFact
          icon={CalendarClock}
          label={registeredAtLabel}
          value={registeredAt}
        />
        <AccountFact
          icon={ShieldCheck}
          label={statusLabel}
          value={status}
        />
      </XStack>
    </Frame>
  );
}

export function AccountSettingsScreen({
  onUpdatePassword,
  passwordUpdateError,
  passwordUpdateStatus,
  principal,
}: AccountSettingsScreenProps) {
  const { t, i18n } = useTranslation('settings');
  const { t: tCommon } = useTranslation('common');
  const colors = getTokens().color;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatNewPassword, setRepeatNewPassword] = useState('');
  const [visiblePasswordField, setVisiblePasswordField] = useState<PasswordField | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [passwordWasUpdated, setPasswordWasUpdated] = useState(false);
  const role = hasSuperAdminPermission(principal.permission) ? 'administrator' : 'member';
  const registeredAt = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(principal.registeredAt));
  const translatedPasswordUpdateError = authFailureMessage(passwordUpdateError, t, 'account');
  const showPasswordUpdateSuccess = passwordUpdateStatus === 'success' && passwordWasUpdated;

  const translatePasswordError = (errorCode: PasswordIssue) => {
    switch (errorCode) {
      case passwordChangeIssue.currentPasswordRequired:
        return t('account.validation.currentPasswordRequired');
      case passwordChangeIssue.newPasswordRequired:
        return t('account.validation.newPasswordRequired');
      case passwordChangeIssue.repeatNewPasswordRequired:
        return t('account.validation.repeatNewPasswordRequired');
      case passwordChangeIssue.passwordsMismatch:
        return t('account.validation.passwordsMismatch');
    }
  };

  const clearPasswordError = (field: PasswordField) => {
    setPasswordErrors((errors) => {
      if (!errors[field]) return errors;
      const nextErrors = { ...errors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handlePasswordSubmit = () => {
    const result = v.safeParse(passwordChangeInputSchema, {
      currentPassword,
      newPassword,
      repeatNewPassword,
    });

    if (!result.success) {
      setPasswordErrors(passwordErrorsFromIssues(result.issues));
      return;
    }

    setPasswordErrors({});
    setPasswordWasUpdated(false);
    onUpdatePassword(result.output).then((updated) => {
      if (!updated) return;
      setCurrentPassword('');
      setNewPassword('');
      setRepeatNewPassword('');
      setVisiblePasswordField(null);
      setPasswordWasUpdated(true);
    }).catch(() => undefined);
  };

  const renderPasswordField = ({
    autoComplete,
    field,
    label,
    onChangeText,
    value,
  }: {
    autoComplete: 'current-password' | 'new-password';
    field: PasswordField;
    label: string;
    onChangeText: (value: string) => void;
    value: string;
  }) => (
    <TerminalTextField
      icon={KeyRound}
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={t('account.passwordPlaceholder')}
      secureTextEntry={visiblePasswordField !== field}
      autoComplete={autoComplete}
      {...(passwordErrors[field]
        ? { error: translatePasswordError(passwordErrors[field]) }
        : {})}
      trailing={(
        <TerminalPasswordVisibilityButton
          hideLabel={tCommon('accessibility.hidePassword')}
          showLabel={tCommon('accessibility.showPassword')}
          isPasswordVisible={visiblePasswordField === field}
          onPress={() => setVisiblePasswordField((visibleField) => visibleField === field ? null : field)}
        />
      )}
    />
  );

  return (
    <SettingsPage
      header={(
        <SectionPageHeader
          code={t('account.code')}
          description={t('account.description')}
          eyebrow={t('account.eyebrow')}
          status={t('account.status')}
          title={t('account.title')}
        />
      )}
    >
      <YStack gap="$3" $large={{ gap: '$5' }}>
        <MonoText size="$2" lineHeight="$3" color="$appText" select="text" $large={{ display: 'none' }}>
          {t('account.description')}
        </MonoText>

        <XStack minW={0} flexDirection="column" gap="$4" $large={{ flexDirection: 'row', items: 'flex-start' }}>
          <YStack width="100%" gap="$4" shrink={0} $large={{ width: '34%', maxW: 380 }}>
            <AccountIdentityPanel
              email={principal.email}
              registeredAt={registeredAt}
              registeredAtLabel={t('account.registeredAt')}
              role={t(`account.roles.${role}`)}
              roleLabel={t('account.role')}
              status={t(`account.identityStatuses.${principal.status}`)}
              statusLabel={t('account.identityStatus')}
              title={t('account.identityTitle')}
              titleCode={t('account.identityCode')}
            />
          </YStack>

          <YStack grow={1} shrink={1} minW={0} width="100%" $large={{ width: 'auto' }}>
            <Form onSubmit={handlePasswordSubmit}>
              <Frame
                testID="account-password-panel"
                p="$3.5"
                gap="$4"
                cornerBrackets
                $large={{ p: '$4.5' }}
              >
                <AccountPanelHeading
                  code={t('account.passwordCode')}
                  title={t('account.passwordTitle')}
                />

                {renderPasswordField({
                  autoComplete: 'current-password',
                  field: 'currentPassword',
                  label: t('account.currentPassword'),
                  onChangeText: (value) => {
                    setCurrentPassword(value);
                    setPasswordWasUpdated(false);
                    clearPasswordError('currentPassword');
                  },
                  value: currentPassword,
                })}

                <XStack flexDirection="column" gap="$3" $large={{ flexDirection: 'row' }}>
                  <YStack grow={1} minW={0}>
                    {renderPasswordField({
                      autoComplete: 'new-password',
                      field: 'newPassword',
                      label: t('account.newPassword'),
                      onChangeText: (value) => {
                        setNewPassword(value);
                        setPasswordWasUpdated(false);
                        clearPasswordError('newPassword');
                        clearPasswordError('repeatNewPassword');
                      },
                      value: newPassword,
                    })}
                  </YStack>
                  <YStack grow={1} minW={0}>
                    {renderPasswordField({
                      autoComplete: 'new-password',
                      field: 'repeatNewPassword',
                      label: t('account.repeatNewPassword'),
                      onChangeText: (value) => {
                        setRepeatNewPassword(value);
                        setPasswordWasUpdated(false);
                        clearPasswordError('repeatNewPassword');
                      },
                      value: repeatNewPassword,
                    })}
                  </YStack>
                </XStack>

                <Form.Trigger asChild>
                  <Button
                    testID="account-password-submit"
                    width="100%"
                    minH="$4.5"
                    rounded="$0"
                    borderWidth={1}
                    borderColor="$appAccent"
                    bg="$appAccentSoft"
                    hoverStyle={{ bg: '$appSurfaceRaised', borderColor: '$appAccent' }}
                    pressStyle={{ opacity: 0.75 }}
                    focusVisibleStyle={{ borderColor: '$appText' }}
                    disabled={passwordUpdateStatus === 'pending'}
                    disabledStyle={{ opacity: 0.55 }}
                    aria-busy={passwordUpdateStatus === 'pending'}
                    {...(passwordUpdateStatus === 'pending'
                      ? { icon: <Spinner size="small" color="$appAccent" /> }
                      : {})}
                  >
                    <XStack items="center" gap="$2">
                      <ShieldCheck size={15} color={colors.appAccent.val} strokeWidth={1.8} />
                      <TerminalText size="$3" color="$appAccent" fontWeight="700">
                        {t('account.submitPassword')}
                      </TerminalText>
                    </XStack>
                  </Button>
                </Form.Trigger>
                {translatedPasswordUpdateError ? (
                  <MonoText size="$2.5" color="$appWarning" accessibilityLiveRegion="polite">
                    {translatedPasswordUpdateError}
                  </MonoText>
                ) : null}
                {showPasswordUpdateSuccess ? (
                  <MonoText size="$2.5" color="$appSuccess" accessibilityLiveRegion="polite">
                    {t('account.passwordUpdated')}
                  </MonoText>
                ) : null}
              </Frame>
            </Form>
          </YStack>
        </XStack>
      </YStack>

    </SettingsPage>
  );
}
