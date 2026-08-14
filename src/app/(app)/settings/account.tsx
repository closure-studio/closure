import { useUpdatePassword } from '@/features/auth';
import { AccountSettingsScreen } from '@/features/settings';
import { useAppStore } from '@/store';

type OperationStatus = 'failed' | 'idle' | 'pending' | 'succeeded';

export default function SettingsAccountRoute() {
  const principal = useAppStore((state) => state.auth.session?.principal ?? null);
  const updatePassword = useUpdatePassword();
  const passwordUpdateStatus: OperationStatus = updatePassword.isPending
    ? 'pending'
    : updatePassword.isError
      ? 'failed'
      : updatePassword.isSuccess
        ? 'succeeded'
        : 'idle';

  if (!principal) return null;

  return (
    <AccountSettingsScreen
      onUpdatePassword={updatePassword.mutateAsync}
      passwordUpdateError={updatePassword.error ?? null}
      passwordUpdateStatus={passwordUpdateStatus}
      principal={principal}
    />
  );
}