import { CalendarClock, KeyRound, Mail, ShieldAlert, UserRound } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as v from 'valibot';
import {
  Adapt,
  Button,
  Dialog,
  Form,
  Sheet,
  XStack,
  YStack,
  getTokens,
} from 'tamagui';

import {
  MonoText,
  SectionPageHeader,
  TerminalPanel,
  TerminalPasswordVisibilityButton,
  TerminalSectionHeading,
  TerminalText,
  TerminalTextField,
} from '@/components';
import { useBackDismissal } from '@/hooks/use-back-dismissal';
import {
  passwordChangeInputSchema,
  passwordChangeIssue,
} from '@/schemas/user-account';
import { SettingsPage } from '../components/settings-page';
import { mockUserAccount } from '../mocks/settings-mocks';

type PasswordField = 'currentPassword' | 'newPassword' | 'repeatNewPassword';
type PasswordIssue = (typeof passwordChangeIssue)[keyof typeof passwordChangeIssue];
type PasswordErrors = Partial<Record<PasswordField, PasswordIssue>>;

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

export function AccountSettingsScreen() {
  const { t, i18n } = useTranslation('settings');
  const { t: tCommon } = useTranslation('common');
  const colors = getTokens().color;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatNewPassword, setRepeatNewPassword] = useState('');
  const [focusedPasswordField, setFocusedPasswordField] = useState<PasswordField | null>(null);
  const [visiblePasswordField, setVisiblePasswordField] = useState<PasswordField | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const handleDeleteDialogDismiss = useCallback(() => {
    setIsDeleteDialogOpen(false);
  }, []);
  useBackDismissal(isDeleteDialogOpen, handleDeleteDialogDismiss);
  const registeredAt = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(mockUserAccount.registeredAt));

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

  const handlePasswordFieldBlur = (field: PasswordField) => {
    setFocusedPasswordField((focusedField) => focusedField === field ? null : focusedField);
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
    setCurrentPassword('');
    setNewPassword('');
    setRepeatNewPassword('');
    setVisiblePasswordField(null);
    console.info('Mock password change accepted.', { userAccountId: mockUserAccount.id });
  };

  const handleDeleteConfirm = () => {
    console.info('Mock User Account deletion confirmed.', { userAccountId: mockUserAccount.id });
    setIsDeleteDialogOpen(false);
  };

  return (
    <SettingsPage isSwipeEnabled={focusedPasswordField === null}>
      <SectionPageHeader
        code={t('account.code')}
        description={t('account.description')}
        eyebrow={t('account.eyebrow')}
        status={t('account.status')}
        title={t('account.title')}
      />

      <XStack flexDirection="column" gap="$4" $lg={{ flexDirection: 'row', items: 'flex-start' }}>
        <YStack grow={1} minW={0} gap="$4">
          <TerminalPanel p="$3.5" gap="$4" tone="cyan" $md={{ p: '$4.5' }}>
            <TerminalSectionHeading code={t('account.identityCode')} title={t('account.identityTitle')} />
            <XStack flexDirection="column" gap="$3" $sm={{ flexDirection: 'row' }}>
              <YStack grow={1} minH="$5" p="$3" gap="$1" borderWidth={1} borderColor="$terminalBorder" bg="$terminalBg">
                <XStack items="center" gap="$2">
                  <Mail size={15} color={colors.terminalCyan.val} />
                  <MonoText size="$1">{t('account.email')}</MonoText>
                </XStack>
                <TerminalText size="$3" fontWeight="700" select="text">{mockUserAccount.email}</TerminalText>
              </YStack>
              <YStack grow={1} minH="$5" p="$3" gap="$1" borderWidth={1} borderColor="$terminalBorder" bg="$terminalBg">
                <XStack items="center" gap="$2">
                  <CalendarClock size={15} color={colors.terminalCyan.val} />
                  <MonoText size="$1">{t('account.registeredAt')}</MonoText>
                </XStack>
                <TerminalText size="$3" fontWeight="700" select="text">{registeredAt}</TerminalText>
              </YStack>
            </XStack>
            <XStack items="center" gap="$3" minH="$4.5" px="$3" borderWidth={1} borderColor="$terminalBorder" bg="$terminalRaisedTranslucent">
              <UserRound size={17} color={colors.terminalMuted.val} />
              <MonoText size="$2">{t('account.role')}</MonoText>
              <TerminalText ml="auto" size="$2.5" color="$terminalCyan" fontWeight="700">
                {t(`account.roles.${mockUserAccount.role}`)}
              </TerminalText>
            </XStack>
          </TerminalPanel>

          <Form onSubmit={handlePasswordSubmit}>
            <TerminalPanel p="$3.5" gap="$4" cornerBrackets $md={{ p: '$4.5' }}>
              <TerminalSectionHeading
                code={t('account.passwordCode')}
                title={t('account.passwordTitle')}
                subtitle={t('account.passwordSubtitle')}
              />
              <TerminalTextField
                icon={KeyRound}
                label={t('account.currentPassword')}
                value={currentPassword}
                onBlur={() => handlePasswordFieldBlur('currentPassword')}
                onChangeText={(value) => {
                  setCurrentPassword(value);
                  clearPasswordError('currentPassword');
                }}
                onFocus={() => setFocusedPasswordField('currentPassword')}
                placeholder={t('account.passwordPlaceholder')}
                secureTextEntry={visiblePasswordField !== 'currentPassword'}
                autoComplete="current-password"
                {...(passwordErrors.currentPassword
                  ? { error: translatePasswordError(passwordErrors.currentPassword) }
                  : {})}
                trailing={(
                  <TerminalPasswordVisibilityButton
                    hideLabel={tCommon('accessibility.hidePassword')}
                    showLabel={tCommon('accessibility.showPassword')}
                    isPasswordVisible={visiblePasswordField === 'currentPassword'}
                    onPress={() => setVisiblePasswordField((field) => field === 'currentPassword' ? null : 'currentPassword')}
                  />
                )}
              />
              <XStack flexDirection="column" gap="$3" $sm={{ flexDirection: 'row' }}>
                <YStack grow={1} minW={0}>
                  <TerminalTextField
                    icon={KeyRound}
                    label={t('account.newPassword')}
                    value={newPassword}
                    onBlur={() => handlePasswordFieldBlur('newPassword')}
                    onChangeText={(value) => {
                      setNewPassword(value);
                      clearPasswordError('newPassword');
                      clearPasswordError('repeatNewPassword');
                    }}
                    onFocus={() => setFocusedPasswordField('newPassword')}
                    placeholder={t('account.passwordPlaceholder')}
                    secureTextEntry={visiblePasswordField !== 'newPassword'}
                    autoComplete="new-password"
                    {...(passwordErrors.newPassword
                      ? { error: translatePasswordError(passwordErrors.newPassword) }
                      : {})}
                    trailing={(
                      <TerminalPasswordVisibilityButton
                        hideLabel={tCommon('accessibility.hidePassword')}
                        showLabel={tCommon('accessibility.showPassword')}
                        isPasswordVisible={visiblePasswordField === 'newPassword'}
                        onPress={() => setVisiblePasswordField((field) => field === 'newPassword' ? null : 'newPassword')}
                      />
                    )}
                  />
                </YStack>
                <YStack grow={1} minW={0}>
                  <TerminalTextField
                    icon={KeyRound}
                    label={t('account.repeatNewPassword')}
                    value={repeatNewPassword}
                    onBlur={() => handlePasswordFieldBlur('repeatNewPassword')}
                    onChangeText={(value) => {
                      setRepeatNewPassword(value);
                      clearPasswordError('repeatNewPassword');
                    }}
                    onFocus={() => setFocusedPasswordField('repeatNewPassword')}
                    placeholder={t('account.passwordPlaceholder')}
                    secureTextEntry={visiblePasswordField !== 'repeatNewPassword'}
                    autoComplete="new-password"
                    {...(passwordErrors.repeatNewPassword
                      ? { error: translatePasswordError(passwordErrors.repeatNewPassword) }
                      : {})}
                    trailing={(
                      <TerminalPasswordVisibilityButton
                        hideLabel={tCommon('accessibility.hidePassword')}
                        showLabel={tCommon('accessibility.showPassword')}
                        isPasswordVisible={visiblePasswordField === 'repeatNewPassword'}
                        onPress={() => setVisiblePasswordField((field) => field === 'repeatNewPassword' ? null : 'repeatNewPassword')}
                      />
                    )}
                  />
                </YStack>
              </XStack>
              <Form.Trigger asChild>
                <Button
                  minH="$4.5"
                  rounded="$0"
                  borderWidth={1}
                  borderColor="$terminalCyan"
                  bg="$terminalCyanSoft"
                  hoverStyle={{ bg: '$terminalRaised', borderColor: '$terminalCyan' }}
                  pressStyle={{ opacity: 0.75 }}
                  focusVisibleStyle={{ borderColor: '$terminalText' }}
                >
                  <TerminalText size="$3" color="$terminalCyan" fontWeight="700">{t('account.submitPassword')}</TerminalText>
                </Button>
              </Form.Trigger>
            </TerminalPanel>
          </Form>
        </YStack>

        <YStack width="100%" gap="$4" $lg={{ maxW: 360 }}>
          <TerminalPanel p="$3.5" gap="$4" tone="danger" $md={{ p: '$4.5' }}>
            <TerminalSectionHeading code={t('account.dangerCode')} title={t('account.dangerTitle')} />
            <XStack items="flex-start" gap="$3">
              <ShieldAlert size={21} color={colors.terminalDanger.val} />
              <MonoText grow={1} size="$2.5" lineHeight="$3">{t('account.dangerDescription')}</MonoText>
            </XStack>

            <Dialog modal open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <Dialog.Trigger asChild>
                <Button
                  minH="$4.5"
                  rounded="$0"
                  borderWidth={1}
                  borderColor="$terminalDanger"
                  bg="$terminalDangerSoft"
                  hoverStyle={{ bg: '$terminalDangerSoft', borderColor: '$terminalDanger' }}
                  pressStyle={{ opacity: 0.72 }}
                  focusVisibleStyle={{ borderColor: '$terminalText' }}
                >
                  <TerminalText size="$3" color="$terminalDanger" fontWeight="700">{t('account.deleteAccount')}</TerminalText>
                </Button>
              </Dialog.Trigger>

              <Adapt platform="touch" when="max-md">
                <Sheet modal dismissOnSnapToBottom snapPointsMode="fit" zIndex={100000}>
                  <Sheet.Frame p="$4" bg="$terminalSurfaceStrong" borderTopWidth={1} borderColor="$terminalDangerBorder">
                    <Adapt.Contents />
                  </Sheet.Frame>
                  <Sheet.Overlay bg="$terminalScrim" />
                </Sheet>
              </Adapt>

              <Dialog.Portal>
                <Dialog.Overlay
                  key="account-delete-overlay"
                  transition="200ms"
                  bg="$terminalScrim"
                  opacity={1}
                  enterStyle={{ opacity: 0 }}
                  exitStyle={{ opacity: 0 }}
                />
                <Dialog.Content
                  key="account-delete-content"
                  width="90%"
                  maxW={480}
                  p="$5"
                  gap="$4"
                  rounded="$0"
                  borderWidth={1}
                  borderColor="$terminalDangerBorder"
                  bg="$terminalSurfaceStrong"
                  transition="200ms"
                  enterStyle={{ opacity: 0, scale: 0.96, y: 8 }}
                  exitStyle={{ opacity: 0, scale: 0.96, y: 8 }}
                >
                  <Dialog.Title asChild>
                    <TerminalText size="$5" fontWeight="800">{t('account.deleteDialogTitle')}</TerminalText>
                  </Dialog.Title>
                  <Dialog.Description asChild>
                    <MonoText size="$2.5" lineHeight="$3" select="text">
                      {t('account.deleteDialogDescription', { email: mockUserAccount.email })}
                    </MonoText>
                  </Dialog.Description>
                  <XStack flexDirection="column-reverse" gap="$2" $xs={{ flexDirection: 'row', justify: 'flex-end' }}>
                    <Dialog.Close asChild>
                      <Button minH="$4.5" px="$4" rounded="$0" borderWidth={1} borderColor="$terminalBorder" bg="$terminalRaised">
                        <MonoText size="$2.5">{t('account.cancel')}</MonoText>
                      </Button>
                    </Dialog.Close>
                    <Button
                      minH="$4.5"
                      px="$4"
                      rounded="$0"
                      borderWidth={1}
                      borderColor="$terminalDanger"
                      bg="$terminalDangerSoft"
                      onPress={handleDeleteConfirm}
                    >
                      <TerminalText size="$2.5" color="$terminalDanger" fontWeight="700">{t('account.confirmDelete')}</TerminalText>
                    </Button>
                  </XStack>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog>

            <MonoText size="$1" color="$terminalWarning">{t('account.mockNotice')}</MonoText>
          </TerminalPanel>
        </YStack>
      </XStack>
    </SettingsPage>
  );
}
