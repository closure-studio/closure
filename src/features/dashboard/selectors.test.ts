import { selectBackdropTint } from './selectors';

const backdropTints = {
  primary: 'primary-token',
  warning: 'warning-token',
  muted: 'muted-token',
};

describe('dashboard selectors', () => {
  it('maps account tone through injected theme colors', () => {
    expect(selectBackdropTint({ color: 'warning' }, backdropTints)).toBe('warning-token');
    expect(selectBackdropTint(null, backdropTints)).toBe('muted-token');
  });
});
