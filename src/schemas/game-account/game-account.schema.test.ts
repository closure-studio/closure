import * as v from 'valibot';

import {
  gameAccountSchema,
  linkGameAccountCredentialsSchema,
  operatorSchema,
  routineTaskSchema,
} from '.';
import type { Operator, RoutineTask } from '.';
import { initialGameAccounts } from '@/features/dashboard/mocks/game-accounts';

const validOperator = {
  id: 'operator-1',
  name: 'Operator',
  codename: 'OPERATOR',
  class: '近卫',
  rarity: 6,
  level: 60,
  maxLevel: 90,
  elite: 2,
  potential: 1,
  trust: 100,
  skillLevel: 7,
  proficiency: [3, 0, 0],
} satisfies Operator;

const validRoutineTask = {
  id: 'task-1',
  label: 'Task',
  reward: 'Reward',
  isCompleted: false,
  cadence: '日常',
  completionProgress: [1, 3],
} satisfies RoutineTask;

describe('Game Account schemas', () => {
  it('accepts the current Game Account fixture shape', () => {
    expect(v.safeParse(gameAccountSchema, initialGameAccounts[0]).success).toBe(true);
  });

  it('rejects unknown literals and malformed tuples', () => {
    expect(v.safeParse(operatorSchema, { ...validOperator, rarity: 2 }).success).toBe(false);
    expect(v.safeParse(operatorSchema, { ...validOperator, proficiency: [3, 0] }).success).toBe(false);
    expect(v.safeParse(gameAccountSchema, { ...initialGameAccounts[0], color: 'unknown' }).success).toBe(false);
    expect(v.safeParse(gameAccountSchema, { ...initialGameAccounts[0], exp: [1] }).success).toBe(false);
  });

  it('enforces the existing Operator level invariant', () => {
    expect(v.safeParse(operatorSchema, { ...validOperator, level: 91 }).success).toBe(false);
  });

  it('enforces the existing Routine Task progress invariants', () => {
    expect(v.safeParse(routineTaskSchema, validRoutineTask).success).toBe(true);
    expect(v.safeParse(routineTaskSchema, {
      ...validRoutineTask,
      completionProgress: [4, 3],
    }).success).toBe(false);
    expect(v.safeParse(routineTaskSchema, {
      ...validRoutineTask,
      completionProgress: [3, 3],
      isCompleted: false,
    }).success).toBe(false);
  });

  it('validates linked account credentials without changing password content', () => {
    const result = v.safeParse(linkGameAccountCredentialsSchema, {
      accountIdentifier: '  doctor  ',
      password: ' access-key ',
      serverChannel: '官服',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output).toEqual({
        accountIdentifier: 'doctor',
        password: ' access-key ',
        serverChannel: '官服',
      });
    }
  });
});
