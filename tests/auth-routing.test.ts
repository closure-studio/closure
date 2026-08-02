import {
  resolvePostLoginDestination,
} from '@/features/session';

describe('auth routing', () => {
  it('accepts any internal destination without a route allowlist', () => {
    expect(resolvePostLoginDestination('/settings/site')).toBe('/settings/site');
    expect(resolvePostLoginDestination('/dashboard/operators')).toBe('/dashboard/operators');
    expect(resolvePostLoginDestination('/operators/doctor-7')).toBe('/operators/doctor-7');
    expect(resolvePostLoginDestination('/reports?range=week#summary')).toBe('/reports?range=week#summary');
  });

  it('falls back for missing, repeated, external, relative, or recursive destinations', () => {
    expect(resolvePostLoginDestination(undefined)).toBe('/dashboard/overview');
    expect(resolvePostLoginDestination(['/settings/site'])).toBe('/dashboard/overview');
    expect(resolvePostLoginDestination('https://example.com')).toBe('/dashboard/overview');
    expect(resolvePostLoginDestination('//example.com/settings')).toBe('/dashboard/overview');
    expect(resolvePostLoginDestination('../settings')).toBe('/dashboard/overview');
    expect(resolvePostLoginDestination('/login')).toBe('/dashboard/overview');
    expect(resolvePostLoginDestination('/login/')).toBe('/dashboard/overview');
    expect(resolvePostLoginDestination('/login?returnTo=/settings')).toBe('/dashboard/overview');
    expect(resolvePostLoginDestination('/(auth)/login')).toBe('/dashboard/overview');
  });
});
