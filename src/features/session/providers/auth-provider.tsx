import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

export type AuthState =
  | { status: 'checking'; session: null }
  | { status: 'unauthenticated'; session: null }
  | { status: 'authenticated'; session: { kind: 'mock' } };

type AuthContextValue = {
  authState: AuthState;
  signIn: () => void;
  signOut: () => void;
};

const checkingState: AuthState = { status: 'checking', session: null };
const unauthenticatedState: AuthState = { status: 'unauthenticated', session: null };
const authenticatedState: AuthState = { status: 'authenticated', session: { kind: 'mock' } };

const AuthContext = createContext<AuthContextValue | null>(null);

function restoreInitialAuthState(): Promise<AuthState> {
  return Promise.resolve(unauthenticatedState);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [authState, setAuthState] = useState<AuthState>(checkingState);

  useEffect(() => {
    let isActive = true;

    restoreInitialAuthState().then(
      (restoredAuthState) => {
        if (isActive) setAuthState(restoredAuthState);
      },
      (restorationError: unknown) => {
        console.error('Unable to restore the initial authentication state.', restorationError);
        if (isActive) setAuthState(unauthenticatedState);
      },
    );

    return () => {
      isActive = false;
    };
  }, []);

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
