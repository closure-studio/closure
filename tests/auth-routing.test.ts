import {
  resolveAuthEntryDestination,
  resolvePostLoginDestination,
} from '@/features/session';
import { mockActiveSession } from '@/mocks/auth';

describe('auth routing', () => {
  it('routes startup from auth according to the current session state', () => {
    expect(resolveAuthEntryDestination(null)).toBe('/login');
    expect(resolveAuthEntryDestination(mockActiveSession)).toBe('/dashboard');
  });

  it('accepts any internal destination without a route allowlist', () => {
    expect(resolvePostLoginDestination('/settings/network')).toBe('/settings/network');
    expect(resolvePostLoginDestination('/dashboard/operators?gameAccountId=G1')).toBe('/dashboard/operators?gameAccountId=G1');
    expect(resolvePostLoginDestination('/operators/doctor-7')).toBe('/operators/doctor-7');
    expect(resolvePostLoginDestination('/reports?range=week#summary')).toBe('/reports?range=week#summary');
  });

  it('falls back for missing, repeated, external, relative, or recursive destinations', () => {
    expect(resolvePostLoginDestination(undefined)).toBe('/dashboard');
    expect(resolvePostLoginDestination(['/settings/network'])).toBe('/dashboard');
    expect(resolvePostLoginDestination('https://example.com')).toBe('/dashboard');
    expect(resolvePostLoginDestination('//example.com/settings')).toBe('/dashboard');
    expect(resolvePostLoginDestination('../settings')).toBe('/dashboard');
    expect(resolvePostLoginDestination('/login')).toBe('/dashboard');
    expect(resolvePostLoginDestination('/login/')).toBe('/dashboard');
    expect(resolvePostLoginDestination('/login?returnTo=/settings')).toBe('/dashboard');
    expect(resolvePostLoginDestination('/(auth)/login')).toBe('/dashboard');
  });
});
