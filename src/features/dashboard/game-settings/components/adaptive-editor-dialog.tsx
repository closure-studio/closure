import { X } from 'lucide-react-native';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';
import {
  Adapt,
  Button,
  Dialog,
  Sheet,
  Unspaced,
  YStack,
  getTokens,
  useMedia,
} from 'tamagui';

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
