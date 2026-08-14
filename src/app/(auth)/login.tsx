import { Redirect, useLocalSearchParams } from 'expo-router';

import { AuthScreen, useLogin, usePasswordRecovery } from '@/features/auth';
import { resolvePostLoginDestination } from '@/features/session';
import type { LoginSubmission } from '@/schemas/auth';
import { useAppStore } from '@/store';

export default function LoginRoute() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const login = useLogin();
  const passwordRecovery = usePasswordRecovery();
  const session = useAppStore((state) => state.auth.session);
  const destination = resolvePostLoginDestination(returnTo);

  if (session) return <Redirect href={destination} />;

  const handleLogin = (submission: LoginSubmission) => {
    return login.mutateAsync(submission).then(() => undefined);
  };

  return (
    <AuthScreen
      isSubmitting={login.isPending}
      loginError={login.error ?? null}
      onLogin={handleLogin}
      onPasswordRecovery={passwordRecovery.mutateAsync}
      onResetPasswordRecovery={passwordRecovery.reset}
      passwordRecoveryError={passwordRecovery.error ?? null}
      passwordRecoveryStatus={passwordRecovery.status}
    />
  );
}