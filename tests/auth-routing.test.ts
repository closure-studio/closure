import {
  resolvePostLoginDestination,
} from '@/features/session';

describe('auth routing', () => {
  it('accepts any internal destination without a route allowlist', () => {
    expect(resolvePostLoginDestination('/settings')).toBe('/settings');
    expect(resolvePostLoginDestination('/operators/doctor-7')).toBe('/operators/doctor-7');
    expect(resolvePostLoginDestination('/reports?range=week#summary')).toBe('/reports?range=week#summary');
  });

  it('falls back for missing, repeated, external, relative, or recursive destinations', () => {
    expect(resolvePostLoginDestination(undefined)).toBe('/');
    expect(resolvePostLoginDestination(['/settings'])).toBe('/');
    expect(resolvePostLoginDestination('https://example.com')).toBe('/');
    expect(resolvePostLoginDestination('//example.com/settings')).toBe('/');
    expect(resolvePostLoginDestination('../settings')).toBe('/');
    expect(resolvePostLoginDestination('/login')).toBe('/');
    expect(resolvePostLoginDestination('/login/')).toBe('/');
    expect(resolvePostLoginDestination('/login?returnTo=/settings')).toBe('/');
    expect(resolvePostLoginDestination('/(auth)/login')).toBe('/');
  });
});
