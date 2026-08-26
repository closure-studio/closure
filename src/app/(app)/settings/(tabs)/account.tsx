import { useUpdatePassword } from '@/features/auth';
import { AccountSettingsScreen } from '@/features/settings';
import { useAppStore } from '@/store';

export default function SettingsAccountRoute() {
  const principal = useAppStore((state) => state.auth.session?.principal ?? null);
  const updatePassword = useUpdatePassword();

  if (!principal) return null;

  return (
    <AccountSettingsScreen
      onUpdatePassword={updatePassword.mutateAsync}
      passwordUpdateError={updatePassword.error ?? null}
      passwordUpdateStatus={updatePassword.status}
      principal={principal}
    />
  );
}
