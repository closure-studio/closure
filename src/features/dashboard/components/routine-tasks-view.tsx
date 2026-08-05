import { Check, Circle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, Button, XStack, YStack, getTokens } from 'tamagui';

import { MonoText, TerminalMeterBar, TerminalPanel, TerminalSectionHeading, TerminalText } from '@/components';
import type { RoutineTask } from '@/schemas/game-account';

function RoutineTaskRow({ task, onToggle }: { task: RoutineTask; onToggle: () => void }) {
  const colors = getTokens().color;
  return (
    <Button unstyled p={0} borderWidth={0} items="stretch" pressStyle={{ opacity: 0.75 }} onPress={onToggle}>
      <TerminalPanel transition="300ms" tone={task.isCompleted ? 'success' : 'default'} p={12} flexDirection="row" items="center" gap={12}>
        <YStack width={28} height={28} items="center" justify="center" borderWidth={1} borderColor={task.isCompleted ? '$appSuccess' : '$appBorder'} bg={task.isCompleted ? '$appSuccessSoft' : 'transparent'}>
          {task.isCompleted ? <Check size={15} color={colors.appSuccess.val} /> : <Circle size={10} color={colors.appMuted.val} />}
        </YStack>
        <YStack grow={1} minW={0} gap="$1">
          <XStack items="center" justify="space-between" gap="$2">
            <TerminalText size="$3" lineHeight="$2.5" color={task.isCompleted ? '$appMuted' : '$appText'} textDecorationLine={task.isCompleted ? 'line-through' : 'none'} shrink={1} numberOfLines={1}>{task.label}</TerminalText>
            <MonoText size="$1">{task.completionProgress[0]}/{task.completionProgress[1]}</MonoText>
          </XStack>
          <MonoText size="$1" color="$appAccent">{task.reward}</MonoText>
          {!task.isCompleted ? <YStack mt={6}><TerminalMeterBar value={task.completionProgress[0]} max={task.completionProgress[1]} /></YStack> : null}
        </YStack>
      </TerminalPanel>
    </Button>
  );
}

export function RoutineTasksView({ tasks, onToggle }: { tasks: readonly RoutineTask[]; onToggle: (id: string) => void }) {
  const { t } = useTranslation('dashboard');
  const completedTaskCount = tasks.filter((task) => task.isCompleted).length;
  const completionPercentage = tasks.length ? (completedTaskCount / tasks.length) * 100 : 0;
  return (
    <YStack gap={16} pb="$4">
      <TerminalSectionHeading code="TASK" title={t('routine.title')} subtitle="ROUTINE" />
      <TerminalPanel cornerBrackets p={16}>
        <XStack items="flex-end" justify="space-between">
          <YStack><MonoText size="$1">{t('routine.progressToday')}</MonoText><TerminalText size="$8" fontWeight="900" color="$appAccent">{completedTaskCount}<TerminalText size="$4" color="$appMuted"> / {tasks.length}</TerminalText></TerminalText></YStack>
          <AnimatePresence>
            <TerminalText key={completedTaskCount} transition="300ms" enterStyle={{ opacity: 0, scale: 0.8 }} exitStyle={{ opacity: 0 }} opacity={1} scale={1} size="$7" fontWeight="800">{Math.round(completionPercentage)}%</TerminalText>
          </AnimatePresence>
        </XStack>
        <YStack mt={12}><TerminalMeterBar value={completionPercentage} tone={completionPercentage === 100 ? 'success' : 'cyan'} /></YStack>
      </TerminalPanel>
      <XStack flexWrap="wrap" gap="$4">
        {(['日常', '周常'] as const).map((cadence) => (
          <YStack key={cadence} width="100%" minW={280} grow={1} gap={8} $lg={{ width: '48%' }}>
            <MonoText mb={0} size="$1">{t(cadence === '日常' ? 'routine.cadence.daily' : 'routine.cadence.weekly')}</MonoText>
            {tasks.filter((task) => task.cadence === cadence).map((task) => <RoutineTaskRow key={task.id} task={task} onToggle={() => onToggle(task.id)} />)}
          </YStack>
        ))}
      </XStack>
    </YStack>
  );
}
