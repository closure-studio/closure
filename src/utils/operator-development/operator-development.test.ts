import {
  createDefaultDevelopmentTarget,
  getDevelopmentLevelCap,
  getMaxDevelopmentPhase,
  setOperatorDevelopmentTask,
  validateOperatorDevelopmentTarget,
  type OperatorDevelopmentCharacter,
} from './operator-development';

const operator: OperatorDevelopmentCharacter = {
  charId: 'char_test',
  evolvePhase: 0,
  level: 1,
  potentialRank: 0,
  skills: [
    { skillId: 'skill_1', specializeLevel: 0, unlock: true },
    { skillId: 'skill_2', specializeLevel: 1, unlock: true },
  ],
};

describe('operator development limits', () => {
  it('matches PRTS rarity promotion and level caps', () => {
    expect(getMaxDevelopmentPhase(0)).toBe(0);
    expect(getMaxDevelopmentPhase(1)).toBe(0);
    expect(getMaxDevelopmentPhase(2)).toBe(1);
    expect(getMaxDevelopmentPhase(3)).toBe(2);
    expect(getMaxDevelopmentPhase(4)).toBe(2);
    expect(getMaxDevelopmentPhase(5)).toBe(2);

    expect(getDevelopmentLevelCap(0, 0)).toBe(30);
    expect(getDevelopmentLevelCap(2, 1)).toBe(55);
    expect(getDevelopmentLevelCap(2, 2)).toBeNull();
    expect(getDevelopmentLevelCap(3, 2)).toBe(70);
    expect(getDevelopmentLevelCap(4, 2)).toBe(80);
    expect(getDevelopmentLevelCap(5, 2)).toBe(90);
  });

  it('creates the highest valid default target for each rarity', () => {
    expect(createDefaultDevelopmentTarget(operator, 2)).toEqual({
      evolve_phase: 1,
      level: 55,
      skill_level: 7,
      masteries: [],
    });
    expect(createDefaultDevelopmentTarget(operator, 5)).toEqual({
      evolve_phase: 2,
      level: 90,
      skill_level: 7,
      masteries: [
        { skill_id: 'skill_1', target_level: 3 },
        { skill_id: 'skill_2', target_level: 3 },
      ],
    });
  });

  it('rejects illegal low-rarity phases and mastery prerequisites', () => {
    expect(validateOperatorDevelopmentTarget(operator, 2, {
      evolve_phase: 2,
      level: 1,
      skill_level: 7,
      masteries: [],
    })).toBe(false);

    expect(validateOperatorDevelopmentTarget(operator, 5, {
      evolve_phase: 2,
      level: 90,
      skill_level: 6,
      masteries: [{ skill_id: 'skill_1', target_level: 1 }],
    })).toBe(false);

    expect(validateOperatorDevelopmentTarget(operator, 5, {
      evolve_phase: 2,
      level: 90,
      skill_level: 7,
      masteries: [{ skill_id: 'skill_2', target_level: 1 }],
    })).toBe(true);
  });

  it('replaces and removes only the selected operator task', () => {
    const existing = [{
      char_id: 'char_other',
      target: { evolve_phase: 1 as const, level: 40, skill_level: 7 as const, masteries: [] },
    }];
    const target = createDefaultDevelopmentTarget(operator, 5);
    const added = setOperatorDevelopmentTask(existing, operator.charId, target);
    expect(added).toHaveLength(2);
    expect(added[1]).toEqual({ char_id: operator.charId, target });
    expect(setOperatorDevelopmentTask(added, operator.charId, null)).toEqual(existing);
  });
});
