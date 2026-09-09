import { Check, X } from 'lucide-react-native';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Adapt,
  Button,
  Dialog,
  Form,
  Sheet,
  Spinner,
  Unspaced,
  XStack,
  YStack,
  getTokens,
  useMedia,
} from 'tamagui';

import { MonoText } from '@/components';
import { useBackDismissal } from '@/hooks/use-back-dismissal';

type AdaptiveEditorDialogProps = {
  children: (close: () => void) => ReactNode;
  trigger: ReactElement;
  wide?: boolean;
};

export function AdaptiveEditorDialog({
  children,
  trigger,
  wide = false,
}: AdaptiveEditorDialogProps) {
  const colors = getTokens().color;
  const { large } = useMedia();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useBackDismissal(open, close);

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Adapt when={!large} platform="touch">
        <Sheet
          zIndex={200000}
          modal
          dismissOnSnapToBottom
          dismissOnOverlayPress
          moveOnKeyboardChange
          snapPointsMode="fit"
        >
          <Sheet.Overlay bg="$appScrim" />
          <Sheet.Handle bg="$appBorder" />
          <Sheet.Frame
            maxH="90%"
            bg="$appSurfaceStrong"
            borderTopWidth={1}
            borderColor="$appAccentBorder"
            borderTopLeftRadius="$4"
            borderTopRightRadius="$4"
          >
            <Sheet.ScrollView
              keyboardDismissMode={
                process.env.EXPO_OS === 'ios' ? 'interactive' : 'on-drag'
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <YStack p="$4" pb="$8">
                <Adapt.Contents />
              </YStack>
            </Sheet.ScrollView>
          </Sheet.Frame>
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay opacity={0.8} bg="$appScrim" />
        <Dialog.Content
          bordered
          elevate
          width="92%"
          maxH="90%"
          maxW={wide ? 1120 : 520}
          p="$4.5"
          gap="$4"
          bg={wide ? '$appBackground' : '$appSurfaceStrong'}
          borderWidth={1}
          borderColor="$appAccentBorder"
          rounded="$0"
        >
          {children(close)}

          <Unspaced>
            <Dialog.Close asChild>
              <Button
                testID="hosting-config-dialog-close"
                position="absolute"
                t="$3"
                r="$3"
                unstyled
                p="$1"
              >
                <X size={16} color={colors.appMuted.val} />
              </Button>
            </Dialog.Close>
          </Unspaced>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

export function EditorActions({
  canSave,
  isSubmitting,
  onCancel,
  solid = false,
}: {
  canSave: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  solid?: boolean;
}) {
  const { t } = useTranslation('dashboard');
  const colors = getTokens().color;
  const { large } = useMedia();
  const textSize = large ? '$2' : '$2.5';
  const disabled = !canSave || isSubmitting;

  return (
    <XStack items="center" justify="flex-end" gap="$2">
      <Button
        testID="hosting-config-dialog-cancel"
        unstyled minH="$4" px="$3" py="$2"
        hoverStyle={{ bg: '$appSurfaceRaised' }}
        pressStyle={{ opacity: 0.7 }}
        disabled={isSubmitting}
        onPress={onCancel}
      >
        <MonoText size={textSize}>{t('hostingConfig.dialog.cancel')}</MonoText>
      </Button>
      <Form.Trigger asChild>
        <Button
          testID="hosting-config-submit"
          unstyled minH="$4" px="$4" py="$2" items="center" justify="center"
          borderWidth={1} borderColor="$appAccent"
          bg={solid ? '$appAccent' : '$appAccentSoft'}
          opacity={disabled ? 0.4 : 1}
          hoverStyle={solid ? { opacity: 0.85 } : { bg: '$appSurfaceRaised' }}
          pressStyle={{ opacity: 0.7 }}
          disabled={disabled}
        >
          <XStack items="center" justify="center" gap="$2">
            {isSubmitting ? (
              <Spinner size="small" color={solid ? '$appBackground' : '$appAccent'} />
            ) : (
              <Check size={14} color={solid ? colors.appBackground.val : colors.appAccent.val} />
            )}
            <MonoText
              size={textSize}
              color={solid ? '$appBackground' : '$appAccent'}
              fontWeight="700"
            >
              {t('hostingConfig.dialog.save')}
            </MonoText>
          </XStack>
        </Button>
      </Form.Trigger>
    </XStack>
  );
}
