import type { ArkHostGameConfig, ArkHostGameDetail } from '@/schemas/arkhost';
import type { CharacterTableEntry } from '@/schemas/game-data';

export type OperatorDevelopmentTask = ArkHostGameConfig['operator_development_tasks'][number];
export type OperatorDevelopmentTarget = OperatorDevelopmentTask['target'];
export type OperatorDevelopmentPhase = OperatorDevelopmentTarget['evolve_phase'];
export type OperatorDevelopmentSkillLevel = OperatorDevelopmentTarget['skill_level'];
export type OperatorRarity = CharacterTableEntry['rarity'];
export type OperatorDevelopmentCharacter = NonNullable<ArkHostGameDetail['troop']>['chars'][string];

export const OPERATOR_DEVELOPMENT_PHASES = [0, 1, 2] as const satisfies readonly OperatorDevelopmentPhase[];
export const OPERATOR_MASTERY_LEVELS = [0, 1, 2, 3] as const;

// PRTS "干员等级上限", indexed by the game's 0-based rarity value.
// null means the rarity cannot reach that elite phase.
const LEVEL_CAPS_BY_RARITY = {
  0: [30, null, null],
  1: [30, null, null],
  2: [40, 55, null],
  3: [45, 60, 70],
  4: [50, 70, 80],
  5: [50, 80, 90],
} as const satisfies Record<
  OperatorRarity,
  readonly [number, number | null, number | null]
>;

const MAX_PHASE_BY_RARITY = {
  0: 0,
  1: 0,
  2: 1,
  3: 2,
  4: 2,
  5: 2,
} as const satisfies Record<OperatorRarity, OperatorDevelopmentPhase>;

const SKILL_LEVELS = [1, 2, 3, 4, 5, 6, 7] as const satisfies readonly OperatorDevelopmentSkillLevel[];

export function getMaxDevelopmentPhase(rarity: OperatorRarity): OperatorDevelopmentPhase {
  return MAX_PHASE_BY_RARITY[rarity];
}

export function getDevelopmentLevelCap(
  rarity: OperatorRarity,
  phase: OperatorDevelopmentPhase,
): number | null {
  return LEVEL_CAPS_BY_RARITY[rarity][phase];
}

export function getDevelopmentLevelRange(
  operator: OperatorDevelopmentCharacter,
  rarity: OperatorRarity,
  phase: OperatorDevelopmentPhase,
): { min: number; max: number } | null {
  const max = getDevelopmentLevelCap(rarity, phase);
  if (max === null || phase < operator.evolvePhase) return null;
  const min = phase === operator.evolvePhase ? Math.max(1, operator.level) : 1;
  return min <= max ? { min, max } : null;
}

export function getDevelopmentSkillLevelMax(
  operator: OperatorDevelopmentCharacter,
  phase: OperatorDevelopmentPhase,
): OperatorDevelopmentSkillLevel {
  if (operator.skills.length === 0) return 1;
  return phase === 0 ? 4 : 7;
}

export function stepDevelopmentSkillLevel(
  current: OperatorDevelopmentSkillLevel,
  delta: -1 | 1,
  max: OperatorDevelopmentSkillLevel,
): OperatorDevelopmentSkillLevel {
  const currentIndex = SKILL_LEVELS.indexOf(current);
  const maxIndex = SKILL_LEVELS.indexOf(max);
  const nextIndex = Math.max(0, Math.min(maxIndex, currentIndex + delta));
  return SKILL_LEVELS[nextIndex] ?? current;
}

export function canDevelopMasteries(
  operator: OperatorDevelopmentCharacter,
  rarity: OperatorRarity,
  target: OperatorDevelopmentTarget,
): boolean {
  return operator.skills.length > 0
    && getMaxDevelopmentPhase(rarity) === 2
    && target.evolve_phase === 2
    && target.skill_level === 7;
}

export function validateOperatorDevelopmentTarget(
  operator: OperatorDevelopmentCharacter,
  rarity: OperatorRarity,
  target: OperatorDevelopmentTarget,
): boolean {
  const levelRange = getDevelopmentLevelRange(operator, rarity, target.evolve_phase);
  if (levelRange === null || target.level < levelRange.min || target.level > levelRange.max) {
    return false;
  }
  const skillLevelMax = getDevelopmentSkillLevelMax(operator, target.evolve_phase);
  if (target.skill_level < 1 || target.skill_level > skillLevelMax) return false;
  if (target.masteries.length > 0 && !canDevelopMasteries(operator, rarity, target)) return false;

  const seenSkillIds = new Set<string>();
  for (const mastery of target.masteries) {
    const skill = operator.skills.find((candidate) => candidate.skillId === mastery.skill_id);
    if (
      !skill
      || seenSkillIds.has(mastery.skill_id)
      || mastery.target_level < Math.max(1, skill.specializeLevel)
      || mastery.target_level > 3
    ) {
      return false;
    }
    seenSkillIds.add(mastery.skill_id);
  }
  return true;
}

export function createDefaultDevelopmentTarget(
  operator: OperatorDevelopmentCharacter,
  rarity: OperatorRarity,
): OperatorDevelopmentTarget {
  const evolvePhase = getMaxDevelopmentPhase(rarity);
  const level = getDevelopmentLevelCap(rarity, evolvePhase);
  if (level === null) {
    throw new Error('Operator development limits are internally inconsistent.');
  }
  const target: OperatorDevelopmentTarget = {
    evolve_phase: evolvePhase,
    level,
    skill_level: getDevelopmentSkillLevelMax(operator, evolvePhase),
    masteries: [],
  };
  if (!canDevelopMasteries(operator, rarity, target)) return target;

  return {
    ...target,
    masteries: [...new Set(operator.skills.map((skill) => skill.skillId))].map(
      (skillId) => ({ skill_id: skillId, target_level: 3 }),
    ),
  };
}

export function setOperatorDevelopmentTask(
  tasks: readonly OperatorDevelopmentTask[],
  charId: string,
  target: OperatorDevelopmentTarget | null,
): OperatorDevelopmentTask[] {
  if (target === null) return tasks.filter((task) => task.char_id !== charId);

  const replacement: OperatorDevelopmentTask = {
    char_id: charId,
    target: {
      ...target,
      masteries: target.masteries.map((mastery) => ({ ...mastery })),
    },
  };
  const existingIndex = tasks.findIndex((task) => task.char_id === charId);
  if (existingIndex < 0) return [...tasks, replacement];
  return tasks.map((task, index) => (index === existingIndex ? replacement : task));
}
