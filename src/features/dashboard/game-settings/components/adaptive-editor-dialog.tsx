import { Check } from 'lucide-react-native';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Form,
  Spinner,
  XStack,
  getTokens,
} from 'tamagui';

import { AdaptiveDialog, MonoText } from '@/components';

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
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <AdaptiveDialog
      open={open}
      onOpenChange={setOpen}
      testIDPrefix="hosting-config"
      trigger={trigger}
      wide={wide}
    >
      {children(close)}
    </AdaptiveDialog>
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
        <MonoText size="$2.5" $large={{ size: '$2' }}>
          {t('hostingConfig.dialog.cancel')}
        </MonoText>
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
              size="$2.5"
              $large={{ size: '$2' }}
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
