import { X } from 'lucide-react-native';
import type { ReactElement, ReactNode } from 'react';
import {
  Button,
  Dialog,
  Sheet,
  Unspaced,
  YStack,
  getTokens,
  useMedia,
} from 'tamagui';

import { useBackDismissal } from '@/hooks/use-back-dismissal';

export function AdaptiveDialog({
  children,
  open,
  onOpenChange,
  testIDPrefix,
  trigger,
  wide = false,
}: {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testIDPrefix: string;
  trigger?: ReactElement;
  wide?: boolean;
}) {
  const { large } = useMedia();
  const colors = getTokens().color;

  useBackDismissal(open, () => onOpenChange(false));

  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}

      <Dialog.Adapt when={!large}>
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
            testID={`${testIDPrefix}-sheet`}
            maxH="90%"
            bg="$appSurfaceStrong"
            borderTopWidth={1}
            borderColor="$appAccentBorder"
            borderTopLeftRadius="$4"
            borderTopRightRadius="$4"
          >
            <Sheet.ScrollView
              keyboardDismissMode={process.env.EXPO_OS === 'ios' ? 'interactive' : 'on-drag'}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <YStack p="$4" pb="$8">
                <Dialog.Adapt.Contents />
              </YStack>
            </Sheet.ScrollView>
          </Sheet.Frame>
        </Sheet>
      </Dialog.Adapt>

      <Dialog.Portal>
        <Dialog.Overlay opacity={0.8} bg="$appScrim" />
        <Dialog.Content
          testID={`${testIDPrefix}-dialog`}
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
          {children}

          <Unspaced>
            <Dialog.Close asChild>
              <Button
                testID={`${testIDPrefix}-dialog-close`}
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
