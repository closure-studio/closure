import {
  Check,
  ChevronRight,
  Flame,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dialog,
  Form,
  Input,
  ScrollView,
  XStack,
  YStack,
  getTokens,
  useMedia,
} from 'tamagui';

import { Frame, MonoText, TerminalText } from '@/components';
import type { ArkHostBattleTask, ArkHostGameConfigPatch } from '@/schemas/arkhost';
import type { StageTable } from '@/schemas/game-data';
import { getStageDisplayParts } from '@/utils/stage-display';
import { AdaptiveEditorDialog, EditorActions } from './adaptive-editor-dialog';

const CARD_PREVIEW_LIMIT = 3;
const SEARCH_RESULT_LIMIT = 10;
const DEFAULT_STAGE_CODE = '1-7';
const FIRST_PRIORITY_INDEX = '01';

function BattleConfigurationCardContent({
  queue,
  stageTable,
}: {
  queue: readonly string[];
  stageTable: StageTable;
}) {
  const { t } = useTranslation('dashboard');
  const colors = getTokens().color;
  const previewQueue = queue.slice(0, CARD_PREVIEW_LIMIT);
  const countLabel = `${queue.length} ${t('hostingConfig.units.stages')}`;

  return (
    <>
      <XStack items="center" justify="space-between" gap="$3" minW={0}>
        <XStack items="center" gap="$2" minW={0} shrink={1}>
          <Flame size={17} color={colors.appMuted.val} />
          <TerminalText size="$3" fontWeight="700" numberOfLines={1}>
            {t('hostingConfig.battleQueue')}
          </TerminalText>
          <XStack
            px="$2"
            py="$0.5"
            borderWidth={1}
            borderColor={queue.length > 0 ? '$appAccentBorder' : '$appBorder'}
            bg={queue.length > 0 ? '$appAccentSoft' : '$appSurfaceRaised'}
            shrink={0}
          >
            <MonoText
              size="$1"
              color={queue.length > 0 ? '$appAccent' : '$appMuted'}
              fontWeight="700"
              fontVariant={['tabular-nums']}
            >
              {countLabel}
            </MonoText>
          </XStack>
        </XStack>

        <XStack items="center" gap="$1" shrink={0}>
          <MonoText size="$2" color="$appAccent">
            {t('hostingConfig.dialog.edit')}
          </MonoText>
          <ChevronRight size={13} color={colors.appAccent.val} />
        </XStack>
      </XStack>

      <MonoText size="$2" color="$appMuted" numberOfLines={2}>
        {t('hostingConfig.summaries.battleMaps')}
      </MonoText>

      <YStack borderTopWidth={1} borderColor="$appRule">
        {queue.length === 0 ? (
          <XStack items="center" gap="$2.5" py="$2.5" minW={0}>
            <MonoText
              size="$1"
              color="$appMuted"
              fontWeight="700"
              fontVariant={['tabular-nums']}
              width="$2.5"
              text="center"
              shrink={0}
            >
              {FIRST_PRIORITY_INDEX}
            </MonoText>
            <TerminalText size="$2.5" fontWeight="800" color="$appText" shrink={0}>
              {DEFAULT_STAGE_CODE}
            </TerminalText>
            <MonoText size="$1" color="$appMuted" numberOfLines={1} grow={1} minW={0}>
              {t('hostingConfig.card.defaultStage')}
            </MonoText>
            <MonoText size="$1" color="$appWarning" fontWeight="700" shrink={0}>
              {t('hostingConfig.status.default')}
            </MonoText>
          </XStack>
        ) : (
          previewQueue.map((stageId, index) => {
            const { title: code, subtitle: name } = getStageDisplayParts(stageTable, stageId, stageId);
            const isFirst = index === 0;

            return (
              <XStack
                key={`${stageId}-${index}`}
                items="center"
                gap="$2.5"
                py="$2"
                minW={0}
                borderBottomWidth={index < previewQueue.length - 1 ? 1 : 0}
                borderColor="$appRule"
              >
                <MonoText
                  size="$1"
                  color={isFirst ? '$appAccent' : '$appMuted'}
                  fontWeight="700"
                  fontVariant={['tabular-nums']}
                  width="$2.5"
                  text="center"
                  shrink={0}
                >
                  {String(index + 1).padStart(2, '0')}
                </MonoText>
                <TerminalText
                  size="$2.5"
                  fontWeight="800"
                  color={isFirst ? '$appAccent' : '$appText'}
                  shrink={0}
                >
                  {code}
                </TerminalText>
                {name ? (
                  <MonoText size="$1" color="$appMuted" numberOfLines={1} grow={1} minW={0}>
                    {name}
                  </MonoText>
                ) : (
                  <YStack grow={1} />
                )}
                {isFirst ? (
                  <MonoText size="$1" color="$appAccent" fontWeight="700" shrink={0}>
                    {t('hostingConfig.card.firstPriority')}
                  </MonoText>
                ) : null}
              </XStack>
            );
          })
        )}

        {queue.length > CARD_PREVIEW_LIMIT ? (
          <MonoText
            size="$1"
            color="$appMuted"
            text="center"
            pt="$2"
            fontVariant={['tabular-nums']}
          >
            {t('hostingConfig.card.moreStages', { count: Math.max(0, queue.length - CARD_PREVIEW_LIMIT) })}
          </MonoText>
        ) : null}
      </YStack>
    </>
  );
}

function replaceLoopBattleTasks(
  tasks: readonly ArkHostBattleTask[],
  loopStageIds: readonly string[],
): ArkHostBattleTask[] {
  const merged: ArkHostBattleTask[] = [];
  let loopIndex = 0;

  for (const task of tasks) {
    if (task.mode !== 'LOOP') {
      merged.push(task);
      continue;
    }
    const stageId = loopStageIds[loopIndex++];
    if (stageId !== undefined) merged.push({ mode: 'LOOP', stage_id: stageId });
  }

  for (; loopIndex < loopStageIds.length; loopIndex += 1) {
    const stageId = loopStageIds[loopIndex];
    if (stageId !== undefined) merged.push({ mode: 'LOOP', stage_id: stageId });
  }
  return merged;
}

export function BattleQueueSetting({
  tasks,
  stageTable,
  isSubmitting,
  onSubmit,
}: {
  tasks: readonly ArkHostBattleTask[];
  stageTable: StageTable;
  isSubmitting: boolean;
  onSubmit: (patch: ArkHostGameConfigPatch) => Promise<void>;
}) {
  const { t } = useTranslation('dashboard');
  const queue = tasks.filter((task) => task.mode === 'LOOP').map((task) => task.stage_id);

  return (
    <AdaptiveEditorDialog
      trigger={(
        <Frame
          testID="hosting-config-card-battle-maps"
          aria-label={`${t('hostingConfig.battleQueue')}: ${queue.length} ${t('hostingConfig.units.stages')}`}
          role="button"
          cursor="pointer"
          p="$3.5"
          gap="$2.5"
          hoverStyle={{ bg: '$appSurfaceStrong', borderColor: '$appAccentBorder' }}
          pressStyle={{ opacity: 0.8 }}
        >
          <BattleConfigurationCardContent queue={queue} stageTable={stageTable} />
        </Frame>
      )}
    >
      {(close) => (
        <BattleQueueSettingEditor
          initialQueue={queue}
          tasks={tasks}
          stageTable={stageTable}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onSaved={close}
        />
      )}
    </AdaptiveEditorDialog>
  );
}

function BattleStageRow({
  stageId,
  stageTable,
  index,
  search = false,
  testID,
  trailing,
}: {
  stageId: string;
  stageTable: StageTable;
  index?: number;
  search?: boolean;
  testID: string;
  trailing: ReactNode;
}) {
  const { t } = useTranslation('dashboard');
  const stage = stageTable[stageId];
  const { title: code, subtitle: name } = getStageDisplayParts(stageTable, stageId, stageId);
  const first = index === 0;
  const accent = search || first;

  return (
    <XStack
      testID={testID}
      items="center"
      gap="$2"
      p="$2"
      minW={0}
      borderWidth={1}
      borderColor={first ? '$appAccentBorder' : '$appBorder'}
      bg={search ? '$appSurface' : first ? '$appAccentSubtle' : '$appSurfaceRaised'}
    >
      {index !== undefined ? (
        <MonoText
          size="$2"
          $large={{ size: '$1' }}
          color={first ? '$appAccent' : '$appMuted'}
          fontWeight="700"
          fontVariant={['tabular-nums']}
          width="$2.5"
          text="center"
          shrink={0}
        >
          {String(index + 1).padStart(2, '0')}
        </MonoText>
      ) : null}

      <YStack grow={1} shrink={1} minW={0} gap="$0.5">
        <XStack items="center" gap="$2" minW={0}>
          <TerminalText
            size="$3"
            $large={{ size: '$2.5' }}
            color={accent ? '$appAccent' : '$appText'}
            fontWeight="800"
            shrink={0}
          >
            {code}
          </TerminalText>
          {search && name ? (
            <MonoText
              size="$2"
              $large={{ size: '$1' }}
              color="$appMuted"
              numberOfLines={1}
              shrink={1}
            >
              {name}
            </MonoText>
          ) : null}
        </XStack>
        <XStack items="center" gap="$1.5" minW={0}>
          {!search && name ? (
            <MonoText
              size="$2"
              $large={{ size: '$1' }}
              color="$appMuted"
              numberOfLines={1}
              shrink={1}
            >
              {name}
            </MonoText>
          ) : null}
          {stage ? (
            <MonoText size="$2" $large={{ size: '$1' }} color="$appMuted" shrink={0}>
              {t('hostingConfig.dialog.stageCost', { cost: stage.ap })}
            </MonoText>
          ) : null}
        </XStack>
      </YStack>

      {trailing}
    </XStack>
  );
}

function BattleQueueSettingEditor({
  initialQueue,
  tasks,
  stageTable,
  isSubmitting,
  onSubmit,
  onSaved,
}: {
  initialQueue: readonly string[];
  tasks: readonly ArkHostBattleTask[];
  stageTable: StageTable;
  isSubmitting: boolean;
  onSubmit: (patch: ArkHostGameConfigPatch) => Promise<void>;
  onSaved: () => void;
}) {
  const { t } = useTranslation('dashboard');
  const colors = getTokens().color;
  const { large } = useMedia();
  const [queue, setQueue] = useState([...initialQueue]);
  const [keyword, setKeyword] = useState('');
  const hasChanges = queue.length !== initialQueue.length || queue.some((id, index) => id !== initialQueue[index]);
  const captionTextSize = large ? '$1' : '$2';
  const bodyTextSize = large ? '$2' : '$2.5';
  const stageCodeSize = large ? '$2.5' : '$3';
  const titleTextSize = large ? '$5' : '$5.5';
  const isSearching = keyword.trim().length > 0;
  const addStageLabel = t('hostingConfig.dialog.addStage');
  const addedLabel = t('hostingConfig.dialog.added');
  const searchStagesLabel = t('hostingConfig.dialog.searchStages');

  const filteredStages = useMemo(() => {
    const query = keyword.trim().toUpperCase();
    if (!query) return [];

    const results: string[] = [];
    for (const [id, entry] of Object.entries(stageTable)) {
      if (
        id.toUpperCase().includes(query) ||
        entry.code.toUpperCase().includes(query) ||
        entry.name.toUpperCase().includes(query)
      ) {
        results.push(id);
        if (results.length >= SEARCH_RESULT_LIMIT) break;
      }
    }
    return results;
  }, [keyword, stageTable]);

  const handleSubmit = () => {
    if (!hasChanges || isSubmitting) return;
    onSubmit({ battle_tasks: replaceLoopBattleTasks(tasks, queue) })
      .then(onSaved)
      .catch(() => undefined);
  };

  const queueContent = (
    <YStack gap="$2">
      <XStack items="center" justify="space-between" gap="$2">
        <MonoText size={captionTextSize} color="$appMuted" fontWeight="700">
          {t('hostingConfig.dialog.currentQueue')}
        </MonoText>
        <MonoText
          size={captionTextSize}
          color="$appAccent"
          fontWeight="700"
          fontVariant={['tabular-nums']}
        >
          {queue.length} {t('hostingConfig.units.stages')}
        </MonoText>
      </XStack>

      {queue.length === 0 ? (
        <XStack
          items="center"
          gap="$2.5"
          p="$3"
          minW={0}
          borderWidth={1}
          borderColor="$appWarningBorder"
          bg="$appWarningSoft"
        >
          <Flame size={16} color={colors.appWarning.val} />
          <MonoText
            size={bodyTextSize}
            color="$appMuted"
            grow={1}
            shrink={1}
            minW={0}
          >
            {t('hostingConfig.dialog.queueEmpty')}
          </MonoText>
        </XStack>
      ) : (
        <YStack gap="$1.5">
          {queue.map((stageId, index) => (
            <BattleStageRow
              key={`${stageId}-${index}`}
              stageId={stageId}
              stageTable={stageTable}
              index={index}
              testID={`queue-item-${index}`}
              trailing={(
                <Button
                  testID={`queue-remove-${index}`}
                  aria-label={t('hostingConfig.dialog.removeStage')}
                  unstyled
                  width="$4"
                  height="$4"
                  items="center"
                  justify="center"
                  shrink={0}
                  opacity={isSubmitting ? 0.3 : 1}
                  hoverStyle={{ bg: '$appDangerSoft' }}
                  pressStyle={{ opacity: 0.65 }}
                  disabled={isSubmitting}
                  onPress={() => setQueue((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                >
                  <Trash2 size={14} color={colors.appDanger.val} />
                </Button>
              )}
            />
          ))}
        </YStack>
      )}
    </YStack>
  );

  const searchResultsContent = (
    <YStack gap="$1.5">
      <MonoText size={captionTextSize} color="$appMuted" fontWeight="700">
        {t('hostingConfig.dialog.searchResults')}
      </MonoText>
      {filteredStages.length === 0 ? (
        <MonoText size={bodyTextSize} color="$appWarning" py="$2">
          {t('hostingConfig.dialog.noSearchResults')}
        </MonoText>
      ) : (
        <YStack gap="$1">
          {filteredStages.map((id) => {
            const isAlreadyInQueue = queue.includes(id);

            return (
              <BattleStageRow
                key={id}
                stageId={id}
                stageTable={stageTable}
                search
                testID={`stage-search-result-${id}`}
                trailing={(
                <Button
                  testID={`stage-add-${id}`}
                  aria-label={isAlreadyInQueue ? addedLabel : addStageLabel}
                  unstyled
                  minW="$5"
                  minH="$4"
                  px="$2"
                  items="center"
                  justify="center"
                  borderWidth={1}
                  borderColor={isAlreadyInQueue ? '$appBorder' : '$appAccentBorder'}
                  bg={isAlreadyInQueue ? '$appSurfaceRaised' : '$appAccentSoft'}
                  opacity={isSubmitting ? 0.4 : 1}
                  disabled={isAlreadyInQueue || isSubmitting}
                  pressStyle={{ opacity: 0.65 }}
                  onPress={() => setQueue((current) => current.includes(id) ? current : [id, ...current])}
                >
                  <XStack items="center" justify="center" gap="$1">
                    {isAlreadyInQueue ? (
                      <Check size={12} color={colors.appMuted.val} />
                    ) : (
                      <Plus size={12} color={colors.appAccent.val} />
                    )}
                    <MonoText
                      size={captionTextSize}
                      color={isAlreadyInQueue ? '$appMuted' : '$appAccent'}
                      fontWeight="700"
                    >
                      {isAlreadyInQueue ? addedLabel : addStageLabel}
                    </MonoText>
                  </XStack>
                </Button>
                )}
              />
            );
          })}
        </YStack>
      )}
    </YStack>
  );

  const searchField = (
    <YStack gap="$2">
      <MonoText size={captionTextSize} color="$appMuted" fontWeight="700">
        {addStageLabel}
      </MonoText>
      <XStack
        items="center"
        gap="$2"
        minH="$4.5"
        px="$3"
        borderWidth={1}
        borderColor={isSearching ? '$appAccentBorder' : '$appBorder'}
        bg="$appSurfaceRaised"
      >
        <Search size={14} color={colors.appMuted.val} />
        <Input
          testID="hosting-config-stage-search"
          aria-label={searchStagesLabel}
          grow={1}
          minW={0}
          unstyled
          p="$2"
          fontSize={stageCodeSize}
          fontFamily="$mono"
          color="$appText"
          placeholder={searchStagesLabel}
          placeholderTextColor="$appMuted"
          autoCapitalize="characters"
          autoCorrect={false}
          spellCheck={false}
          value={keyword}
          disabled={isSubmitting}
          onChangeText={setKeyword}
        />
        {keyword ? (
          <Button
            aria-label={t('hostingConfig.dialog.clearSearch')}
            unstyled
            width="$4"
            height="$4"
            items="center"
            justify="center"
            onPress={() => setKeyword('')}
          >
            <X size={14} color={colors.appMuted.val} />
          </Button>
        ) : null}
      </XStack>
    </YStack>
  );

  const scrollContent = (
    <YStack gap="$4" pb="$1">
      {isSearching ? searchResultsContent : queueContent}
      <EditorActions
        canSave={hasChanges}
        isSubmitting={isSubmitting}
        onCancel={onSaved}
      />
    </YStack>
  );

  return (
    <Form onSubmit={handleSubmit} gap="$4" shrink={1} minH={0}>
      <YStack gap="$2" pr="$4">
        <Dialog.Title asChild>
          <TerminalText size={titleTextSize} fontWeight="800" numberOfLines={2}>
            {t('hostingConfig.battleQueue')}
          </TerminalText>
        </Dialog.Title>
        <Dialog.Description asChild>
          <MonoText size={bodyTextSize} color="$appMuted">
            {t('hostingConfig.descriptions.battleMaps')}
          </MonoText>
        </Dialog.Description>
      </YStack>

      {searchField}

      {large ? (
        <ScrollView
          key={isSearching ? 'search' : 'queue'}
          shrink={1}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {scrollContent}
        </ScrollView>
      ) : (
        <YStack
          key={isSearching ? 'search' : 'queue'}
          testID="hosting-config-battle-content"
        >
          {scrollContent}
        </YStack>
      )}
    </Form>
  );
}
