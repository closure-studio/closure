import { initialGameAccounts } from './mocks/game-accounts';
import { selectActiveGameAccount, selectBackdropTint } from './selectors';

const backdropTints = {
  primary: 'primary-token',
  warning: 'warning-token',
  muted: 'muted-token',
};

describe('dashboard selectors', () => {
  it('selects a matching account and falls back to the first account', () => {
    expect(selectActiveGameAccount(initialGameAccounts, 'acc-02').id).toBe('acc-02');
    expect(selectActiveGameAccount(initialGameAccounts, 'missing').id).toBe(initialGameAccounts[0].id);
  });

  it('rejects an empty account collection', () => {
    expect(() => selectActiveGameAccount([], 'missing')).toThrow('Dashboard requires at least one Game Account.');
  });

  it('maps account tone through injected theme colors', () => {
    expect(selectBackdropTint(initialGameAccounts[1], backdropTints)).toBe('warning-token');
  });
});
