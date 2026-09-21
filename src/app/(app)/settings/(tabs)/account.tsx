import { useUpdatePassword } from '@/features/auth';
import { useAppLogout } from '@/features/navigation';
import { AccountSettingsScreen, useQQBindingController } from '@/features/settings';
import { useAppStore } from '@/store';

export default function SettingsAccountRoute() {
  const session = useAppStore((state) => state.auth.session);
  const logout = useAppLogout();
  const updatePassword = useUpdatePassword();
  const qqBinding = useQQBindingController(session);

  if (!session) return null;

  return (
    <AccountSettingsScreen
      onLogout={logout}
      onUpdatePassword={updatePassword.mutateAsync}
      passwordUpdateError={updatePassword.error ?? null}
      passwordUpdateStatus={updatePassword.status}
      principal={session.principal}
      qqBinding={qqBinding}
    />
  );
}
