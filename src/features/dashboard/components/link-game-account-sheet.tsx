import { LockKeyhole, Plus, Server, UserRound, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Sheet, XStack, YStack, getTokens } from 'tamagui';

import { MonoText, TerminalPasswordVisibilityButton, TerminalSectionHeading, TerminalText, TerminalTextField } from '@/components';
import { useBackDismissal } from '@/hooks/use-back-dismissal';
import type { LinkGameAccountCredentials, ServerChannel } from '@/schemas/game-account';

export function LinkGameAccountSheet({ open, onOpenChange, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; onSubmit: (credentials: LinkGameAccountCredentials) => void }) {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const colors = getTokens().color;
  const [accountIdentifier, setAccountIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [serverChannel, setServerChannel] = useState<ServerChannel>('官服');
  const [showPassword, setShowPassword] = useState(false);
  const [hasValidationError, setHasValidationError] = useState(false);
  const validationMessage = hasValidationError ? `// ${t('account.required')}` : null;
  const handleClose = useCallback(() => {
    setHasValidationError(false);
    onOpenChange(false);
  }, [onOpenChange]);
  useBackDismissal(open, handleClose);
  const handleSubmit = () => {
    if (!accountIdentifier.trim() || !password.trim()) {
      setHasValidationError(true);
      return;
    }
    onSubmit({ accountIdentifier: accountIdentifier.trim(), password, serverChannel });
    setAccountIdentifier(''); setPassword(''); setHasValidationError(false); setServerChannel('官服'); onOpenChange(false);
  };
  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPointsMode="fit" dismissOnSnapToBottom zIndex={100000} transition="400ms">
      <Sheet.Overlay transition="300ms" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} bg="$appScrim" />
      <Sheet.Frame maxW={460} width="100%" self="center" bg="$appSurfaceStrong" borderWidth={1} borderColor="$appBorder" px={20} pt={20} pb={20} $platform-web={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}>
        <XStack mb={20} items="center" justify="space-between">
          <TerminalSectionHeading code="NEW" title={t('account.title')} subtitle={t('account.subtitle')} />
          <Button unstyled width={28} height={28} items="center" justify="center" borderWidth={1} borderColor="$appBorder" onPress={handleClose} aria-label={tCommon('actions.close')}><X size={16} color={colors.appMuted.val} /></Button>
        </XStack>
        <YStack gap={16}>
          <YStack gap={6}>
            <XStack items="center" gap={4}><Server size={12} color={colors.appMuted.val} /><MonoText size="$1">{t('account.serverChannelLabel')}</MonoText></XStack>
            <XStack gap={8}>
              {(['官服', 'B服'] as const).map((item) => (
                <Button key={item} unstyled grow={1} px={12} py={10} items="flex-start" borderWidth={1} borderColor={serverChannel === item ? '$appAccentBorder' : '$appBorder'} bg={serverChannel === item ? '$appAccentSoft' : 'transparent'} onPress={() => setServerChannel(item)} $platform-web={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
                  <TerminalText size="$3" fontWeight="700" color={serverChannel === item ? '$appAccent' : '$appMuted'}>{item}</TerminalText>
                  <MonoText size="$1">{item === '官服' ? 'OFFICIAL' : 'BILIBILI'}</MonoText>
                </Button>
              ))}
            </XStack>
          </YStack>
          <TerminalTextField surface="translucent" icon={UserRound} label={t('account.accountIdentifierLabel')} value={accountIdentifier} onChangeText={(value) => { setAccountIdentifier(value); setHasValidationError(false); }} placeholder={t('account.accountIdentifierPlaceholder')} />
          <TerminalTextField
            surface="translucent"
            icon={LockKeyhole}
            label={t('account.passwordLabel')}
            value={password}
            onChangeText={(value) => { setPassword(value); setHasValidationError(false); }}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            trailing={(
              <TerminalPasswordVisibilityButton
                hideLabel={tCommon('accessibility.hidePassword')}
                showLabel={tCommon('accessibility.showPassword')}
                isPasswordVisible={showPassword}
                onPress={() => setShowPassword((value) => !value)}
              />
            )}
          />
          <MonoText size="$1" lineHeight="$2">{t('account.credentialNotice')}</MonoText>
          {validationMessage ? <MonoText size="$2" color="$appWarning">{validationMessage}</MonoText> : null}
          <XStack mt={4} gap={8}>
            <Button grow={1} height={46} rounded="$0" borderWidth={1} borderColor="$appBorder" bg="transparent" onPress={handleClose}><TerminalText size="$3" fontWeight="700" letterSpacing={2.8} color="$appMuted">{tCommon('actions.cancel')}</TerminalText></Button>
            <Button grow={2} height={46} rounded="$0" borderWidth={1} borderColor="$appAccentBorder" bg="$appAccentSoft" onPress={handleSubmit}><Plus size={16} color={colors.appAccent.val} /><TerminalText size="$3" color="$appAccent" fontWeight="700" letterSpacing={2.8}>{t('account.bind')}</TerminalText></Button>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
