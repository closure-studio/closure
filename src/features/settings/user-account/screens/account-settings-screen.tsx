import { type MutationStatus } from '@tanstack/react-query';
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  KeyRound,
  LogOut,
  MessageCircle,
  Radio,
  RefreshCw,
  ShieldCheck,
  StopCircle,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import * as v from 'valibot';
import {
  Button,
  Dialog,
  Form,
  Spinner,
  XStack,
  YStack,
  getTokens,
  useMedia,
} from 'tamagui';

import {
  AdaptiveDialog,
  CornerBrackets,
  MonoText,
  SectionPageHeader,
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
import { QQ_BINDING_GROUPS } from '../use-qq-binding';
import type { QQBindingController } from '../use-qq-binding';

type PasswordField = 'currentPassword' | 'newPassword' | 'repeatNewPassword';
type PasswordIssue = (typeof passwordChangeIssue)[keyof typeof passwordChangeIssue];
type PasswordErrors = Partial<Record<PasswordField, PasswordIssue>>;

export type AccountSettingsScreenProps = {
  onLogout: () => void;
  onUpdatePassword: (input: PasswordChangeInput) => Promise<boolean>;
  passwordUpdateError: AuthFailure | null;
  passwordUpdateStatus: MutationStatus;
  principal: SessionPrincipal;
  qqBinding: QQBindingController;
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

function AccountFactRow({
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
    <XStack
      minH="$6"
      py="$3"
      items="center"
      gap="$3"
      borderTopWidth={1}
      borderColor="$appBorder"
    >
      <YStack width="$2.5" shrink={0} items="center">
        <Icon size={14} color={colors.appAccent.val} strokeWidth={1.7} />
      </YStack>
      <XStack grow={1} minW={0} items="center" justify="space-between" gap="$3">
        <MonoText size="$2.5" shrink={1}>
          {label}
        </MonoText>
        <TerminalText
          size="$2.5"
          text="right"
          fontWeight="500"
          shrink={1}
          numberOfLines={2}
        >
          {value}
        </TerminalText>
      </XStack>
    </XStack>
  );
}

function AccountActionRow({
  expanded,
  icon: Icon,
  isLast = false,
  isLoading = false,
  label,
  onPress,
  statusColor,
  testID,
  value,
}: {
  expanded: boolean;
  icon: LucideIcon;
  isLast?: boolean;
  isLoading?: boolean;
  label: string;
  onPress: () => void;
  statusColor?: '$appMuted' | '$appSuccess' | '$appWarning';
  testID: string;
  value: string;
}) {
  const colors = getTokens().color;

  return (
    <Button
      unstyled
      testID={testID}
      width="100%"
      minH="$6"
      py="$3"
      flexDirection="row"
      items="center"
      gap="$3"
      borderTopWidth={1}
      borderBottomWidth={isLast ? 1 : 0}
      borderColor="$appBorder"
      rounded="$0"
      hoverStyle={{ bg: '$appAccentSubtle' }}
      pressStyle={{ opacity: 0.72 }}
      focusVisibleStyle={{ borderColor: '$appAccent' }}
      onPress={onPress}
      aria-haspopup="dialog"
      aria-expanded={expanded}
    >
      <YStack width="$2.5" shrink={0} items="center">
        <Icon size={14} color={colors.appAccent.val} strokeWidth={1.7} />
      </YStack>
      <XStack grow={1} minW={0} items="center" justify="space-between" gap="$3">
        <MonoText size="$2.5" shrink={1}>
          {label}
        </MonoText>
        <XStack shrink={1} minW={0} items="center" gap="$2">
          {isLoading ? <Spinner size="small" color="$appAccent" /> : null}
          {!isLoading && statusColor ? (
            <YStack width={6} height={6} rounded="$10" bg={statusColor} shrink={0} />
          ) : null}
          <TerminalText
            size="$2.5"
            text="right"
            fontWeight="500"
            color={statusColor ?? '$appText'}
            shrink={1}
          >
            {value}
          </TerminalText>
          <ChevronRight size={15} color={colors.appAccent.val} strokeWidth={1.7} />
        </XStack>
      </XStack>
    </Button>
  );
}

function AccountIdentityPanel({
  email,
  onOpenPasswordDialog,
  onOpenQQBindingDialog,
  passwordDialogOpen,
  passwordLabel,
  passwordValue,
  qqBindingDialogOpen,
  qqBindingLabel,
  qqBindingLoading,
  qqBindingStatusColor,
  qqBindingValue,
  registeredAt,
  registeredAtLabel,
  role,
  roleLabel,
  status,
  statusLabel,
  titleCode,
}: {
  email: string;
  onOpenPasswordDialog: () => void;
  onOpenQQBindingDialog: () => void;
  passwordDialogOpen: boolean;
  passwordLabel: string;
  passwordValue: string;
  qqBindingDialogOpen: boolean;
  qqBindingLabel: string;
  qqBindingLoading: boolean;
  qqBindingStatusColor?: '$appMuted' | '$appSuccess' | '$appWarning';
  qqBindingValue: string;
  registeredAt: string;
  registeredAtLabel: string;
  role: string;
  roleLabel: string;
  status: string;
  statusLabel: string;
  titleCode: string;
}) {
  const colors = getTokens().color;

  return (
    <YStack testID="account-identity-panel" gap="$4">
      <MonoText size="$2.5" color="$appAccent">
        {titleCode}
      </MonoText>

      <XStack items="center" gap="$4">
        <YStack
          width={64}
          height={64}
          shrink={0}
          items="center"
          justify="center"
          rounded="$10"
          borderWidth={1}
          borderColor="$appAccentBorder"
          bg="$appAccentSoft"
        >
          <UserRound size={28} color={colors.appAccent.val} strokeWidth={1.6} />
        </YStack>
        <YStack grow={1} minW={0} gap="$1.5">
          <TerminalText size="$4" lineHeight="$5" fontWeight="800" numberOfLines={2}>
            {email}
          </TerminalText>
          <XStack items="center" gap="$2">
            <MonoText size="$2">{roleLabel}</MonoText>
            <TerminalText size="$2.5" color="$appAccent" fontWeight="700">
              {role}
            </TerminalText>
          </XStack>
        </YStack>
      </XStack>

      <YStack>
        <AccountFactRow icon={CalendarClock} label={registeredAtLabel} value={registeredAt} />
        <AccountFactRow icon={ShieldCheck} label={statusLabel} value={status} />
        <AccountActionRow
          expanded={passwordDialogOpen}
          icon={KeyRound}
          label={passwordLabel}
          onPress={onOpenPasswordDialog}
          testID="account-password-trigger"
          value={passwordValue}
        />
        <AccountActionRow
          expanded={qqBindingDialogOpen}
          icon={MessageCircle}
          isLast
          isLoading={qqBindingLoading}
          label={qqBindingLabel}
          onPress={onOpenQQBindingDialog}
          {...(qqBindingStatusColor ? { statusColor: qqBindingStatusColor } : {})}
          testID="account-qq-binding-trigger"
          value={qqBindingValue}
        />
      </YStack>
    </YStack>
  );
}

function QQBindingStep({
  children,
  number,
  title,
}: {
  children: ReactNode;
  number: string;
  title: string;
}) {
  return (
    <YStack gap="$2.5" p="$3" borderWidth={1} borderColor="$appBorder" bg="$appSurfaceRaisedTranslucent">
      <XStack items="center" gap="$2.5">
        <YStack
          width="$2.5"
          height="$2.5"
          items="center"
          justify="center"
          borderWidth={1}
          borderColor="$appAccentBorder"
          bg="$appAccentSoft"
        >
          <MonoText size="$1" color="$appAccent" fontWeight="700">
            {number}
          </MonoText>
        </YStack>
        <TerminalText size="$3" fontWeight="700">
          {title}
        </TerminalText>
      </XStack>
      {children}
    </YStack>
  );
}

function QQBindingDialog({ controller }: { controller: QQBindingController }) {
  const { t } = useTranslation('settings');
  const colors = getTokens().color;
  const state = controller.state;
  const isInitialLoading = controller.queryStatus === 'pending' && !state;
  const hasQueryError = controller.queryStatus === 'error';
  const errorMessage = controller.error?.kind === 'invalid-response'
    ? t('account.qqBinding.errors.invalidResponse')
    : controller.error?.code === 'session-expired'
      ? t('account.qqBinding.errors.sessionExpired')
      : t('account.qqBinding.errors.unavailable');

  return (
    <AdaptiveDialog
      open={controller.dialogOpen}
      onOpenChange={controller.setDialogOpen}
      testIDPrefix="account-qq-binding"
    >
      <YStack testID="account-qq-binding-panel" gap="$4">
        <YStack gap="$1.5" pr="$5">
          <MonoText size="$2.5" color="$appAccent">
            {t('account.qqBinding.code')}
          </MonoText>
          <Dialog.Title
            size="$5.5"
            lineHeight="$6"
            color="$appText"
            fontFamily="$heading"
            fontWeight="700"
          >
            {t('account.qqBinding.title')}
          </Dialog.Title>
          <Dialog.Description size="$2.5" lineHeight="$3" color="$appMuted">
            {state?.status === 'bound'
              ? t('account.qqBinding.boundDescription')
              : t('account.qqBinding.description')}
          </Dialog.Description>
        </YStack>

        {isInitialLoading ? (
          <YStack minH="$8" items="center" justify="center" gap="$3" aria-live="polite">
            <Spinner color="$appAccent" />
            <MonoText size="$2.5">{t('account.qqBinding.checkingStatus')}</MonoText>
          </YStack>
        ) : null}

        {hasQueryError ? (
          <YStack gap="$3" p="$3" borderWidth={1} borderColor="$appWarning" bg="$appWarningSoft">
            <MonoText size="$2.5" color="$appWarning" aria-live="polite">
              {errorMessage}
            </MonoText>
            <Button
              unstyled
              testID="account-qq-binding-retry"
              minH="$4.5"
              flexDirection="row"
              items="center"
              justify="center"
              gap="$2"
              borderWidth={1}
              borderColor="$appWarning"
              hoverStyle={{ opacity: 0.86 }}
              pressStyle={{ opacity: 0.7 }}
              onPress={controller.retry}
            >
              <RefreshCw size={15} color={colors.appWarning.val} strokeWidth={1.8} />
              <TerminalText size="$2.5" color="$appWarning" fontWeight="700">
                {t('account.qqBinding.retry')}
              </TerminalText>
            </Button>
          </YStack>
        ) : null}

        {!hasQueryError && state?.status === 'bound' ? (
          <YStack gap="$4">
            <YStack
              testID="account-qq-binding-bound"
              items="center"
              gap="$3"
              p="$5"
              borderWidth={1}
              borderColor="$appSuccess"
              bg="$appSuccessSoft"
            >
              <YStack
                width="$6"
                height="$6"
                rounded="$10"
                items="center"
                justify="center"
                borderWidth={1}
                borderColor="$appSuccess"
              >
                <CheckCircle2 size={28} color={colors.appSuccess.val} strokeWidth={1.7} />
              </YStack>
              <TerminalText size="$4" color="$appSuccess" fontWeight="800" text="center">
                {t('account.qqBinding.boundTitle')}
              </TerminalText>
              <MonoText size="$2.5" lineHeight="$3" text="center">
                {t('account.qqBinding.boundMessage')}
              </MonoText>
            </YStack>
            <Button
              unstyled
              testID="account-qq-binding-done"
              minH="$5"
              items="center"
              justify="center"
              borderWidth={1}
              borderColor="$appAccent"
              bg="$appAccentSoft"
              hoverStyle={{ bg: '$appSurfaceRaised' }}
              pressStyle={{ opacity: 0.72 }}
              onPress={() => controller.setDialogOpen(false)}
            >
              <TerminalText size="$3" color="$appAccent" fontWeight="700">
                {t('account.qqBinding.done')}
              </TerminalText>
            </Button>
          </YStack>
        ) : null}

        {!hasQueryError && state?.status === 'unbound' ? (
          <YStack gap="$3">
            <QQBindingStep number="01" title={t('account.qqBinding.steps.copyTitle')}>
              <MonoText size="$2.5" lineHeight="$3">
                {t('account.qqBinding.steps.copyDescription')}
              </MonoText>
              <XStack
                minH="$5"
                items="center"
                gap="$2"
                px="$3"
                py="$2"
                borderWidth={1}
                borderColor="$appAccentBorder"
                bg="$appBackground"
              >
                <MonoText
                  testID="account-qq-binding-code"
                  grow={1}
                  minW={0}
                  size="$2.5"
                  color="$appAccent"
                  selectable
                >
                  {state.verificationCode}
                </MonoText>
                <Button
                  unstyled
                  testID="account-qq-binding-copy"
                  minH="$3.5"
                  px="$2.5"
                  flexDirection="row"
                  items="center"
                  gap="$1.5"
                  borderWidth={1}
                  borderColor="$appAccentBorder"
                  bg="$appAccentSoft"
                  pressStyle={{ opacity: 0.7 }}
                  disabled={controller.copyStatus === 'copying'}
                  onPress={() => void controller.copyVerificationCode()}
                >
                  {controller.copyStatus === 'copying'
                    ? <Spinner size="small" color="$appAccent" />
                    : <Copy size={14} color={colors.appAccent.val} strokeWidth={1.8} />}
                  <TerminalText size="$2" color="$appAccent" fontWeight="700">
                    {controller.copyStatus === 'copied'
                      ? t('account.qqBinding.copied')
                      : t('account.qqBinding.copy')}
                  </TerminalText>
                </Button>
              </XStack>
              {controller.copyStatus === 'error' ? (
                <MonoText size="$2" color="$appWarning" aria-live="polite">
                  {t('account.qqBinding.errors.copyFailed')}
                </MonoText>
              ) : null}
            </QQBindingStep>

            <QQBindingStep number="02" title={t('account.qqBinding.steps.groupTitle')}>
              <MonoText size="$2.5" lineHeight="$3">
                {t('account.qqBinding.steps.groupDescription')}
              </MonoText>
              <XStack flexDirection="column" gap="$2" $large={{ flexDirection: 'row' }}>
                {QQ_BINDING_GROUPS.map((group) => (
                  <Button
                    unstyled
                    key={group.id}
                    testID={`account-qq-binding-group-${group.id}`}
                    grow={1}
                    minH="$5"
                    px="$3"
                    flexDirection="row"
                    items="center"
                    justify="space-between"
                    gap="$2"
                    borderWidth={1}
                    borderColor="$appBorder"
                    bg="$appSurfaceRaised"
                    hoverStyle={{ borderColor: '$appAccentBorder', bg: '$appAccentSubtle' }}
                    pressStyle={{ opacity: 0.72 }}
                    onPress={() => void controller.openGroup(group)}
                  >
                    <XStack items="center" gap="$2">
                      <MessageCircle size={16} color={colors.appAccent.val} strokeWidth={1.7} />
                      <YStack gap="$0.5">
                        <MonoText size="$1" color="$appAccent">
                          {t(`account.qqBinding.groups.${group.id}`)}
                        </MonoText>
                        <TerminalText size="$2.5" fontWeight="700">
                          {group.number}
                        </TerminalText>
                      </YStack>
                    </XStack>
                    <ExternalLink size={15} color={colors.appMuted.val} strokeWidth={1.7} />
                  </Button>
                ))}
              </XStack>
              {controller.groupOpenFailed ? (
                <MonoText size="$2" color="$appWarning" aria-live="polite">
                  {t('account.qqBinding.errors.openGroupFailed')}
                </MonoText>
              ) : null}
            </QQBindingStep>

            <QQBindingStep number="03" title={t('account.qqBinding.steps.verifyTitle')}>
              <MonoText size="$2.5" lineHeight="$3">
                {t('account.qqBinding.steps.verifyDescription')}
              </MonoText>
              {controller.timedOut ? (
                <MonoText size="$2.5" color="$appWarning" aria-live="polite">
                  {t('account.qqBinding.timedOut')}
                </MonoText>
              ) : null}
              {controller.isChecking ? (
                <XStack items="center" gap="$2" aria-live="polite">
                  <Spinner size="small" color="$appAccent" />
                  <MonoText size="$2.5" color="$appAccent">
                    {t('account.qqBinding.detecting')}
                  </MonoText>
                </XStack>
              ) : null}
              <Button
                unstyled
                testID={controller.isChecking
                  ? 'account-qq-binding-stop-checking'
                  : 'account-qq-binding-start-checking'}
                minH="$5"
                flexDirection="row"
                items="center"
                justify="center"
                gap="$2"
                borderWidth={1}
                borderColor="$appAccent"
                bg={controller.isChecking ? '$appSurfaceRaised' : '$appAccentSoft'}
                hoverStyle={{ bg: '$appAccentSubtle' }}
                pressStyle={{ opacity: 0.72 }}
                onPress={controller.isChecking ? controller.stopChecking : controller.startChecking}
              >
                {controller.isChecking
                  ? <StopCircle size={16} color={colors.appAccent.val} strokeWidth={1.8} />
                  : <Radio size={16} color={colors.appAccent.val} strokeWidth={1.8} />}
                <TerminalText size="$3" color="$appAccent" fontWeight="700">
                  {controller.isChecking
                    ? t('account.qqBinding.stopDetecting')
                    : t('account.qqBinding.startDetecting')}
                </TerminalText>
              </Button>
            </QQBindingStep>
          </YStack>
        ) : null}
      </YStack>
    </AdaptiveDialog>
  );
}

function AccountLogoutButton({ onLogout }: { onLogout: () => void }) {
  const { t } = useTranslation('settings');
  const { t: tCommon } = useTranslation('common');
  const colors = getTokens().color;
  const { large } = useMedia();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  if (large) return null;

  const handleLogout = () => {
    setConfirmingLogout(false);
    onLogout();
  };

  return (
    <YStack
      testID="account-logout-footer"
      mt="auto"
      pt="$4"
      borderTopWidth={1}
      borderColor="$appBorder"
    >
      <AdaptiveDialog
        open={confirmingLogout}
        onOpenChange={setConfirmingLogout}
        testIDPrefix="account-logout"
        trigger={(
          <Button
            unstyled
            testID="account-logout-trigger"
            width="100%"
            minH="$4.5"
            px="$3"
            flexDirection="row"
            items="center"
            justify="center"
            gap="$2"
            rounded="$0"
            borderWidth={0}
            bg="transparent"
            hoverStyle={{ bg: '$appDangerSoft' }}
            pressStyle={{ opacity: 0.7 }}
            focusVisibleStyle={{ borderColor: '$appDanger' }}
            aria-label={tCommon('actions.logout')}
          >
            <LogOut size={16} color={colors.appDanger.val} strokeWidth={1.8} />
            <TerminalText size="$3" color="$appDanger" fontWeight="700">
              {tCommon('actions.logout')}
            </TerminalText>
          </Button>
        )}
      >
        <YStack gap="$4">
          <YStack gap="$2" pr="$5">
            <Dialog.Title
              size="$5"
              color="$appText"
              fontFamily="$heading"
              fontWeight="800"
            >
              {t('account.logout.confirmTitle')}
            </Dialog.Title>
            <Dialog.Description size="$2.5" lineHeight="$3" color="$appMuted">
              {t('account.logout.confirmDescription')}
            </Dialog.Description>
          </YStack>

          <XStack gap="$2.5">
            <Button
              unstyled
              testID="account-logout-cancel"
              grow={1}
              minH="$4.5"
              items="center"
              justify="center"
              borderWidth={1}
              borderColor="$appBorder"
              bg="$appSurfaceRaisedTranslucent"
              hoverStyle={{ bg: '$appSurfaceRaised' }}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => setConfirmingLogout(false)}
            >
              <TerminalText size="$2.5" fontWeight="700">
                {tCommon('actions.cancel')}
              </TerminalText>
            </Button>
            <Button
              unstyled
              testID="account-logout-confirm"
              grow={1}
              minH="$4.5"
              flexDirection="row"
              items="center"
              justify="center"
              gap="$2"
              borderWidth={1}
              borderColor="$appDanger"
              bg="$appDanger"
              hoverStyle={{ opacity: 0.88 }}
              pressStyle={{ opacity: 0.7 }}
              focusVisibleStyle={{ borderColor: '$appText' }}
              onPress={handleLogout}
            >
              <LogOut size={15} color={colors.appBackground.val} strokeWidth={2} />
              <TerminalText size="$2.5" color="$appBackground" fontWeight="800">
                {t('account.logout.confirm')}
              </TerminalText>
            </Button>
          </XStack>
        </YStack>
      </AdaptiveDialog>
    </YStack>
  );
}

export function AccountSettingsScreen({
  onLogout,
  onUpdatePassword,
  passwordUpdateError,
  passwordUpdateStatus,
  principal,
  qqBinding,
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
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const role = hasSuperAdminPermission(principal.permission) ? 'administrator' : 'member';
  const registeredAt = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(principal.registeredAt));
  const translatedPasswordUpdateError = authFailureMessage(passwordUpdateError, t, 'account');
  const showPasswordUpdateSuccess = passwordUpdateStatus === 'success' && passwordWasUpdated;
  const qqBindingRowValue = qqBinding.queryStatus === 'pending'
    ? t('account.qqBinding.checkingStatus')
    : qqBinding.queryStatus === 'error'
      ? t('account.qqBinding.unavailableStatus')
      : qqBinding.state?.status === 'bound'
        ? t('account.qqBinding.boundStatus')
        : t('account.qqBinding.unboundStatus');
  const qqBindingRowColor = qqBinding.queryStatus === 'error'
    ? '$appWarning'
    : qqBinding.state?.status === 'bound'
      ? '$appSuccess'
      : '$appMuted';

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

  const resetPasswordEditor = () => {
    setCurrentPassword('');
    setNewPassword('');
    setRepeatNewPassword('');
    setVisiblePasswordField(null);
    setPasswordErrors({});
    setPasswordWasUpdated(false);
  };

  const handlePasswordDialogOpenChange = (open: boolean) => {
    setPasswordDialogOpen(open);
    if (!open) resetPasswordEditor();
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
          eyebrow={t('account.eyebrow')}
          status={t('account.status')}
          title={t('account.title')}
        />
      )}
    >
      <YStack
        testID="account-settings-content"
        grow={1}
        width="100%"
        maxW={760}
        self="center"
        gap="$5"
        $large={{ gap: '$6' }}
      >
        <AccountIdentityPanel
          email={principal.email}
          onOpenPasswordDialog={() => setPasswordDialogOpen(true)}
          onOpenQQBindingDialog={() => qqBinding.setDialogOpen(true)}
          passwordDialogOpen={passwordDialogOpen}
          passwordLabel={t('account.passwordCode')}
          passwordValue={t('account.passwordTitle')}
          qqBindingDialogOpen={qqBinding.dialogOpen}
          qqBindingLabel={t('account.qqBinding.rowLabel')}
          qqBindingLoading={qqBinding.queryStatus === 'pending'}
          qqBindingStatusColor={qqBindingRowColor}
          qqBindingValue={qqBindingRowValue}
          registeredAt={registeredAt}
          registeredAtLabel={t('account.registeredAt')}
          role={t(`account.roles.${role}`)}
          roleLabel={t('account.role')}
          status={t(`account.identityStatuses.${principal.status}`)}
          statusLabel={t('account.identityStatus')}
          titleCode={t('account.identityCode')}
        />

        <AdaptiveDialog
          dismissible={passwordUpdateStatus !== 'pending'}
          open={passwordDialogOpen}
          onOpenChange={handlePasswordDialogOpenChange}
          testIDPrefix="account-password"
        >
          <Form onSubmit={handlePasswordSubmit}>
            <YStack testID="account-password-panel" gap="$4">
              <YStack gap="$1.5" pr="$5">
                <MonoText size="$2.5" color="$appAccent">
                  {t('account.passwordCode')}
                </MonoText>
                <Dialog.Title
                  size="$5.5"
                  lineHeight="$6"
                  color="$appText"
                  fontFamily="$heading"
                  fontWeight="700"
                >
                  {t('account.passwordTitle')}
                </Dialog.Title>
              </YStack>

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

              <Form.Trigger asChild>
                <Button
                  testID="account-password-submit"
                  position="relative"
                  overflow="hidden"
                  width="100%"
                  minH="$5"
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
                >
                  <CornerBrackets />
                  <XStack items="center" gap="$2">
                    {passwordUpdateStatus === 'pending'
                      ? <Spinner size="small" color="$appAccent" />
                      : <ShieldCheck size={16} color={colors.appAccent.val} strokeWidth={1.8} />}
                    <TerminalText size="$3" color="$appAccent" fontWeight="700">
                      {t('account.submitPassword')}
                    </TerminalText>
                  </XStack>
                </Button>
              </Form.Trigger>
              {translatedPasswordUpdateError ? (
                <MonoText size="$2.5" color="$appWarning" aria-live="polite">
                  {translatedPasswordUpdateError}
                </MonoText>
              ) : null}
              {showPasswordUpdateSuccess ? (
                <MonoText size="$2.5" color="$appSuccess" aria-live="polite">
                  {t('account.passwordUpdated')}
                </MonoText>
              ) : null}
            </YStack>
          </Form>
        </AdaptiveDialog>

        <QQBindingDialog controller={qqBinding} />

        <AccountLogoutButton onLogout={onLogout} />
      </YStack>
    </SettingsPage>
  );
}
