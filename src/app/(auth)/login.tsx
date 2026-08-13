import { Redirect, useLocalSearchParams } from 'expo-router';

import { AuthScreen } from '@/features/auth';
import { resolvePostLoginDestination } from '@/features/session';
import { useAppStore } from '@/store';

export default function LoginRoute() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const login = useAppStore((state) => state.login);
  const loginError = useAppStore((state) => state.auth.loginError);
  const loginStatus = useAppStore((state) => state.auth.loginStatus);
  const onPasswordRecovery = useAppStore((state) => state.requestPasswordRecovery);
  const onResetPasswordRecovery = useAppStore((state) => state.resetPasswordRecovery);
  const passwordRecoveryError = useAppStore((state) => state.auth.passwordRecoveryError);
  const passwordRecoveryStatus = useAppStore((state) => state.auth.passwordRecoveryStatus);
  const session = useAppStore((state) => state.auth.session);
  const destination = resolvePostLoginDestination(returnTo);

  if (session) return <Redirect href={destination} />;

  return (
    <AuthScreen
      isSubmitting={loginStatus === 'pending'}
      loginError={loginError}
      onLogin={login}
      onPasswordRecovery={onPasswordRecovery}
      onResetPasswordRecovery={onResetPasswordRecovery}
      passwordRecoveryError={passwordRecoveryError}
      passwordRecoveryStatus={passwordRecoveryStatus}
    />
  );
}
