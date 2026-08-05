export { SessionShell, useSessionBackdrop } from './components/session-shell';
export {
  getRouteScreenOptions,
  getScopeTransitionScreenOptions,
} from './navigation/route-transition';
export {
  AuthProvider,
  useAuth,
} from './providers/auth-provider';
export type { AuthState } from './providers/auth-provider';
export {
  resolveAuthEntryDestination,
  resolvePostLoginDestination,
} from './navigation/auth-routing';
