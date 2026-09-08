import { Pause, Play, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Adapt, Button, Dialog, Sheet, Spinner, Tooltip, XStack, YStack, getTokens, styled, useMedia } from 'tamagui';

import { MonoText, TerminalNotice, TerminalText } from '@/components';
import { ARK_HOST_GAME_STATUS_CODE } from '@/schemas/arkhost';

export type GameAccountActionsProps = {
  account: string;
  nickname: string;
  statusCode: number;
  actionPending?: boolean;
  deletePending?: boolean;
  error?: string | null;
  onToggle: () => void;
  onDelete: () => void;
};

const ActionButton = styled(Button, {
  name: 'GameAccountActionButton',
  height: '$4.5',
  minW: '$4.5',
  rounded: '$0',
  borderWidth: 1,
  borderColor: '$appBorder',
  bg: '$appSurfaceRaised',
  gap: '$2.5',
  px: '$3',
  pressStyle: { opacity: 0.7 },
  focusVisibleStyle: { outlineColor: '$appText', outlineWidth: 2, outlineStyle: 'solid' },
  disabledStyle: { opacity: 0.55 },
  variants: {
    tone: {
      start: { bg: '$appAccentSoft', borderColor: '$appAccentBorder', hoverStyle: { borderColor: '$appAccent', bg: '$appAccentSoft' } },
      pause: { bg: '$appWarningSoft', borderColor: '$appWarningBorder', hoverStyle: { borderColor: '$appWarning', bg: '$appWarningSoft' } },
      delete: { hoverStyle: { borderColor: '$appDangerBorder', bg: '$appDangerSoft' }, pressStyle: { bg: '$appDangerSoft' } },
    },
  } as const,
});

export function GameAccountActions({ account, nickname, statusCode, actionPending = false, deletePending = false, error, onToggle, onDelete }: GameAccountActionsProps) {
  const { t } = useTranslation('dashboard');
  const { large } = useMedia();
  const colors = getTokens().color;
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const stopped = statusCode === ARK_HOST_GAME_STATUS_CODE.notStarted;
  const busy = actionPending || deletePending;
  const action = stopped ? 'start' : 'pause';
  const color = stopped ? '$appAccent' : '$appWarning';
  const Icon = stopped ? Play : Pause;

  return (
    <YStack testID="overview-account-actions" mt="$3" gap="$2" minW={0}>
      {error ? <TerminalNotice tone="danger">{error}</TerminalNotice> : null}
      <XStack gap="$5" items="center">
        <ActionButton
          testID="overview-toggle-game"
          tone={action}
          grow={1}
          shrink={1}
          minW={0}
          disabled={busy}
          aria-busy={actionPending}
          onPress={onToggle}
          icon={actionPending
            ? <Spinner size="small" color={color} />
            : <Icon size={18} color={stopped ? colors.appAccent.val : colors.appWarning.val} />}
        >
          <TerminalText size="$2.5" fontWeight="700" color={color} shrink={1}>
            {t(`overview.actions.${actionPending ? (stopped ? 'starting' : 'pausing') : action}`)}
          </TerminalText>
        </ActionButton>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <ActionButton
              testID="overview-delete-game"
              tone="delete"
              width="$4.5"
              shrink={0}
              px="$0"
              disabled={busy}
              aria-label={t('overview.actions.delete')}
              aria-busy={deletePending}
              onPress={() => setConfirmingDelete(true)}
              icon={deletePending ? <Spinner size="small" color="$appDanger" /> : <Trash2 size={18} color={colors.appDanger.val} />}
            />
          </Tooltip.Trigger>
          <Tooltip.Content bg="$appSurfaceStrong" borderColor="$appBorder" borderWidth={1} rounded="$0" px="$3" py="$2">
            <MonoText size="$1">{t('overview.actions.delete')}</MonoText>
          </Tooltip.Content>
        </Tooltip>
      </XStack>
      <Dialog modal open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <Adapt when={!large} platform="touch">
          <Sheet modal dismissOnSnapToBottom snapPointsMode="fit">
            <Sheet.Overlay bg="$appScrim" />
            <Sheet.Handle bg="$appBorder" />
            <Sheet.Frame bg="$appSurfaceStrong" p="$4" pb="$8" gap="$4" borderTopWidth={1} borderColor="$appDangerBorder" rounded="$0">
              <Adapt.Contents />
            </Sheet.Frame>
          </Sheet>
        </Adapt>
        <Dialog.Portal>
          <Dialog.Overlay bg="$appScrim" />
          <Dialog.Content width="92%" maxW={420} p="$4" gap="$4" bg="$appSurfaceStrong" borderWidth={1} borderColor="$appDangerBorder" rounded="$0">
            <Dialog.Title color="$appText" size="$5">{t('overview.actions.deleteTitle')}</Dialog.Title>
            <Dialog.Description color="$appMuted" size="$2.5">{t('overview.actions.deleteDescription')}</Dialog.Description>
            <YStack gap="$1">
              <TerminalText size="$4" fontWeight="700">{nickname || account}</TerminalText>
              <MonoText size="$2">{account}</MonoText>
            </YStack>
            <XStack gap="$5" flexWrap="wrap">
              <ActionButton
                testID="overview-cancel-delete"
                grow={1}
                onPress={() => setConfirmingDelete(false)}
              >
                <TerminalText size="$2.5">{t('overview.actions.cancel')}</TerminalText>
              </ActionButton>
              <ActionButton
                testID="overview-confirm-delete"
                tone="delete"
                grow={1}
                disabled={busy}
                onPress={() => {
                  setConfirmingDelete(false);
                  onDelete();
                }}
              >
                <Trash2 size={16} color={colors.appDanger.val} />
                <TerminalText size="$2.5" color="$appDanger">{t('overview.actions.delete')}</TerminalText>
              </ActionButton>
            </XStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </YStack>
  );
}
