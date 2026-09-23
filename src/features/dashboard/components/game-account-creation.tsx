import { KeyRound, Plus, Server, UserRound } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, Form, RadioGroup, Spinner, XStack, YStack, getTokens, styled } from 'tamagui';
import * as v from 'valibot';

import {
  AdaptiveDialog,
  MonoText,
  TerminalNotice,
  TerminalPasswordVisibilityButton,
  TerminalText,
  TerminalTextField,
} from '@/components';
import type { TerminalTextFieldHandle } from '@/components';
import {
  ARK_HOST_GAME_PLATFORM,
  arkHostCreateGameInputSchema,
} from '@/schemas/arkhost';
import type { ArkHostCreateGameInput, ArkHostGamePlatform } from '@/schemas/arkhost';

const CreationButton = styled(Button, {
  name: 'GameAccountCreationButton',
  unstyled: true,
  minH: '$4.5',
  px: '$3',
  items: 'center',
  justify: 'center',
  flexDirection: 'row',
  gap: '$2',
  rounded: '$0',
  borderWidth: 1,
  borderColor: '$appAccentBorder',
  bg: '$appAccentSoft',
  hoverStyle: { borderColor: '$appAccent', bg: '$appAccentSubtle' },
  pressStyle: { opacity: 0.7 },
  focusVisibleStyle: {
    outlineColor: '$appText',
    outlineStyle: 'solid',
    outlineWidth: 2,
  },
  disabledStyle: { opacity: 0.5 },
  variants: {
    tone: {
      secondary: {
        borderColor: '$appBorder',
        bg: '$appSurfaceRaised',
        hoverStyle: { borderColor: '$appAccentBorder', bg: '$appSurfaceRaised' },
      },
    },
  } as const,
});

type InvalidField = 'account' | 'password' | null;

type GameAccountCreationDialogProps = {
  error: string | null;
  isPending: boolean;
  onClearError: () => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: ArkHostCreateGameInput) => Promise<void>;
  open: boolean;
};

export function GameAccountCreationDialog({
  error,
  isPending,
  onClearError,
  onOpenChange,
  onSubmit,
  open,
}: GameAccountCreationDialogProps) {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const colors = getTokens().color;
  const accountRef = useRef<TerminalTextFieldHandle>(null);
  const passwordRef = useRef<TerminalTextFieldHandle>(null);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [platform, setPlatform] = useState<ArkHostGamePlatform>(ARK_HOST_GAME_PLATFORM.official);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [invalid, setInvalid] = useState<InvalidField>(null);
  const busy = isPending;

  const reset = () => {
    setAccount('');
    setPassword('');
    setPlatform(ARK_HOST_GAME_PLATFORM.official);
    setPasswordVisible(false);
    setInvalid(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && busy) return;
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const edit = () => {
    setInvalid(null);
    onClearError();
  };

  const submit = async () => {
    if (busy) return;
    const parsed = v.safeParse(arkHostCreateGameInputSchema, {
      account,
      password,
      platform,
    });
    if (!parsed.success) {
      const field = parsed.issues[0]?.path?.at(-1)?.key === 'password'
        ? 'password'
        : 'account';
      setInvalid(field);
      (field === 'password' ? passwordRef : accountRef).current?.focus();
      return;
    }

    try {
      await onSubmit(parsed.output);
      reset();
      onOpenChange(false);
    } catch {
      // The owning hook exposes the failure below so the form remains retryable.
    }
  };

  return (
    <AdaptiveDialog
      dismissible={!busy}
      open={open}
      onOpenChange={handleOpenChange}
      testIDPrefix="create-game-account"
    >
      <YStack gap="$1" pr="$5">
        <Dialog.Title color="$appText" size="$6" fontWeight="800">
          {t('account.title')}
        </Dialog.Title>
      </YStack>

      <Form onSubmit={() => { void submit(); }} gap="$3.5">
        <YStack gap="$1.5">
          <MonoText size="$2.5" textTransform="uppercase">
            {t('account.serverChannelLabel')}
          </MonoText>
          <RadioGroup
            value={String(platform)}
            disabled={busy}
            onValueChange={(value) => {
              const nextPlatform = value === String(ARK_HOST_GAME_PLATFORM.bilibili)
                ? ARK_HOST_GAME_PLATFORM.bilibili
                : ARK_HOST_GAME_PLATFORM.official;
              setPlatform(nextPlatform);
              edit();
            }}
            aria-label={t('account.serverChannelLabel')}
          >
            <XStack gap="$2" flexWrap="wrap">
              {([
                [ARK_HOST_GAME_PLATFORM.official, 'account.channels.official'],
                [ARK_HOST_GAME_PLATFORM.bilibili, 'account.channels.bilibili'],
              ] as const).map(([value, labelKey]) => {
                const selected = platform === value;
                return (
                  <RadioGroup.Item
                    key={value}
                    id={`create-game-platform-${value}`}
                    value={String(value)}
                    disabled={busy}
                    asChild
                    unstyled
                  >
                    <Button
                      testID={`create-game-platform-${value}`}
                      unstyled
                      grow={1}
                      flexBasis={150}
                      minW={0}
                      minH="$5"
                      px="$3"
                      items="center"
                      justify="center"
                      flexDirection="row"
                      gap="$2"
                      rounded="$0"
                      borderWidth={1}
                      borderColor={selected ? '$appAccent' : '$appBorder'}
                      bg={selected ? '$appAccentSoft' : '$appSurfaceRaised'}
                      disabled={busy}
                      hoverStyle={{ borderColor: '$appAccentBorder' }}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <Server size={16} color={selected ? colors.appAccent.val : colors.appMuted.val} />
                      <TerminalText
                        size="$2.5"
                        color={selected ? '$appAccent' : '$appText'}
                        fontWeight={selected ? '700' : '500'}
                        numberOfLines={2}
                        text="center"
                      >
                        {t(labelKey)}
                      </TerminalText>
                    </Button>
                  </RadioGroup.Item>
                );
              })}
            </XStack>
          </RadioGroup>
        </YStack>

        <TerminalTextField
          ref={accountRef}
          icon={UserRound}
          label={t('account.accountIdentifierLabel')}
          value={account}
          disabled={busy}
          autoComplete="username"
          enterKeyHint="next"
          returnKeyType="next"
          onChangeText={(value) => {
            setAccount(value);
            edit();
          }}
          onSubmitEditing={() => passwordRef.current?.focus()}
          {...(invalid === 'account' ? { error: t('account.errors.accountRequired') } : {})}
        />

        <TerminalTextField
          ref={passwordRef}
          icon={KeyRound}
          label={t('account.passwordLabel')}
          value={password}
          disabled={busy}
          autoComplete="current-password"
          enterKeyHint="go"
          returnKeyType="go"
          secureTextEntry={!passwordVisible}
          onChangeText={(value) => {
            setPassword(value);
            edit();
          }}
          onSubmitEditing={() => { void submit(); }}
          {...(invalid === 'password' ? { error: t('account.errors.passwordRequired') } : {})}
          trailing={(
            <TerminalPasswordVisibilityButton
              isPasswordVisible={passwordVisible}
              hideLabel={tCommon('accessibility.hidePassword')}
              showLabel={tCommon('accessibility.showPassword')}
              onPress={() => setPasswordVisible((visible) => !visible)}
            />
          )}
        />

        {error ? <TerminalNotice tone="danger">{error}</TerminalNotice> : null}

        <XStack gap="$2" flexWrap="wrap">
          <CreationButton
            tone="secondary"
            grow={1}
            flexBasis={140}
            disabled={busy}
            onPress={() => handleOpenChange(false)}
          >
            <TerminalText size="$2.5">{tCommon('actions.cancel')}</TerminalText>
          </CreationButton>
          <Form.Trigger asChild>
            <CreationButton
              testID="create-game-account-submit"
              grow={1}
              flexBasis={180}
              disabled={busy}
              aria-busy={busy}
            >
              {busy
                ? <Spinner size="small" color="$appAccent" />
                : <Plus size={17} color={colors.appAccent.val} />}
              <TerminalText size="$2.5" color="$appAccent" fontWeight="700">
                {t(busy ? 'account.submitting' : 'account.submit')}
              </TerminalText>
            </CreationButton>
          </Form.Trigger>
        </XStack>
      </Form>
    </AdaptiveDialog>
  );
}

export function EmptyGameAccountState({
  onAddGameAccount,
}: {
  onAddGameAccount: () => void;
}) {
  const { t } = useTranslation('dashboard');
  const colors = getTokens().color;

  return (
    <YStack grow={1} items="center" justify="center" p="$4">
      <YStack
        width="100%"
        maxW={480}
        items="center"
        gap="$3"
        p="$5"
        borderWidth={1}
        borderColor="$appBorder"
        bg="$appSurface"
      >
        <YStack
          width="$6"
          height="$6"
          items="center"
          justify="center"
          borderWidth={1}
          borderColor="$appAccentBorder"
          bg="$appAccentSoft"
          rounded="$10"
        >
          <UserRound size={26} color={colors.appAccent.val} />
        </YStack>
        <TerminalText size="$5" fontWeight="800" text="center">
          {t('account.emptyTitle')}
        </TerminalText>
        <MonoText size="$2" text="center" maxW={380}>
          {t('account.emptyDescription')}
        </MonoText>
        <CreationButton mt="$2" onPress={onAddGameAccount}>
          <Plus size={17} color={colors.appAccent.val} />
          <TerminalText size="$2.5" color="$appAccent" fontWeight="700">
            {t('account.add')}
          </TerminalText>
        </CreationButton>
      </YStack>
    </YStack>
  );
}
