import { createContext, useCallback, useContext, useState } from 'react';
import type { PropsWithChildren } from 'react';

type AuthState =
  | { status: 'unauthenticated'; session: null }
  | { status: 'authenticated'; session: { kind: 'mock' } };

type AuthContextValue = {
  authState: AuthState;
  signIn: () => void;
  signOut: () => void;
};

const unauthenticatedState: AuthState = { status: 'unauthenticated', session: null };
const authenticatedState: AuthState = { status: 'authenticated', session: { kind: 'mock' } };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [authState, setAuthState] = useState<AuthState>(unauthenticatedState);

  const signIn = useCallback(() => {
    setAuthState(authenticatedState);
  }, []);

  const signOut = useCallback(() => {
    setAuthState(unauthenticatedState);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authState,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used within an AuthProvider.');
  return auth;
}
