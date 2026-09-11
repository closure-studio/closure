import { ChevronRight, Minus, Plus, Ticket, Zap } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, Form, XStack, YStack, getTokens, useMedia } from 'tamagui';

import { Frame, MonoText, TerminalText } from '@/components';
import type { ArkHostGameConfigPatch } from '@/schemas/arkhost';
import { AdaptiveEditorDialog, EditorActions } from './adaptive-editor-dialog';

type ResourceReserveField = 'keeping_ap' | 'recruit_reserve';

const FIELD_META = {
  keeping_ap: {
    icon: Zap,
    testID: 'hosting-config-card-keeping-ap',
    valueTestID: 'hosting-config-keeping-ap',
  },
  recruit_reserve: {
    icon: Ticket,
    testID: 'hosting-config-card-recruit-reserve',
    valueTestID: 'hosting-config-recruit-reserve',
  },
} as const satisfies Record<ResourceReserveField, {
  icon: LucideIcon;
  testID: string;
  valueTestID: string;
}>;

type ResourceReserveSettingProps = {
  field: ResourceReserveField;
  isSubmitting: boolean;
  onSubmit: (patch: ArkHostGameConfigPatch) => Promise<void>;
  value: number;
};

export function ResourceReserveSetting({ field, isSubmitting, onSubmit, value }: ResourceReserveSettingProps) {
  const { t } = useTranslation('dashboard');
  const colors = getTokens().color;
  const meta = FIELD_META[field];
  const Icon = meta.icon;
  const isKeepingAp = field === 'keeping_ap';
  const title = t(isKeepingAp ? 'hostingConfig.keepingAp' : 'hostingConfig.recruitReserve');
  const unit = t(isKeepingAp ? 'hostingConfig.units.ap' : 'hostingConfig.units.permits');
  const description = t(isKeepingAp ? 'hostingConfig.summaries.keepingAp' : 'hostingConfig.summaries.recruitReserve');

  return (
    <AdaptiveEditorDialog
      trigger={(
        <Frame
          testID={meta.testID}
          aria-label={`${title}: ${value} ${unit}`}
          role="button"
          cursor="pointer"
          p="$3.5"
          gap="$2.5"
          minH="$7"
          hoverStyle={{ bg: '$appSurfaceStrong', borderColor: '$appAccentBorder' }}
          pressStyle={{ opacity: 0.8 }}
        >
          <XStack items="center" justify="space-between" gap="$3" minW={0}>
            <XStack items="center" gap="$2" minW={0} shrink={1}>
              <Icon size={17} color={colors.appMuted.val} />
              <TerminalText size="$3" fontWeight="700" numberOfLines={2}>{title}</TerminalText>
            </XStack>
            <XStack items="center" gap="$2" shrink={0}>
              <XStack items="baseline" gap="$1">
                <TerminalText size="$5" fontWeight="800" color="$appAccent" fontVariant={['tabular-nums']}>{value}</TerminalText>
                <MonoText size="$1" color="$appMuted">{unit}</MonoText>
              </XStack>
              <ChevronRight size={14} color={colors.appAccent.val} />
            </XStack>
          </XStack>
          <MonoText size="$2" color="$appMuted" numberOfLines={2}>{description}</MonoText>
        </Frame>
      )}
    >
      {(close) => (
        <ReserveEditor
          field={field}
          initialValue={value}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onSaved={close}
          testID={meta.valueTestID}
          title={title}
          unit={unit}
        />
      )}
    </AdaptiveEditorDialog>
  );
}

function ReserveEditor({
  field,
  initialValue,
  isSubmitting,
  onSubmit,
  onSaved,
  testID,
  title,
  unit,
}: {
  field: ResourceReserveField;
  initialValue: number;
  isSubmitting: boolean;
  onSubmit: (patch: ArkHostGameConfigPatch) => Promise<void>;
  onSaved: () => void;
  testID: string;
  title: string;
  unit: string;
}) {
  const { t } = useTranslation('dashboard');
  const colors = getTokens().color;
  const { large } = useMedia();
  const [value, setValue] = useState(initialValue);
  const hasChanges = value !== initialValue;

  const handleSubmit = () => {
    const patch: ArkHostGameConfigPatch = field === 'keeping_ap'
      ? { keeping_ap: value }
      : { recruit_reserve: value };
    onSubmit(patch).then(onSaved).catch(() => undefined);
  };

  return (
    <Form onSubmit={handleSubmit} gap="$4">
      <YStack gap="$2">
        <Dialog.Title asChild>
          <TerminalText size={large ? '$5' : '$5.5'} fontWeight="800" numberOfLines={2}>{title}</TerminalText>
        </Dialog.Title>
        <Dialog.Description asChild>
          <MonoText size={large ? '$2' : '$2.5'} color="$appMuted">
            {t(field === 'keeping_ap' ? 'hostingConfig.descriptions.keepingAp' : 'hostingConfig.descriptions.recruitReserve')}
          </MonoText>
        </Dialog.Description>
      </YStack>

      <XStack minH={56} maxH={56} minW={0} items="stretch" overflow="hidden" bg="$appSurfaceRaised" borderWidth={1} borderColor="$appBorder">
        <Button
          testID="numeric-step-decrease"
          aria-label={t('hostingConfig.dialog.decrease')}
          unstyled width={56} height={56} p="$0" items="center" justify="center" shrink={0}
          opacity={value === 0 || isSubmitting ? 0.35 : 1}
          hoverStyle={{ bg: '$appAccentSoft' }} pressStyle={{ bg: '$appAccentSoft' }}
          disabled={value === 0 || isSubmitting}
          onPress={() => setValue((current) => Math.max(0, current - 1))}
        ><Minus size={18} color={colors.appAccent.val} /></Button>

        <XStack testID={testID} grow={1} minW={0} items="center" justify="center" gap="$1.5" borderLeftWidth={1} borderRightWidth={1} borderColor="$appBorder">
          <TerminalText size={large ? '$6' : '$7'} fontWeight="800" color="$appText" fontVariant={['tabular-nums']}>{value}</TerminalText>
          <MonoText size={large ? '$1' : '$2'} color="$appMuted">{unit}</MonoText>
        </XStack>

        <Button
          testID="numeric-step-increase"
          aria-label={t('hostingConfig.dialog.increase')}
          unstyled width={56} height={56} p="$0" items="center" justify="center" shrink={0}
          hoverStyle={{ bg: '$appAccentSoft' }} pressStyle={{ bg: '$appAccentSoft' }} disabled={isSubmitting}
          onPress={() => setValue((current) => current + 1)}
        ><Plus size={18} color={colors.appAccent.val} /></Button>
      </XStack>

      <EditorActions
        canSave={hasChanges}
        isSubmitting={isSubmitting}
        onCancel={onSaved}
      />
    </Form>
  );
}
