import type { StageTable } from '@/schemas/game-data';

export function getStageDisplayParts(table: StageTable, stageId: string, unavailable: string) {
  const stage = table[stageId];
  if (stage) return { title: stage.code, subtitle: stage.name };
  return { title: stageId || unavailable, subtitle: undefined };
}

export function getStageDisplayLabel(table: StageTable, stageId: string, unavailable: string) {
  const display = getStageDisplayParts(table, stageId, unavailable);
  return display.subtitle ? `${display.title} · ${display.subtitle}` : display.title;
}
