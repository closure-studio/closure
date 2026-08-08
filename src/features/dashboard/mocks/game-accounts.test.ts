import * as v from 'valibot';

import { gameAccountSchema } from '@/schemas/game-account';
import { createGameAccount, initialGameAccounts } from './game-accounts';

describe('game account fixtures', () => {
  it('matches the canonical Game Account schema', () => {
    for (const account of initialGameAccounts) {
      expect(v.safeParse(gameAccountSchema, account).success).toBe(true);
    }

    const generatedAccount = createGameAccount({ accountIdentifier: 'doctor schema', serverChannel: 'B服' });
    expect(v.safeParse(gameAccountSchema, generatedAccount).success).toBe(true);
  });

  it('keeps generated operator and task values within domain bounds', () => {
    for (const account of initialGameAccounts) {
      for (const operator of account.operators) {
        expect(operator.elite).toBeGreaterThanOrEqual(0);
        expect(operator.elite).toBeLessThanOrEqual(2);
        expect(operator.level).toBeLessThanOrEqual(operator.maxLevel);
      }

      for (const task of account.routineTasks) {
        const [current, target] = task.completionProgress;
        expect(current).toBeLessThanOrEqual(target);
        expect(task.isCompleted).toBe(current >= target);
      }

      for (const [itemId, quantity] of Object.entries(account.inventory)) {
        expect(itemId).toBeTruthy();
        expect(quantity).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('normalizes a newly linked account', () => {
    const account = createGameAccount({ accountIdentifier: '  doctor test  ', serverChannel: '官服' });

    expect(account.callsign).toBe('DOCTOR TEST');
    expect(account.server).toBe('官服 · 官方');
    expect(account.avatar).toBe('D');
    expect(account.operators).not.toHaveLength(0);
    expect(account.inventory['31034']).toBe(131);
  });
});
