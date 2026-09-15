import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, YStack } from 'tamagui';
import { VerificationSurface } from './verification-surface';
import { finishVerification } from './verification-runtime';
import { useVerificationRequest } from './use-verification-request';

export function VerificationHost() {
  const request = useVerificationRequest();
  const { t } = useTranslation('auth');
  useEffect(() => {
    if (!request) return undefined;
    return () => finishVerification(request, null);
  }, [request]);
  if (!request) return null;
  if (request.kind !== 'game') return <YStack position="absolute" width={1} height={1} overflow="hidden" opacity={0}><VerificationSurface request={request} /></YStack>;
  return <Dialog open onOpenChange={(open) => { if (!open) finishVerification(request, null); }}>
    <Dialog.Portal><Dialog.Overlay /><Dialog.Content width="95%" maxW={440} p="$3" gap="$3">
      <Dialog.Title>{t('verification.title', { account: request.account })}</Dialog.Title>
      <YStack height={440}><VerificationSurface request={request} /></YStack>
      <Button onPress={() => finishVerification(request, null)}>{t('verification.cancel')}</Button>
    </Dialog.Content></Dialog.Portal>
  </Dialog>;
}
