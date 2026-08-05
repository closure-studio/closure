import {
  resolveAuthEntryDestination,
  resolvePostLoginDestination,
} from '@/features/session';

describe('auth routing', () => {
  it('keeps startup inside auth until the session check resolves', () => {
    expect(resolveAuthEntryDestination('checking')).toBeNull();
    expect(resolveAuthEntryDestination('unauthenticated')).toBe('/login');
    expect(resolveAuthEntryDestination('authenticated')).toBe('/dashboard/overview');
  });

  it('accepts any internal destination without a route allowlist', () => {
    expect(resolvePostLoginDestination('/settings/network')).toBe('/settings/network');
    expect(resolvePostLoginDestination('/dashboard/operators')).toBe('/dashboard/operators');
    expect(resolvePostLoginDestination('/operators/doctor-7')).toBe('/operators/doctor-7');
    expect(resolvePostLoginDestination('/reports?range=week#summary')).toBe('/reports?range=week#summary');
  });

  it('falls back for missing, repeated, external, relative, or recursive destinations', () => {
    expect(resolvePostLoginDestination(undefined)).toBe('/dashboard/overview');
    expect(resolvePostLoginDestination(['/settings/network'])).toBe('/dashboard/overview');
    expect(resolvePostLoginDestination('https://example.com')).toBe('/dashboard/overview');
    expect(resolvePostLoginDestination('//example.com/settings')).toBe('/dashboard/overview');
    expect(resolvePostLoginDestination('../settings')).toBe('/dashboard/overview');
    expect(resolvePostLoginDestination('/login')).toBe('/dashboard/overview');
    expect(resolvePostLoginDestination('/login/')).toBe('/dashboard/overview');
    expect(resolvePostLoginDestination('/login?returnTo=/settings')).toBe('/dashboard/overview');
    expect(resolvePostLoginDestination('/(auth)/login')).toBe('/dashboard/overview');
  });
});
