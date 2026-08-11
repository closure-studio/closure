import { initialGameAccounts } from './mocks/game-accounts';
import { selectBackdropTint } from './selectors';

const backdropTints = {
  primary: 'primary-token',
  warning: 'warning-token',
  muted: 'muted-token',
};

describe('dashboard selectors', () => {
  it('maps account tone through injected theme colors', () => {
    expect(selectBackdropTint(initialGameAccounts[1], backdropTints)).toBe('warning-token');
  });
});
