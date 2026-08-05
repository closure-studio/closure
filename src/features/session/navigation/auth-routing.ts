import type { Href } from 'expo-router';

import type { AuthState } from '../providers/auth-provider';

type PostLoginDestination = Extract<Href, string>;

const DEFAULT_POST_LOGIN_DESTINATION = '/dashboard/overview' satisfies PostLoginDestination;
const LOGIN_PATH = '/login';
const GROUPED_LOGIN_PATH = '/(auth)/login';

function isPostLoginDestination(pathname: string): pathname is PostLoginDestination {
  if (!pathname.startsWith('/') || pathname.startsWith('//')) return false;

  const [path = ''] = pathname.split(/[?#]/, 1);
  const pathWithoutTrailingSlash = path.replace(/\/+$/, '');
  return pathWithoutTrailingSlash !== LOGIN_PATH && pathWithoutTrailingSlash !== GROUPED_LOGIN_PATH;
}

export function resolvePostLoginDestination(
  returnTo: string | string[] | undefined,
): PostLoginDestination {
  if (typeof returnTo === 'string' && isPostLoginDestination(returnTo)) return returnTo;
  return DEFAULT_POST_LOGIN_DESTINATION;
}

export function resolveAuthEntryDestination(
  status: AuthState['status'],
): PostLoginDestination | null {
  if (status === 'checking') return null;
  if (status === 'authenticated') return DEFAULT_POST_LOGIN_DESTINATION;
  return LOGIN_PATH;
}
