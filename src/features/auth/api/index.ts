import { MockAuthAdapter } from './auth-adapter.mock';

export type {
  AuthAdapter,
  AuthBusinessFailureCode,
  AuthFailure,
  AuthResult,
} from './auth-adapter';
export { MockAuthAdapter } from './auth-adapter.mock';

export const authApi = new MockAuthAdapter();
