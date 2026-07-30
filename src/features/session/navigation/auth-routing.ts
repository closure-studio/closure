import type { Href } from 'expo-router';

type PostLoginDestination = Extract<Href, string>;

const DEFAULT_POST_LOGIN_DESTINATION = '/' satisfies PostLoginDestination;
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
