import { XStack, YStack } from 'tamagui';

import { MonoText, TerminalText } from '@/components';
import type { StageTable } from '@/schemas/game-data';

export function formatStageLabel(
  stageTable: StageTable,
  stageId: string,
): { code: string; name: string } {
  const stage = stageTable[stageId];
  if (stage) {
    return {
      code: stage.code,
      name: stage.name,
    };
  }
  return { code: stageId, name: '' };
}

export function BattleStageChips({
  emptyLabel,
  queue,
  stageTable,
}: {
  emptyLabel: string;
  queue: readonly string[];
  stageTable: StageTable;
}) {
  if (queue.length === 0) {
    return (
      <YStack p="$3" borderWidth={1} borderColor="$appBorder" bg="$appSurfaceRaised">
        <MonoText size="$2">{emptyLabel}</MonoText>
      </YStack>
    );
  }

  return (
    <XStack flexWrap="wrap" gap="$2" py="$1">
      {queue.map((stageId, index) => {
        const { code, name } = formatStageLabel(stageTable, stageId);
        const stageNameText = name ? ` (${name})` : '';
        const stageIndexText = String(index + 1).padStart(2, '0');

        return (
          <XStack
            key={`${stageId}-${index}`}
            items="center"
            gap="$1.5"
            px="$2.5"
            py="$1"
            borderWidth={1}
            borderColor="$appAccentBorder"
            bg="$appAccentSoft"
          >
            <MonoText size="$1" color="$appAccent" fontWeight="700">
              {stageIndexText}
            </MonoText>
            <TerminalText size="$2" fontWeight="700">
              {code}
            </TerminalText>
            {name ? (
              <MonoText size="$1" color="$appMuted">
                {stageNameText}
              </MonoText>
            ) : null}
          </XStack>
        );
      })}
    </XStack>
  );
}
